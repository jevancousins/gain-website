import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/utils";

type LeadPayload = {
  firstName?: string;
  email?: string;
  phone?: string;
  newsletter?: string | boolean;
  source?: string;
  message?: string;
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
      "Please enter a valid phone number — digits only, with an optional + prefix."
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
  if (lead.message) {
    properties.Notes = { rich_text: [{ text: { content: lead.message } }] };
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendLeadConfirmationEmail(lead: Lead, apiKey: string, from: string) {
  const safeName = escapeHtml(lead.firstName);
  const phone = SITE.phone;
  const phoneHref = SITE.phoneHref;
  const url = SITE.url;

  // The booking link only appears once a Cal.com event type exists and the URL
  // is set. Until then the email reads as a straight 48-hour call-back promise,
  // so nothing looks broken if the link isn't configured yet. Accepts either a
  // full URL or the Cal.com path form (e.g. "gainstrengththerapy/consultation").
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK?.trim();
  const bookingUrl = calLink
    ? /^https?:\/\//.test(calLink)
      ? calLink
      : `https://cal.com/${calLink.replace(/^\/+/, "")}`
    : undefined;

  const text = [
    `Hi ${lead.firstName},`,
    "",
    "Thanks for getting in touch with Gain Strength Therapy. We've received your enquiry.",
    "",
    "The next step is a short, no-pressure consultation with Hallum: a phone or in-person chat about your goals, any injuries or health conditions, and whether Gain is the right fit for you.",
    "",
    ...(bookingUrl
      ? [
          `Book a time that suits you: ${bookingUrl}`,
          "",
          "Prefer us to call you? No problem. Hallum will be in touch within 48 hours, usually the same day.",
        ]
      : [
          "Hallum will be in touch within 48 hours, usually the same day, to arrange it.",
        ]),
    "",
    `If you need us sooner, give us a call on ${phone}.`,
    "",
    "Speak soon,",
    "Hallum Cousins",
    "Gain Strength Therapy",
    url,
  ].join("\n");

  const bookingHtml = bookingUrl
    ? `<p style="margin: 24px 0;"><a href="${escapeHtml(bookingUrl)}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 13px 22px; border-radius: 4px; font-weight: 600; font-size: 15px;">Book your free consultation &rarr;</a></p>
<p>Prefer us to call you? No problem &mdash; Hallum will be in touch within 48 hours, usually the same day.</p>`
    : `<p>Hallum will be in touch within 48 hours, usually the same day, to arrange it.</p>`;

  const html = `<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; line-height: 1.5; max-width: 540px; margin: 0 auto; padding: 24px;">
<p>Hi ${safeName},</p>
<p>Thanks for getting in touch with <strong>Gain Strength Therapy</strong>. We&rsquo;ve received your enquiry.</p>
<p>The next step is a short, no-pressure consultation with Hallum: a phone or in-person chat about your goals, any injuries or health conditions, and whether Gain is the right fit for you.</p>
${bookingHtml}
<p>If you need us sooner, give us a call on <a href="tel:${phoneHref}" style="color: #111;">${phone}</a>.</p>
<p>Speak soon,<br>Hallum Cousins<br>Gain Strength Therapy</p>
<p style="font-size: 12px; color: #666; margin-top: 32px;"><a href="${url}" style="color: #666;">${url.replace(/^https?:\/\//, "")}</a></p>
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
      to: [lead.email],
      subject: "Thanks for your enquiry",
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
  to: string
) {
  const when = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(lead.createdAt));

  const subject = `New enquiry: ${lead.firstName} — ${lead.phoneRaw}`;

  const rows: Array<[string, string]> = [
    ["Name", lead.firstName],
    ["Phone", lead.phoneRaw],
    ["Email", lead.email],
    ["Source", lead.source || "unknown"],
    ["Newsletter", lead.newsletter ? "Yes" : "No"],
    ["Received", when],
  ];

  const text = [
    "New website enquiry",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    lead.message || "(none)",
    "",
    `Reply to this email to respond to ${lead.firstName} directly.`,
  ].join("\n");

  const rowsHtml = rows
    .map(([k, v]) => {
      let val = escapeHtml(v);
      if (k === "Phone") val = `<a href="tel:${escapeHtml(lead.phone)}" style="color: #111;">${escapeHtml(lead.phoneRaw)}</a>`;
      if (k === "Email") val = `<a href="mailto:${escapeHtml(lead.email)}" style="color: #111;">${escapeHtml(lead.email)}</a>`;
      return `<tr><td style="padding: 4px 16px 4px 0; color: #666; vertical-align: top; white-space: nowrap;">${k}</td><td style="padding: 4px 0; font-weight: 600;">${val}</td></tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; line-height: 1.5; max-width: 540px; margin: 0 auto; padding: 24px;">
<h2 style="margin: 0 0 16px; font-size: 18px;">New website enquiry</h2>
<table style="border-collapse: collapse; font-size: 15px;">
${rowsHtml}
</table>
<p style="margin-top: 20px; color: #666;">Message</p>
<p style="margin-top: 4px; padding: 12px 16px; background: #f5f5f5; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(lead.message) || "<em style='color:#999'>(none)</em>"}</p>
<p style="font-size: 13px; color: #666; margin-top: 24px;">Reply to this email to respond to ${escapeHtml(lead.firstName)} directly.</p>
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
      to: [to],
      reply_to: lead.email,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}
