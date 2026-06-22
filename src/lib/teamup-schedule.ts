import { teamupGet } from "@/lib/teamup";

/**
 * Forward-looking schedule feed for Hallum's TeamUp account.
 *
 * Why this exists: TeamUp's "2-Way Calendar Sync" only pulls Google events in
 * to block availability, and the "1-Way feed" export to Google lags ~24h. To
 * give Claude / the Gain Command Centre a real-time, bookable view of the
 * schedule we read it straight from the TeamUp API instead of the Google
 * calendar bridge.
 *
 * The `/events` endpoint quirks we work around here (confirmed against the live
 * API, June 2026): it ignores every date/ordering/limit filter we tried, always
 * returns 100 events per page in ascending `starts_at` order, and exposes events
 * pre-generated months ahead. We therefore locate the forward window by
 * binary-searching the page list rather than walking from page 1.
 */

type RawEvent = {
  id: number | string;
  name: string;
  starts_at: string;
  ends_at?: string;
  status: string;
  max_occupancy: number | null;
  attending_count: number | null;
  waiting_count?: number | null;
  is_appointment: boolean;
  is_full?: boolean;
  schedule_type?: string;
  provider_url?: string;
  customer_url?: string;
};

type EventPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawEvent[];
};

export type ScheduleItem = {
  id: number | string;
  name: string;
  type: "class" | "appointment";
  /** ISO timestamp exactly as TeamUp records it (carries the venue's offset). */
  startsAt: string;
  endsAt: string | null;
  /** Local wall-clock day at the venue, e.g. "Mon". */
  dayOfWeek: string;
  /** Local wall-clock start, e.g. "18:00". */
  startTime: string;
  status: string;
  attending: number;
  capacity: number | null;
  waiting: number;
  isFull: boolean;
  /** Provider-side TeamUp URL for the event (for managing / booking). */
  manageUrl: string | null;
};

export type UpcomingSchedule = {
  generatedAt: string;
  from: string;
  to: string;
  count: number;
  items: ScheduleItem[];
};

const PAGE_SIZE = 100;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Pull the local wall-clock day/time out of the timestamp without UTC
 * conversion, matching how Hallum reads his timetable (BST 18:00 stays 18:00).
 */
function localParts(startsAt: string): { dayOfWeek: string; startTime: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(startsAt);
  if (!m) return { dayOfWeek: "", startTime: "" };
  const [, y, mo, d, hh, mm] = m;
  const dayOfWeek = DAY_NAMES[new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d))).getUTCDay()];
  return { dayOfWeek, startTime: `${hh}:${mm}` };
}

async function getPage(page: number): Promise<EventPage> {
  return teamupGet<EventPage>("/events", { query: { page } });
}

/**
 * Binary-search for the earliest page whose last event starts at/after `fromMs`.
 * Pages are ascending by absolute start instant, so the forward window begins on
 * the first page whose tail reaches `fromMs`.
 */
async function findStartPage(fromMs: number, totalPages: number): Promise<number> {
  let lo = 1;
  let hi = totalPages;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const page = await getPage(mid);
    const last = page.results[page.results.length - 1];
    if (last && Date.parse(last.starts_at) < fromMs) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function toItem(ev: RawEvent): ScheduleItem {
  const { dayOfWeek, startTime } = localParts(ev.starts_at);
  return {
    id: ev.id,
    name: ev.name,
    type: ev.is_appointment ? "appointment" : "class",
    startsAt: ev.starts_at,
    endsAt: ev.ends_at ?? null,
    dayOfWeek,
    startTime,
    status: ev.status,
    attending: ev.attending_count ?? 0,
    capacity: ev.max_occupancy ?? null,
    waiting: ev.waiting_count ?? 0,
    isFull: Boolean(ev.is_full),
    manageUrl: ev.provider_url ? `https://goteamup.com${ev.provider_url}` : null,
  };
}

/**
 * Return every active class and 1-to-1 appointment starting within the next
 * `daysAhead` days, in chronological order. Read-only and real-time.
 */
export async function fetchUpcomingSchedule(daysAhead = 14, maxItems = 250): Promise<UpcomingSchedule> {
  const now = new Date();
  const fromMs = now.getTime();
  const toMs = fromMs + daysAhead * 86_400_000;

  const first = await getPage(1);
  const total = first.count ?? first.results.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startPage = await findStartPage(fromMs, totalPages);

  const items: ScheduleItem[] = [];
  for (let p = startPage; p <= totalPages; p += 1) {
    const page = await getPage(p);
    let done = false;
    for (const ev of page.results) {
      if (!ev.starts_at) continue;
      const t = Date.parse(ev.starts_at);
      if (Number.isNaN(t) || t < fromMs) continue;
      if (t > toMs) {
        done = true;
        break;
      }
      if (ev.status && ev.status !== "active") continue; // skip cancelled / non-active
      items.push(toItem(ev));
      if (items.length >= maxItems) {
        done = true;
        break;
      }
    }
    if (done) break;
  }

  items.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  return {
    generatedAt: new Date().toISOString(),
    from: now.toISOString(),
    to: new Date(toMs).toISOString(),
    count: items.length,
    items,
  };
}
