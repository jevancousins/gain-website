import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveMx } from "node:dns/promises";
import { NEWSLETTER_CONSENT_TEXT_V1 } from "@/lib/utils";
import { escapeHtml } from "@/lib/email-shared";
import { upsertResendMarketingContact } from "@/lib/resend-contacts";

type LeadPayload = {
  firstName?: string;
  email?: string;
  phone?: string;
  newsletter?: string | boolean;
  source?: string;
  message?: string;
  // Per-ad attribution, captured from the landing-page URL (?ad=<id>).
  ad?: string;
  // Honeypot: a hidden field real users never fill. Any value means a bot.
  website?: string;
};

type FieldKey = "firstName" | "email" | "phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// After stripping separators: optional + then 7–15 digits. Covers E.164
// and every national landline / mobile format worth accepting.
const PHONE_RE = /^\+?[0-9]{7,15}$/;

function normalizePhone(raw: string) {
  return raw.replace(/[\s\-().]/g, "");
}

// A lead is a 6-week-programme enquiry when it comes from the /6-week landing
// page(s), which pass source="6-week-…". Everything else (the general contact
// form, etc.) is treated as a general enquiry.
function isSixWeekSource(source: string) {
  return source.toLowerCase().startsWith("6-week");
}

// General deliverability safeguard: does the email's domain actually accept
// mail? A missing MX record catches mistyped or fake domains (e.g. a truncated
// "…@hotmail.co") regardless of provider, which a format regex can't. This is
// deliberately NON-blocking — we never reject a lead on it (DNS can be slow or
// flaky and we must never drop a real enquiry); we only flag it so Hallum knows
// to verify the address rather than silently bouncing the confirmation. Returns
// true = domain accepts mail, false = it doesn't, null = couldn't tell.
async function domainAcceptsMail(email: string): Promise<boolean | null> {
  const domain = email.slice(email.lastIndexOf("@") + 1).trim();
  if (!domain) return null;
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("mx-timeout")), 2000),
      ),
    ]);
    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") return false;
    return null; // timeout or transient DNS error — unknown, don't flag
  }
}

