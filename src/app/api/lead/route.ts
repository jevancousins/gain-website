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

  try {
    const notionToken = process.env.NOTION_TOKEN;
    const notionDbId = process.env.NOTION_LEADS_DB_ID;
    if (notionToken && notionDbId) {
      await writeLeadToNotion(lead, notionToken, notionDbId);
    } else if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), ".data");
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, "leads.jsonl");
      await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
    } else {
      console.log("[lead] captured", lead);
    }
  } catch (err) {
    // Never lose the lead if Notion is down: log loudly so it can be replayed
    // from Vercel logs, and tell the user we received it.
    console.error("[lead] persistence error", err, { lead });
    return NextResponse.json({ ok: true, warning: "queued" }, { status: 202 });
  }

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

type Lead = {
  firstName: string;
  email: string;
  phoneRaw: string;
  message: string;
  source: string;
  newsletter: boolean;
};

async function writeLeadToNotion(lead: Lead, token: string, databaseId: string) {
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: lead.firstName } }] },
    Email: { email: lead.email },
    Phone: { phone_number: lead.phoneRaw },
    Source: { select: { name: lead.source || "unknown" } },
    Newsletter: { checkbox: lead.newsletter },
  };
  if (lead.message) {
    properties.Message = { rich_text: [{ text: { content: lead.message } }] };
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
