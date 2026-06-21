import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SITE, NEWSLETTER_CONSENT_TEXT_V1 } from "@/lib/utils";
import { escapeHtml } from "@/lib/email-shared";

type LeadPayload = {
  firstName?: string;
  email?: string;
  phone?: string;
  newsletter?: string | boolean;
  source?: string;
  message?: string;
  // Per-ad attribution, captured from the landing-page URL (?ad=<id>).
  ad?: string;
};

type FieldKey = "firstName" | "email" | "phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// After stripping separators: optional + then 7–15 digits. Covers E.164
// and every national landline / mobile format worth accepting.
const PHONE_RE = /^\+?[0-9]{7,15}$/;

function normalizePhone(raw: string) {
  return raw.replace(/[\s\-().]/g, "");
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
  createdAt: string;
};

async function writeLeadToNotion(lead: Lead, token: string, databaseId: string) {
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: lead.firstName } }] },
    Email: { email: lead.email },
    Phone: { phone_number: lead.phoneRaw },
    Source: { select: { name: "Website" } },
    "Source Page": { rich_text: [{ text: { content: lead.source || "unknown" } }] },
    "First Contact": { date: { start: lead.createdAt } },
    Newsletter: { checkbox: lead.newsletter },
  };
  if (lead.newsletter) {
    properties["Newsletter Consent Version"] = {
      rich_text: [{ text: { content: NEWSLETTER_CONSENT_TEXT_V1 } }],
    };
    properties["Newsletter Consent At"] = {
      date: { start: lead.createdAt },
    };
  }
  if (lead.message) {
    properties.Notes = { rich_text: [{ text: { content: lead.message } }] };
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

const PROGRAMME_ITEMS = [
  { label: "Small group, individually adapted", body: "Up to 6 people train together, with exercises adapted to each person's level. Part of every session is dedicated to individualised work based on your goals." },
  { label: "Two phases", body: "Weeks 1–3: learning techniques and building consistency. Weeks 4–6: adding load and seeing measurable strength changes. We test at the start and re-test at the end." },
  { label: "Flexible frequency", body: "One, two or three sessions a week. We'll agree what fits during your consultation." },
  { label: "No lock-in afterwards", body: "Most members move to a monthly direct debit. No contract, no automatic rollover; you decide each month." },
];


async function sendLeadConfirmationEmail(
  lead: Lead,
  apiKey: string,
  from: string,
) {
  const safeName = escapeHtml(lead.firstName);
  const phone = SITE.phone;
  const phoneHref = SITE.phoneHref;
  const url = SITE.url;
  const bookingUrl = SITE.bookingUrl;

  const textParts = [
    `Hi ${lead.firstName},`,
    "",
  ];
  textParts.push(
    "Thanks for your message. I wanted to reply quickly so you know we've received it and what the next step is.",
    "",
    `Your free consultation takes up to 30 minutes and can be over the phone or in person at the gym. If you'd like to book a specific time, you can do that here: ${bookingUrl}`,
    "",
    "Otherwise, I'll give you a ring within two working days on the number you shared.",
    "",
    "---------------------------------------",
    "A few things worth knowing before we meet",
    "---------------------------------------",
    "",
    ...PROGRAMME_ITEMS.map((item, i) => `${i + 1}. ${item.label}: ${item.body}`),
    "",
    "---------------------------------------",
    "Preparing for your consultation",
    "---------------------------------------",
    "",
    "I'll ask three things: what you want from training, any health or injury background I should know about, and what would feel like meaningful progress in six weeks. It's worth thinking about that last one before we speak.",
    "",
    "If the programme doesn't seem right for you, I'll be honest about that. This isn't a sales conversation.",
    "",
    "Reply to this email any time if something comes up before we speak.",
    "",
    "Speak soon,",
    "Hallum",
    "",
    "Gain Strength Therapy",
    "Dursley Rd, Eastbourne, BN22 8DJ",
    `${phone} · ${url}`,
  );
  const text = textParts.join("\n");

  const programmeHtml = PROGRAMME_ITEMS
    .map((item, i) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
<tr>
<td style="width: 32px; vertical-align: top; padding-top: 2px;"><span style="display: inline-block; width: 24px; height: 24px; background: #FC832C; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">${i + 1}</span></td>
<td style="padding-left: 12px;"><strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.body)}</td>
</tr>
</table>`)
    .join("\n");

  const html = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0a; line-height: 1.7; max-width: 540px; margin: 0 auto; padding: 24px;">
<div style="display: none; max-height: 0; overflow: hidden;">Here&rsquo;s what to expect before your consultation.&#847;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<p>Hi ${safeName},</p>
<p>Thanks for your message. I wanted to reply quickly so you know we&rsquo;ve received it and what the next step is.</p>
<p>Your free consultation takes up to 30 minutes and can be over the phone or in person at the gym. If you&rsquo;d like to book a specific time:</p>
<p style="margin: 20px 0;"><a href="${bookingUrl}" style="display: inline-block; background: #FC832C; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">Book your consultation</a></p>
<p>Otherwise, I&rsquo;ll give you a ring within two working days on the number you shared.</p>
<hr style="border: none; border-top: 2px solid #FC832C; margin: 28px 0 20px; width: 40px;">
<p style="font-weight: 700; font-size: 15px; color: #0a0a0a; margin-bottom: 16px;">A few things worth knowing before we meet</p>
${programmeHtml}
<hr style="border: none; border-top: 2px solid #FC832C; margin: 28px 0 20px; width: 40px;">
<p style="font-weight: 700; font-size: 15px; color: #0a0a0a; margin-bottom: 8px;">Preparing for your consultation</p>
<p>I&rsquo;ll ask three things: what you want from training, any health or injury background I should know about, and what would feel like meaningful progress in six weeks. It&rsquo;s worth thinking about that last one before we speak.</p>
<p>If the programme doesn&rsquo;t seem right for you, I&rsquo;ll be honest about that. This isn&rsquo;t a sales conversation.</p>
<p>Reply to this email any time if something comes up before we speak.</p>
<p>Speak soon,<br>Hallum</p>
<p style="font-size: 12px; color: #666; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">Gain Strength Therapy<br>Dursley Rd, Eastbourne, BN22 8DJ<br><a href="tel:${phoneHref}" style="color: #666;">${phone}</a> &middot; <a href="${url}" style="color: #666;">${url.replace(/^https?:\/\//, "")}</a></p>
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
      reply_to: "hallum@gainstrengththerapy.com",
      to: [lead.email],
      subject: `Got your message, ${lead.firstName}`,
      html,
      text,
    }),
  });

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

  const html = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0a; line-height: 1.6; max-width: 480px; margin: 0 auto; padding: 24px;">
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
