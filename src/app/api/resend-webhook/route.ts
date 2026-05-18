import { NextResponse } from "next/server";
import {
  findLeadsByEmail,
  findMembersByEmail,
  patchNotionPage,
} from "@/lib/notion-leads";

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? "";

type ResendWebhookPayload = {
  type: string;
  data: {
    id?: string;
    email?: string;
    unsubscribed?: boolean;
    unsubscribe_reason?: string;
  };
};

async function verifySignature(
  body: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!RESEND_WEBHOOK_SECRET || !signatureHeader) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RESEND_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatureHeader === expected;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (RESEND_WEBHOOK_SECRET) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
    }

    const timestampSeconds = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampSeconds) > 300) {
      return NextResponse.json({ error: "Timestamp too old" }, { status: 401 });
    }

    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const valid = await verifySignature(signedContent, extractSignature(svixSignature));
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.type;
  const email = payload.data?.email?.toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: true, skipped: "no email" });
  }

  const isUnsubscribe =
    eventType === "contact.deleted" ||
    (eventType === "contact.updated" && payload.data.unsubscribed === true);

  if (!isUnsubscribe) {
    return NextResponse.json({ ok: true, skipped: "not an unsubscribe event" });
  }

  const nowIso = new Date().toISOString();
  const reason = payload.data.unsubscribe_reason || null;

  const unsubProps: Record<string, unknown> = {
    Newsletter: { checkbox: false },
    "Newsletter Unsubscribed At": { date: { start: nowIso } },
  };
  if (reason) {
    unsubProps["Newsletter Unsubscribe Reason"] = { select: { name: reason } };
  }

  const errors: string[] = [];

  try {
    const leads = await findLeadsByEmail(email);
    for (const lead of leads) {
      await patchNotionPage(lead.pageId, unsubProps);
    }
  } catch (err) {
    const msg = `leads: ${(err as Error).message}`;
    console.error(`[resend-webhook] ${msg}`);
    errors.push(msg);
  }

  try {
    const members = await findMembersByEmail(email);
    for (const member of members) {
      await patchNotionPage(member.pageId, unsubProps);
    }
  } catch (err) {
    const msg = `members: ${(err as Error).message}`;
    console.error(`[resend-webhook] ${msg}`);
    errors.push(msg);
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email, event: eventType });
}

function extractSignature(header: string): string | null {
  const parts = header.split(" ");
  for (const part of parts) {
    const [version, sig] = part.split(",");
    if (version === "v1" && sig) return sig;
  }
  return null;
}
