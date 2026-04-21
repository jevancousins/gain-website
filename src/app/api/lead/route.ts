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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim().toLowerCase();
  const phone = (body.phone ?? "").toString().trim();
  const source = (body.source ?? "unknown").toString().trim();
  const message = (body.message ?? "").toString().trim();
  const newsletter = body.newsletter === true || body.newsletter === "on";

  if (!firstName) return NextResponse.json({ error: "First name required" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    firstName,
    email,
    phone,
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
