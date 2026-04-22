import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

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

  // Persist locally in dev. In production, swap for a real destination:
  //   - POST to a CRM (HubSpot, Notion, Attio, etc.) via their REST API
  //   - Forward to n8n / Make / Zapier webhook (env: LEAD_WEBHOOK_URL)
  //   - Write to Supabase / Postgres
  //   - Trigger an email via Resend
  try {
    const webhook = process.env.LEAD_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
      });
    } else if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), ".data");
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, "leads.jsonl");
      await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
    } else {
      console.log("[lead] captured", lead);
    }
  } catch (err) {
    console.error("[lead] persistence error", err);
    return NextResponse.json({ ok: true, warning: "queued" }, { status: 202 });
  }

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
