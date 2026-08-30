import {
  fetchCancelledBookings,
  fetchUpcomingBookings,
  type CalAttendee,
  type CalBooking,
} from "@/lib/calcom";
import {
  markLeadConsultationBooked,
  markLeadConsultationCancelled,
} from "@/lib/notion-leads";
import { wantsDryRun } from "@/lib/cron-dry-run";

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
 * It also reconciles the Leads DB against the *whole* upcoming window, not just
 * tomorrow, so a lead who books stops sitting at New. That is a second job in
 * one route, and it lives here because this is already the only place that
 * reads Cal.com; it is deliberately non-fatal, so a Notion outage can never
 * cost someone their reminder.
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
  const dryRun = wantsDryRun(url);
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

    const leadSync = await syncLeadStatuses(bookings, dryRun);
    const cancellations = await handleCancellations(
      apiKey,
      bookings,
      now,
      dryRun,
      resendKey,
      fromEmail,
    );

    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      targetDate,
      totalUpcoming: bookings.length,
      due: due.length,
      sentCount: sent.length,
      sent,
      skipped,
      leadSync,
      cancellations,
    });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}

/**
 * Move every lead with a confirmed upcoming consultation to Consultation Booked.
 *
 * Runs over the full upcoming window rather than just tomorrow's bookings, so a
 * lead who books three weeks out is reflected on the board the next day instead
 * of the day before they turn up. Repeats are free: the promotion is gated on
 * the lead's current status, so a row already at Consultation Booked is skipped
 * without a write.
 *
 * Failures are swallowed per attendee and reported in `errors`. Reminders have
 * already been sent by this point, and no board-hygiene write is worth a 502
 * that makes the whole cron look dead.
 */
async function syncLeadStatuses(bookings: CalBooking[], dryRun: boolean) {
  const emails = [
    ...new Set(
      bookings
        .filter(
          (b) =>
            b.status === "accepted" &&
            (b.eventTypeSlug === CONSULTATION_SLUG || b.eventTypeSlug === null),
        )
        .flatMap((b) => b.attendees.map((a) => a.email))
        .filter(Boolean),
    ),
  ];

  if (dryRun) return { considered: emails.length, updated: 0, dryRun: true, errors: [] };

  let updated = 0;
  const errors: string[] = [];
  for (const email of emails) {
    try {
      updated += await markLeadConsultationBooked(email);
    } catch (err) {
      errors.push(`${email}: ${(err as Error).message}`.slice(0, 200));
    }
  }
  return { considered: emails.length, updated, dryRun: false, errors };
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

  // Copy + layout live in the published Resend template "gain-consultation-reminder";
  // we supply only the runtime variables it references. FIRST_NAME is a Resend
  // built-in; WHEN and MANAGE_URL are declared on the template.
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
      template: {
        id: "gain-consultation-reminder",
        variables: { FIRST_NAME: firstName, WHEN: when, MANAGE_URL: manageUrl },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

/** How far back a cancellation still counts as news worth acting on. */
const CANCELLATION_LOOKBACK_DAYS = 3;

/**
 * Catch consultations that were cancelled, put the lead back in the work queue
 * and tell Hallum, because nothing else in the system can.
 *
 * The gap this closes: `fetchUpcomingBookings` uses Cal.com's `status=upcoming`,
 * which excludes cancellations, and `markLeadConsultationBooked` only ever
 * promotes. Between them a cancelled consultation was invisible — the board went
 * on claiming a booking, no email went anywhere, and the only person who could
 * ring the lead never found out. Susan Wilson cancelled three hours before her
 * 21 Aug 2026 slot and it surfaced only because a human went looking.
 *
 * Window: only cancellations whose slot falls between CANCELLATION_LOOKBACK_DAYS
 * ago and the future. Cal.com keeps cancelled bookings forever, and re-reporting
 * a cancellation from July every morning would train Hallum to ignore the email.
 *
 * Reschedules: Cal.com implements a reschedule as cancel-then-rebook, so a lead
 * with a live accepted booking is skipped outright. Otherwise every reschedule
 * would demote the lead and send a false alarm.
 *
 * Non-fatal by design, like the lead sync above: reminders have already gone out
 * by this point and no board hygiene is worth a 502 that makes the cron look dead.
 */
async function handleCancellations(
  apiKey: string,
  upcoming: CalBooking[],
  now: Date,
  dryRun: boolean,
  resendKey: string | undefined,
  fromEmail: string | undefined,
) {
  const errors: string[] = [];
  let cancelled: CalBooking[] = [];
  try {
    cancelled = await fetchCancelledBookings(apiKey);
  } catch (err) {
    return { considered: 0, demoted: 0, notified: 0, errors: [(err as Error).message] };
  }

  const floor = new Date(now);
  floor.setUTCDate(floor.getUTCDate() - CANCELLATION_LOOKBACK_DAYS);

  // Anyone with a live booking is mid-reschedule, not lost.
  const stillBooked = new Set(
    upcoming
      .filter((b) => b.status === "accepted")
      .flatMap((b) => b.attendees.map((a) => a.email.toLowerCase())),
  );

  const recent = cancelled.filter(
    (b) =>
      (b.eventTypeSlug === CONSULTATION_SLUG || b.eventTypeSlug === null) &&
      new Date(b.start) >= floor &&
      b.attendees.some((a) => !stillBooked.has(a.email.toLowerCase())),
  );

  if (dryRun) {
    return {
      considered: recent.length,
      demoted: 0,
      notified: 0,
      dryRun: true,
      uids: recent.map((b) => b.uid),
      errors,
    };
  }

  let demoted = 0;
  let notified = 0;
  for (const booking of recent) {
    for (const attendee of booking.attendees) {
      if (stillBooked.has(attendee.email.toLowerCase())) continue;
      try {
        const rows = await markLeadConsultationCancelled(attendee.email, booking.start);
        demoted += rows;
        // Only tell Hallum when the board actually changed. A row already at
        // Contacted has been dealt with, and re-mailing it daily is noise.
        if (rows > 0 && resendKey && fromEmail) {
          await sendCancellationAlert(booking, attendee, resendKey, fromEmail);
          notified += 1;
        }
      } catch (err) {
        errors.push(`${attendee.email}: ${(err as Error).message}`.slice(0, 200));
      }
    }
  }

  return { considered: recent.length, demoted, notified, errors };
}

/**
 * Tell Hallum a consultation was cancelled. Internal only: this goes to
 * LEAD_NOTIFY_EMAIL, never to the lead. Deliberately plain HTML rather than a
 * Resend template, so an owner alert can never be caught by an unsubscribe or a
 * marketing audience the way a template send can.
 */
async function sendCancellationAlert(
  booking: CalBooking,
  attendee: CalAttendee,
  apiKey: string,
  from: string,
) {
  const notify = process.env.LEAD_NOTIFY_EMAIL;
  if (!notify) return;

  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(booking.start));
  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [notify],
      subject: `Consultation cancelled: ${attendee.name} — ${when}`,
      html:
        `<p style="font-weight:700;font-size:16px;margin-bottom:16px;">` +
        `${esc(attendee.name)} cancelled their consultation</p>` +
        `<p>It was booked for <strong>${esc(when)}</strong>, and they have not rebooked.</p>` +
        `<p>Email: ${esc(attendee.email)}</p>` +
        `<p>They enquired and booked themselves in, so they are worth a call. ` +
        `Their Leads row has been moved back to Contacted with this on the Next Action.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}