function fieldError(field: FieldKey, message: string) {
  return NextResponse.json({ error: message, field }, { status: 400 });
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim().toLowerCase();
  const phoneRaw = (body.phone ?? "").toString().trim();
  const source = (body.source ?? "unknown").toString().trim();
  const message = (body.message ?? "").toString().trim();
  const newsletter = body.newsletter === true || body.newsletter === "on";
  // Attribution slug from the ad URL. Bounded and trimmed defensively; it comes
  // straight from the query string so we never trust its length. Persona is
  // resolved later by joining this slug to the Ads DB, not stored on the lead.
  const ad = (body.ad ?? "").toString().trim().slice(0, 100);

  // Honeypot: the form renders a hidden "website" field that is off-screen,
  // aria-hidden and non-tabbable, so a real person never sees or fills it.
  // Automated form spam fills every input it finds, so a non-empty value is a
  // bot. Silently accept and drop: return the exact success shape a genuine
  // submission gets (so the bot neither retries nor adapts), but skip the Notion
  // write, the confirmation email and the owner notification entirely, so the
  // spam never reaches Hallum's inbox or sends mail from our verified domain.
  // Checked before validation so a filled honeypot always short-circuits, even
  // when the other fields are junk.
  if ((body.website ?? "").toString().trim()) {
    return NextResponse.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
  }

  if (!firstName) {
    return fieldError("firstName", "Please enter your first name.");
  }
  if (!email || !EMAIL_RE.test(email)) {
    return fieldError("email", "Please enter a valid email address.");
  }
  const phone = normalizePhone(phoneRaw);
  if (!phone || !PHONE_RE.test(phone)) {
    return fieldError(
      "phone",
      "Please enter a valid phone number: digits only, with an optional + prefix."
    );
  }

  const lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    firstName,
    email,
    phone, // normalised E.164-ish
    phoneRaw, // preserve exactly what the user typed, for reference
    message,
    source,
    newsletter,
    ad,
    emailSuspect: false, // set below by the non-blocking MX check
    userAgent: request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? "",
  };

  // QA short-circuit: when the message contains the [QA-TEST] marker, accept
  // the request through validation but skip the Notion write and the
  // confirmation email. Lets the E2E test exercise the real route without
  // polluting the leads DB or sending real emails. The marker is specific
  // enough that no real submission will trip it.
  if (message.includes("[QA-TEST]")) {
    return NextResponse.json(
      { ok: true, id: lead.id, testMode: true },
      { status: 201 }
    );
  }

  // Flag (never block) enquiries whose email domain can't receive mail, so the
  // owner-notification and Notion row tell Hallum to double-check the address
  // instead of the confirmation silently bouncing. Unknown (null) is treated as
  // fine, so a slow/flaky DNS lookup never wrongly flags a real address.
  lead.emailSuspect = (await domainAcceptsMail(email)) === false;

  const tasks: Array<{ name: string; promise: Promise<void> }> = [];

  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_LEADS_DB_ID;
  if (notionToken && notionDbId) {
    tasks.push({ name: "notion", promise: writeLeadToNotion(lead, notionToken, notionDbId) });
  } else if (process.env.NODE_ENV !== "production") {
    tasks.push({ name: "jsonl", promise: writeLeadToJsonl(lead) });
  } else {
    console.log("[lead] captured", lead);
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.LEAD_FROM_EMAIL;
  const notifyEmail = process.env.LEAD_NOTIFY_EMAIL;
  if (resendKey && fromEmail) {
    tasks.push({
      name: "email",
      promise: sendLeadConfirmationEmail(lead, resendKey, fromEmail),
    });
    tasks.push({
      name: "resend-contact",
      promise: upsertResendMarketingContact(resendKey, {
        email: lead.email,
        firstName: lead.firstName,
        unsubscribed: !lead.newsletter,
        segmentNames: ["Marketing - All", "Leads - Open"],
      }).then(() => undefined),
    });
    // Notify Hallum the instant an enquiry lands so he can call back fast.
    // Reaches his inbox on laptop and phone; reply-to is set to the lead's
    // own address so he can respond to them directly from the notification.
    if (notifyEmail) {
      tasks.push({
        name: "notify",
        promise: sendOwnerNotificationEmail(lead, resendKey, fromEmail, notifyEmail),
      });
    }
  }

  if (tasks.length > 0) {
    const results = await Promise.allSettled(tasks.map((t) => t.promise));
    const rejections = results
      .map((r, i) => ({ result: r, name: tasks[i].name }))
      .filter((x): x is { result: PromiseRejectedResult; name: string } => x.result.status === "rejected");
    for (const { result, name } of rejections) {
      console.error(`[lead] ${name} failed`, result.reason, { leadId: lead.id });
    }
    // Lead is lost only if every task we attempted failed; tell the client we
    // received it but persistence is queued so they can still retry if needed.
    if (rejections.length === tasks.length) {
      return NextResponse.json({ ok: true, warning: "queued" }, { status: 202 });
    }
  }

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

async function writeLeadToJsonl(lead: Lead) {
  const dir = path.join(process.cwd(), ".data");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "leads.jsonl");
  await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
}

type Lead = {
  firstName: string;
  email: string;
  phone: string; // normalised E.164-ish, for tel: links
  phoneRaw: string;
  message: string;
  source: string;
  newsletter: boolean;
  ad: string; // ad slug from ?ad=, empty when the visit wasn't from a tracked ad
  emailSuspect: boolean; // true when the email's domain has no MX (likely mistyped)
  createdAt: string;
};

