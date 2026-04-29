/**
 * TeamUp webhook receiver.
 *
 * TeamUp's M2M apps can be configured with a webhook URL that receives
 * real-time event notifications (customer.created, membership.changed,
 * attendance recorded, etc.). The exact payload shape and signing scheme
 * are confirmed per-app when TeamUp support enables webhooks for the
 * application.
 *
 * Until we have the spec from TeamUp, this receiver:
 * - Accepts any POST and returns 200 quickly so TeamUp doesn't retry-storm
 * - Verifies a shared secret (TEAMUP_WEBHOOK_SECRET) if set, either via
 *   X-TeamUp-Signature header or an Authorization: Bearer header
 * - Logs the full payload to Vercel function logs so we can see what
 *   TeamUp sends and design the routing
 * - Routes recognised events to placeholder handlers; everything else
 *   falls through with a "no handler" log
 */

type IncomingEvent = {
  type?: string;
  event?: string;
  object?: string;
  data?: unknown;
};

function verifySignature(request: Request): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.TEAMUP_WEBHOOK_SECRET;
  if (!expected) return { ok: true }; // signing optional until TeamUp provides one

  const sigHeader = request.headers.get("x-teamup-signature") ?? "";
  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const provided = sigHeader || bearer;
  if (provided !== expected) {
    return { ok: false, reason: "signature mismatch" };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  const verified = verifySignature(request);
  if (!verified.ok) {
    console.warn("[teamup webhook] rejected:", verified.reason);
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: IncomingEvent;
  try {
    payload = (await request.json()) as IncomingEvent;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const eventType = payload.type ?? payload.event ?? payload.object ?? "unknown";
  console.info("[teamup webhook] received", { eventType, payload });

  try {
    await routeEvent(eventType, payload);
  } catch (err) {
    // Always return 200 so TeamUp doesn't retry-storm; surface failures in logs.
    console.error("[teamup webhook] handler error:", (err as Error).message);
  }

  return Response.json({ ok: true, eventType });
}

async function routeEvent(eventType: string, payload: IncomingEvent): Promise<void> {
  const norm = eventType.toLowerCase();

  // Customer + lead events trigger a Notion sync downstream.
  if (norm.includes("customer") && norm.includes("created")) {
    console.info("[teamup webhook] customer.created — TODO: write to Notion Leads DB");
    return;
  }
  if (norm.includes("membership") && (norm.includes("created") || norm.includes("started"))) {
    console.info("[teamup webhook] membership.created — TODO: refresh Notion Members row");
    return;
  }
  if (norm.includes("membership") && (norm.includes("cancelled") || norm.includes("ended"))) {
    console.info("[teamup webhook] membership.cancelled — TODO: flag in Notion Members + log churn reason");
    return;
  }
  if (norm.includes("attendance") || norm.includes("registration")) {
    console.info("[teamup webhook] attendance event — TODO: update Last Session in Notion");
    return;
  }

  console.info("[teamup webhook] no handler for event type:", eventType);
}

export async function GET() {
  // Useful for verifying the route is reachable without firing a handler.
  return Response.json({
    ok: true,
    receiver: "teamup-webhook",
    signed: Boolean(process.env.TEAMUP_WEBHOOK_SECRET),
  });
}
