/**
 * Cal.com API v2 helpers.
 *
 * We send our own consultation reminders rather than relying on Cal.com's
 * native workflow reminders. Cal.com has a long-standing bug where a reminder
 * can still be sent for a booking that was cancelled well in advance (the
 * scheduled send is not always recalled). To guarantee that never happens, we
 * fetch bookings from the live API and gate every reminder on the booking's
 * current status at send time: anything cancelled, rejected or pending is
 * skipped. See src/app/api/cron/consultation-reminders/route.ts.
 *
 * Once these reminders are live, the Cal.com workflow reminder for the
 * consultation event type should be turned off in the Cal.com dashboard so
 * attendees do not receive two reminders (and never the buggy one).
 */

const CALCOM_API = "https://api.cal.com/v2";
// Pinned API version: Cal.com requires the cal-api-version header on v2.
const CALCOM_API_VERSION = "2024-08-13";

export type CalAttendee = {
  name: string;
  email: string;
  timeZone?: string;
};

export type CalBooking = {
  uid: string;
  title: string;
  /** Lower-cased Cal.com status: "accepted" | "pending" | "cancelled" | "rejected". */
  status: string;
  /** ISO start timestamp. */
  start: string;
  end: string;
  eventTypeSlug: string | null;
  attendees: CalAttendee[];
};

type RawBooking = {
  uid?: string;
  title?: string;
  status?: string;
  start?: string;
  end?: string;
  eventType?: { slug?: string } | null;
  attendees?: { name?: string; email?: string; timeZone?: string }[];
};

/**
 * Fetch upcoming (future, non-cancelled) bookings for the account that owns
 * the API key. Always hits the live API with no caching so booking status is
 * never stale. Throws on a non-2xx response.
 */
/** Shared request + mapping for any bookings query. Throws on a non-2xx. */
async function fetchBookings(apiKey: string, query: string): Promise<CalBooking[]> {
  const res = await fetch(`${CALCOM_API}/bookings?${query}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": CALCOM_API_VERSION,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cal.com API ${res.status}: ${body}`);
  }

  const json = (await res.json()) as { data?: RawBooking[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  return rows
    .filter((b): b is RawBooking & { uid: string; start: string } =>
      Boolean(b && b.uid && b.start),
    )
    .map((b) => ({
      uid: b.uid,
      title: b.title ?? "Consultation",
      status: (b.status ?? "").toLowerCase(),
      start: b.start,
      end: b.end ?? b.start,
      eventTypeSlug: b.eventType?.slug ?? null,
      attendees: (b.attendees ?? [])
        .filter((a): a is { email: string } & typeof a => Boolean(a.email))
        .map((a) => ({
          name: a.name?.trim() || "there",
          email: a.email,
          timeZone: a.timeZone,
        })),
    }));
}

/**
 * Fetch upcoming (future, non-cancelled) bookings for the account that owns
 * the API key. Always hits the live API with no caching so booking status is
 * never stale. Throws on a non-2xx response.
 */
export async function fetchUpcomingBookings(apiKey: string): Promise<CalBooking[]> {
  return fetchBookings(apiKey, "status=upcoming&take=100&sortStart=asc");
}

/**
 * Fetch cancelled bookings, newest first.
 *
 * This exists because `status=upcoming` EXCLUDES cancellations, so a route that
 * reads only upcoming bookings cannot tell "never booked" from "booked and then
 * cancelled". That blind spot is exactly how Susan Wilson's cancellation on
 * 21 Aug 2026 left her Leads row reading Consultation Booked for a consultation
 * that never happened, with no signal anywhere that a warm lead had gone quiet.
 */
export async function fetchCancelledBookings(apiKey: string): Promise<CalBooking[]> {
  return fetchBookings(apiKey, "status=cancelled&take=100&sortStart=desc");
}
