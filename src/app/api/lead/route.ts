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
  if (resendKey && fromEmail) {
    tasks.push({
      name: "email",
      promise: sendLeadConfirmationEmail(lead, resendKey, fromEmail),
    });
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

  const text = [
    `Hi ${lead.firstName},`,
    "",
    "Thanks for getting in touch with Gain Strength Therapy. We've received your enquiry and Hallum will be in touch soon to arrange a short phone call. If it sounds like a good fit, we'll invite you in to see the studio and meet your coach.",
    "",
    `If you need us sooner, give us a call on ${phone}.`,
    "",
    "Speak soon,",
    "Hallum Cousins",
    "Gain Strength Therapy",
    url,
  ].join("\n");

  const html = `<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; line-height: 1.5; max-width: 540px; margin: 0 auto; padding: 24px;">
<p>Hi ${safeName},</p>
<p>Thanks for getting in touch with <strong>Gain Strength Therapy</strong>. We&rsquo;ve received your enquiry and Hallum will be in touch soon to arrange a short phone call. If it sounds like a good fit, we&rsquo;ll invite you in to see the studio and meet your coach.</p>
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
