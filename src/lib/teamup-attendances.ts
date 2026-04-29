import { teamupGet } from "@/lib/teamup";

type ExpandedEvent = {
  id: number | string;
  starts_at?: string;
  ends_at?: string;
};

type Attendance = {
  customer: number | string;
  event: number | string | ExpandedEvent;
  status: string;
};

type AttendanceListPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Attendance[];
};

// In TeamUp, Hallum does not manually mark "attended"; sessions stay
// in "registered" status after the event has passed. So a registered
// attendance whose event has already started counts as a real session.
// Late-cancelled registrations are excluded (member did not attend).
const SESSION_STATUSES = new Set(["registered", "attended"]);

export type AttendanceSummary = {
  lastSession: string | null;
  sessionCount: number;
};

/**
 * Walk every paginated /attendances row to compute the most-recent
 * registered/attended event date and total session count per customer.
 *
 * The TeamUp API ignores client-supplied ordering, so we must scan the full
 * data set (~2000 records for Gain). Pagination uses the `next` URL.
 */
export async function fetchAttendanceSummaryByCustomer(
  maxPages = 60,
): Promise<Map<number, AttendanceSummary>> {
  const summaries = new Map<number, AttendanceSummary>();
  const nowISO = new Date().toISOString();

  let path: string | null = "/attendances";
  let pages = 0;

  while (path && pages < maxPages) {
    const page: AttendanceListPage = await teamupGet<AttendanceListPage>(
      path,
      pages === 0 ? { query: { limit: 100 }, expand: ["event"] } : {},
    );

    for (const a of page.results) {
      if (!SESSION_STATUSES.has(a.status)) continue;
      const cid = Number(a.customer);
      if (!Number.isFinite(cid)) continue;
      const ev = a.event as ExpandedEvent;
      const startedAt = ev && typeof ev === "object" ? ev.starts_at : undefined;
      if (!startedAt) continue;
      // Only count past events (registrations for future classes don't represent
      // an attended session).
      if (startedAt > nowISO) continue;

      const day = startedAt.slice(0, 10);
      const prior = summaries.get(cid);
      if (!prior) {
        summaries.set(cid, { lastSession: day, sessionCount: 1 });
      } else {
        prior.sessionCount += 1;
        if (!prior.lastSession || day > prior.lastSession) prior.lastSession = day;
      }
    }

    if (!page.next) break;
    try {
      const parsed: URL = new URL(page.next);
      path = parsed.pathname.replace(/^\/api\/v2/, "") + parsed.search;
    } catch {
      break;
    }
    pages += 1;
  }

  return summaries;
}

// Backward-compatible export so the existing sync still imports cleanly.
export async function fetchLastAttendedByCustomer(maxPages = 60): Promise<Map<number, string>> {
  const summaries = await fetchAttendanceSummaryByCustomer(maxPages);
  const map = new Map<number, string>();
  for (const [cid, s] of summaries.entries()) {
    if (s.lastSession) map.set(cid, s.lastSession);
  }
  return map;
}