async function writeLeadToNotion(lead: Lead, token: string, databaseId: string) {
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: lead.firstName } }] },
    Email: { email: lead.email },
    Phone: { phone_number: lead.phoneRaw },
    Source: { select: { name: "Website" } },
    // Stamp every inbound enquiry as "New" so it lands in the pipeline's New
    // view rather than sitting at a blank status that only surfaces via the
    // owner-notification email.
    Status: { select: { name: "New" } },
    "Source Page": { rich_text: [{ text: { content: lead.source || "unknown" } }] },
    "First Contact": { date: { start: lead.createdAt } },
    Newsletter: { checkbox: lead.newsletter },
  };
  // An enquiry from the /6-week landing page is, by definition, interested in
  // the 6-Week Transformation — record that so the pipeline reflects real intent
  // instead of leaving Programme Interest blank.
  if (isSixWeekSource(lead.source)) {
    properties["Programme Interest"] = {
      select: { name: "6-Week Transformation" },
    };
  }
  if (lead.newsletter) {
    properties["Newsletter Consent Version"] = {
      rich_text: [{ text: { content: NEWSLETTER_CONSENT_TEXT_V1 } }],
    };
    properties["Newsletter Consent At"] = {
      date: { start: lead.createdAt },
    };
  }
  const noteParts: string[] = [];
  if (lead.emailSuspect) {
    noteParts.push(
      "⚠️ Email domain has no MX record — the address may be mistyped. Verify it before relying on email.",
    );
  }
  if (lead.message) {
    noteParts.push(lead.message);
  }
  if (noteParts.length > 0) {
    properties.Notes = {
      rich_text: [{ text: { content: noteParts.join("\n\n") } }],
    };
  }
  // Per-ad attribution: tag the lead with the ad slug from the landing-page URL
  // so the Ads DB can compute enquiry rate per ad (and per persona, via the
  // ad's persona mapping in the Ads DB). Only set when present, to keep organic
  // / untracked leads clean.
  if (lead.ad) {
    properties.Ad = { rich_text: [{ text: { content: lead.ad } }] };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Notion API ${res.status}: ${body}`);
  }
}

// The lead-confirmation email is a published Resend template (its copy, layout
// and signature are edited in Resend, not here — a single source of truth). We
// keep two templates so the confirmation matches where the enquiry came from:
//   - 6-week landing page (source starts "6-week"): programme-specific copy.
//   - general website enquiry (contact form, etc.): programme-agnostic copy, so
//     a general enquirer isn't told they "applied for the 6-week programme".
// route.ts only supplies the recipient and the FIRST_NAME greeting variable.
const CONFIRMATION_TEMPLATE_6WEEK = "gain-lead-confirmation-6-week";
const CONFIRMATION_TEMPLATE_GENERAL = "gain-lead-confirmation-general";
// Safety net: if a source-specific template is ever unavailable, fall back to
// the general confirmation so the enquirer still receives an email rather than
// nothing. (The original combined "enquiry-form" template was retired once both
// source-specific templates went live.)
const CONFIRMATION_TEMPLATE_FALLBACK: string =
  "gain-lead-confirmation-general";

function confirmationTemplateFor(source: string) {
  return isSixWeekSource(source)
    ? CONFIRMATION_TEMPLATE_6WEEK
    : CONFIRMATION_TEMPLATE_GENERAL;
}

function postConfirmationEmail(
  templateId: string,
  lead: Lead,
  apiKey: string,
  from: string,
) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      reply_to: "hallum@gainstrengththerapy.com",
      to: [lead.email],
      // All content — subject, body, branding, signature — lives in the
      // published Resend template; FIRST_NAME fills the greeting and subject.
      // Edit + republish in Resend; no code change needed.
      template: { id: templateId, variables: { FIRST_NAME: lead.firstName } },
    }),
  });
}

async function sendLeadConfirmationEmail(
  lead: Lead,
  apiKey: string,
  from: string,
) {
  const templateId = confirmationTemplateFor(lead.source);
  let res = await postConfirmationEmail(templateId, lead, apiKey, from);

  // Defensive: if the source-specific template is somehow unavailable, fall
  // back to the original combined template (kept published) so the enquirer
  // still gets a confirmation rather than nothing.
  if (
    !res.ok &&
    templateId !== CONFIRMATION_TEMPLATE_FALLBACK &&
    (res.status === 400 || res.status === 404 || res.status === 422)
  ) {
    console.warn(
      `[lead] confirmation template "${templateId}" unavailable (${res.status}); falling back to "${CONFIRMATION_TEMPLATE_FALLBACK}"`,
      { source: lead.source },
    );
    res = await postConfirmationEmail(
      CONFIRMATION_TEMPLATE_FALLBACK,
      lead,
      apiKey,
      from,
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

// Plain, scannable alert to Hallum so he can act on a new lead from his phone
// lock screen or inbox. Reply-to is the lead's address, so hitting reply mails
// the enquirer directly.
async function sendOwnerNotificationEmail(
  lead: Lead,
  apiKey: string,
  from: string,
  to: string,
) {
  const safeName = escapeHtml(lead.firstName);
  const safeEmail = escapeHtml(lead.email);
  const safePhone = escapeHtml(lead.phoneRaw);
  // Normalised (E.164-ish) number for the tel: link so tap-to-call works
  // reliably from the notification; the visible text keeps what they typed.
  const telPhone = escapeHtml(lead.phone || lead.phoneRaw);
  const safeSource = escapeHtml(lead.source || "unknown");
  const safeMessage = lead.message ? escapeHtml(lead.message) : null;
  const time = new Date(lead.createdAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  });

  const textLines = [
    `New enquiry from ${lead.firstName}`,
    ...(lead.emailSuspect
      ? [
          "",
          "⚠ Heads up: this email address may be mistyped — its domain does not accept mail. Call them; do not rely on email.",
        ]
      : []),
    "",
    `Name: ${lead.firstName}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phoneRaw}`,
    `Source: ${lead.source || "unknown"}`,
    `Time: ${time}`,
  ];
  if (lead.message) {
    textLines.push("", `Message: ${lead.message}`);
  }
  textLines.push(
    "",
    `Reply to this email to reach ${lead.firstName} directly at ${lead.email}.`,
  );
  const text = textLines.join("\n");

  const messageRow = safeMessage
    ? `<tr><td style="padding:6px 0;color:#666;">Message</td><td style="padding:6px 0;">${safeMessage}</td></tr>`
    : "";

  const warningHtml = lead.emailSuspect
    ? `<p style="background:#fff4ec; border:1px solid #FC832C; color:#0a0a0a; padding:10px 12px; border-radius:6px; font-size:13px; margin:0 0 16px;"><strong>Check this email address.</strong> Its domain doesn&rsquo;t accept mail, so the confirmation may have bounced &mdash; call ${safeName} rather than relying on email.</p>`
    : "";

  const html = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0a; line-height: 1.6; max-width: 480px; margin: 0 auto; padding: 24px;">
${warningHtml}
<p style="font-weight:700; font-size:16px; margin-bottom:16px;">New enquiry from ${safeName}</p>
<table style="width:100%; border-collapse:collapse; font-size:14px;">
<tr><td style="padding:6px 0; color:#666; width:80px;">Name</td><td style="padding:6px 0;">${safeName}</td></tr>
<tr><td style="padding:6px 0; color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#FC832C;">${safeEmail}</a></td></tr>
<tr><td style="padding:6px 0; color:#666;">Phone</td><td style="padding:6px 0;"><a href="tel:${telPhone}" style="color:#FC832C;">${safePhone}</a></td></tr>
<tr><td style="padding:6px 0; color:#666;">Source</td><td style="padding:6px 0;">${safeSource}</td></tr>
<tr><td style="padding:6px 0; color:#666;">Time</td><td style="padding:6px 0;">${escapeHtml(time)}</td></tr>
${messageRow}
</table>
<p style="margin-top:20px; font-size:13px; color:#666;">Reply to this email to reach ${safeName} directly.</p>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      reply_to: lead.email,
      to: [to],
      subject: `New enquiry: ${lead.firstName} — ${lead.phoneRaw}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend notify API ${res.status}: ${body}`);
  }
}
