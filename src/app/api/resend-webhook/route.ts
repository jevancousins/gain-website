import { NextResponse } from "next/server";
import {
  findLeadsByEmail,
  findMembersByEmail,
  markLeadEmailBounced,
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
    to?: string[];
    created_at?: string;
    bounce?: { message?: string; type?: string; subType?: string };
  };
};

// Svix scheme, which Resend uses: the key is the base64 after "whsec_", the
// signature is base64 HMAC-SHA256 of "id.timestamp.body", and the header may
// carry several space-separated "v1,<sig>" entries during a key rotation.
// The earlier version keyed on the raw string and compared hex, so it could
// never match; it went unnoticed because the secret is not set in production.
async function verifySignature(
  signedContent: string,
  signatureHeader: string,
): Promise<boolean> {
  if (!RESEND_WEBHOOK_SECRET) return false;

  const secret = RESEND_WEBHOOK_SECRET.startsWith("whsec_")
    ? Uint8Array.from(atob(RESEND_WEBHOOK_SECRET.slice(6)), (c) => c.charCodeAt(0))
    : new TextEncoder().encode(RESEND_WEBHOOK_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return extractSignatures(signatureHeader).includes(expected);
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
    const valid = await verifySignature(signedContent, svixSignature);
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

  if (eventType === "email.bounced") {
    return handleBounce(payload);
  }

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

function extractSignatures(header: string): string[] {
  return header
    .split(" ")
    .map((part) => part.split(","))
    .filter(([version, sig]) => version === "v1" && sig)
    .map(([, sig]) => sig);
}

async function handleBounce(payload: ResendWebhookPayload) {
  const recipients = (payload.data.to ?? []).map((a) => a.toLowerCase());
  const bounce = payload.data.bounce;
  const reason =
    [bounce?.type, bounce?.message].filter(Boolean).join(": ") || "bounced";
  const at = payload.data.created_at ? new Date(payload.data.created_at) : new Date();

  let updated = 0;
  const errors: string[] = [];
  for (const email of recipients) {
    try {
      updated += await markLeadEmailBounced(email, at, reason);
    } catch (err) {
      const msg = `bounce ${email}: ${(err as Error).message}`;
      console.error(`[resend-webhook] ${msg}`);
      errors.push(msg);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }
  return NextResponse.json({ ok: true, event: "email.bounced", leadsUpdated: updated });
}
