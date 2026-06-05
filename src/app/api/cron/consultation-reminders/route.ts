import { fetchUpcomingBookings, type CalAttendee, type CalBooking } from "@/lib/calcom";
import { SITE } from "@/lib/utils";

/**
 * Sends a "your consultation is tomorrow" reminder for Cal.com bookings, gated
 * on the booking's live status so a CANCELLED booking can never be reminded.
 * This replaces Cal.com's native workflow reminder (which has a bug where
 * cancelled bookings still get reminded) — turn that workflow off in the
 * Cal.com dashboard once this is live.
 *
 * Design: runs once daily and reminds every confirmed booking whose start
 * falls on *tomorrow* (Europe/London date). Each booking's date is "tomorrow"
 * on exactly one daily run, so each gets exactly one reminder, with no stored
 * state needed. Cancellations are reflected immediately because status is read
 * live from the Cal.com API at send time.
 *
 * Manual check: GET /api/cron/consultation-reminders?key=<CRON_SECRET>&dryRun=true
 */

const CONSULTATION_SLUG = process.env.CALCOM_EVENT_SLUG ?? "consultation";
const TZ = "Europe/London";

function gate(request: Request): boolean {
  const expected = [process.env.CRON_SECRET, process.env.TEAMUP_DIAG_KEY].filter(
    (v): v is string => Boolean(v),
  );
  if (expected.length === 0) return false;
  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  return expected.includes(provided);
}

/** YYYY-MM-DD for an instant, in a given IANA timezone. */
function ymdInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Tomorrow's calendar date in `timeZone`, robust against DST/offset flips. */
function tomorrowYmd(now: Date, timeZone: string): string {
  const today = ymdInTz(now, timeZone);
  // Anchor at noon UTC so adding a day never crosses a date boundary by accident.
  const anchor = new Date(`${today}T12:00:00Z`);
  anchor.setUTCDate(anchor.getUTCDate() + 1);
  return ymdInTz(anchor, timeZone);
}

export async function GET(request: Request) {
  if (!gate(request)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const apiKey = process.env.CALCOM_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "CALCOM_API_KEY not set" }, { status: 500 });
  }
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.LEAD_FROM_EMAIL;

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const now = new Date();
  const targetDate = tomorrowYmd(now, TZ);

  const startedAt = Date.now();
  try {
    const bookings = await fetchUpcomingBookings(apiKey);

    // Only confirmed consultations happening tomorrow. Anything cancelled,
    // pending or rejected is excluded here — the core fix.
    const due = bookings.filter(
      (b) =>
        b.status === "accepted" &&
        (b.eventTypeSlug === CONSULTATION_SLUG || b.eventTypeSlug === null) &&
        ymdInTz(new Date(b.start), TZ) === targetDate,
    );

    const sent: string[] = [];
    const skipped: { uid: string; reason: string }[] = [];

    for (const b of due) {
      const attendee = b.attendees[0];
      if (!attendee) {
        skipped.push({ uid: b.uid, reason: "no attendee email" });
        continue;
      }
      if (dryRun) {
        skipped.push({ uid: b.uid, reason: "dryRun" });
        continue;
      }
      if (!resendKey || !fromEmail) {
        skipped.push({ uid: b.uid, reason: "email not configured" });
        continue;
      }
      await sendReminderEmail(b, attendee, resendKey, fromEmail);
      sent.push(b.uid);
    }

    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      targetDate,
      totalUpcoming: bookings.length,
      due: due.length,
      sentCount: sent.length,
      sent,
      skipped,
    });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
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

async function sendReminderEmail(
  booking: CalBooking,
  attendee: CalAttendee,
  apiKey: string,
  from: string,
) {
  const firstName = attendee.name.split(/\s+/)[0] || "there";
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(booking.start));
  const manageUrl = `https://cal.com/booking/${booking.uid}`;

  const text = [
    `Hi ${firstName},`,
    "",
    "A quick reminder that your free consultation with Gain Strength Therapy is tomorrow:",
    "",
    `${when} (UK time)`,
    "",
    "It takes no more than 30 minutes, by phone or in person at the gym, as you booked.",
    "",
    `Need to change it? You can reschedule or cancel here: ${manageUrl}`,
    "",
    "Speak soon,",
    "Hallum",
    "",
    "Gain Strength Therapy",
    `${SITE.address.line1}, ${SITE.address.city}, ${SITE.address.postcode}`,
    SITE.phone,
  ].join("\n");

  const safeName = escapeHtml(firstName);
  const safeWhen = escapeHtml(when);
  const html = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0a; line-height: 1.7; max-width: 540px; margin: 0 auto; padding: 24px;">
<p>Hi ${safeName},</p>
<p>A quick reminder that your free consultation with Gain Strength Therapy is tomorrow:</p>
<p style="font-weight: 700; font-size: 17px; margin: 20px 0;">${safeWhen} <span style="font-weight: 400; color: #666;">(UK time)</span></p>
<p>It takes no more than 30 minutes, by phone or in person at the gym, as you booked.</p>
<p style="margin: 20px 0;"><a href="${manageUrl}" style="display: inline-block; background: #FC832C; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Reschedule or cancel</a></p>
<p>Speak soon,<br>Hallum</p>
<p style="font-size: 12px; color: #666; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">Gain Strength Therapy<br>${SITE.address.line1}, ${SITE.address.city}, ${SITE.address.postcode}<br><a href="tel:${SITE.phoneHref}" style="color: #666;">${SITE.phone}</a></p>
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
      to: [attendee.email],
      subject: "Reminder: your Gain consultation is tomorrow",
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}
