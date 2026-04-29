import { teamupGet } from "@/lib/teamup";

type Event = {
  id: number | string;
  name: string;
  starts_at: string;
  ends_at?: string;
  status: string;
  max_occupancy: number | null;
  attending_count: number | null;
  is_appointment: boolean;
};

type EventListPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
};

export type SessionSlot = {
  /** Lookup key: "Mon 18:00" / "Wed 06:00" etc. */
  slotKey: string;
  /** Day of week as a long string. */
  dayOfWeek: string;
  /** HH:MM (24h, UTC start time as recorded in TeamUp). */
  startTime: string;
  /** Sessions seen in the window with their occupancy snapshot. */
  occurrences: Array<{ date: string; attending: number; capacity: number }>;
  /** Mean attendance across recorded occurrences. */
  averageAttending: number;
  /** Capacity used for the most recent occurrence. */
  capacity: number;
  /** Sample event name, for display. */
  sampleName: string;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * TeamUp returns starts_at like "2024-04-08T18:00:00+01:00". The HH:MM
 * before the timezone offset is the local wall-clock time at the venue,
 * which is what Hallum thinks in. We parse that out directly to avoid
 * UTC conversion artefacts (e.g. BST 18:00 turning into UTC 17:00).
 */
function parseLocalDateTime(startsAt: string): { dayOfWeek: string; hhmm: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(startsAt);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  const dayOfWeek = DAY_NAMES[date.getUTCDay()];
  return { dayOfWeek, hhmm: `${hh}:${mm}` };
}

export async function fetchSessionFillByWeek(
  daysBack: number,
  maxPages = 30,
): Promise<SessionSlot[]> {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - daysBack);
  const cutoffISO = cutoffDate.toISOString();
  const todayISO = new Date().toISOString();

  const events: Event[] = [];
  let path: string | null = "/events";
  let pages = 0;

  // Walk forward and stop once we're past today (no point paginating through
  // future events for a fill-rate calculation).
  while (path && pages < maxPages) {
    const page: EventListPage = await teamupGet<EventListPage>(
      path,
      pages === 0 ? { query: { limit: 100 } } : {},
    );
    let stop = false;
    for (const ev of page.results) {
      if (!ev.starts_at) continue;
      if (ev.is_appointment) continue; // 1-to-1 PT, not group sessions
      if (ev.starts_at < cutoffISO) continue;
      if (ev.starts_at > todayISO) {
        stop = true;
        continue;
      }
      events.push(ev);
    }
    if (stop && events.length > 100) break; // we've passed the relevant window
    if (!page.next) break;
    try {
      const parsed: URL = new URL(page.next);
      path = parsed.pathname.replace(/^\/api\/v2/, "") + parsed.search;
    } catch {
      break;
    }
    pages += 1;
  }

  // Group by (day-of-week, HH:MM) using TeamUp's local wall-clock time
  const slots = new Map<string, SessionSlot>();
  for (const ev of events) {
    const parsed = parseLocalDateTime(ev.starts_at);
    if (!parsed) continue;
    const { dayOfWeek: dow, hhmm: startTime } = parsed;
    const slotKey = `${dow} ${startTime}`;
    if (!slots.has(slotKey)) {
      slots.set(slotKey, {
        slotKey,
        dayOfWeek: dow,
        startTime,
        occurrences: [],
        averageAttending: 0,
        capacity: ev.max_occupancy ?? 6,
        sampleName: ev.name,
      });
    }
    const slot = slots.get(slotKey)!;
    slot.occurrences.push({
      date: ev.starts_at.slice(0, 10),
      attending: ev.attending_count ?? 0,
      capacity: ev.max_occupancy ?? slot.capacity,
    });
    slot.capacity = ev.max_occupancy ?? slot.capacity;
  }

  for (const slot of slots.values()) {
    if (slot.occurrences.length === 0) continue;
    slot.averageAttending =
      slot.occurrences.reduce((sum, o) => sum + o.attending, 0) / slot.occurrences.length;
  }

  return Array.from(slots.values()).sort((a, b) => b.averageAttending - a.averageAttending);
}

export type SessionExpansionResult = {
  windowDays: number;
  threshold: number; // attendance count, e.g. 5 of 6
  slotsAtThreshold: SessionSlot[];
  allSlots: SessionSlot[];
};

/**
 * Identify session slots that meet the expansion trigger: average
 * attendance >= threshold across at least 2 occurrences in the window.
 */
export async function detectExpansionTriggers(
  windowDays = 14,
  threshold = 5,
): Promise<SessionExpansionResult> {
  const allSlots = await fetchSessionFillByWeek(windowDays);
  const slotsAtThreshold = allSlots.filter(
    (s) => s.occurrences.length >= 2 && s.averageAttending >= threshold,
  );
  return { windowDays, threshold, slotsAtThreshold, allSlots };
}
