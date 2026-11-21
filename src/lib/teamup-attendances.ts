import { teamupGet } from "@/lib/teamup";

type ExpandedEvent = {
  id: number | string;
  name?: string;
  starts_at?: string;
  ends_at?: string;
  is_appointment?: boolean;
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
  /**
   * Sorted, de-duplicated days of past GROUP sessions: appointments and the 1-to-1
   * induction excluded. The onboarding emails are timed from the first of these on
   * or after a member's programme start, because that is when training begins.
   */
  groupSessionDays: string[];
};

/**
 * A group class rather than a 1-to-1. The induction may be booked as an
 * appointment or as a one-place class, so it is excluded by name as well.
 */
export function isGroupSession(ev: { name?: string; is_appointment?: boolean }): boolean {
  if (ev.is_appointment) return false;
  return !/induction|consultation|1-2-1|1-to-1|personal training/i.test(ev.name ?? "");
}

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
      let prior = summaries.get(cid);
      if (!prior) {
        prior = { lastSession: day, sessionCount: 1, groupSessionDays: [] };
        summaries.set(cid, prior);
      } else {
        prior.sessionCount += 1;
        if (!prior.lastSession || day > prior.lastSession) prior.lastSession = day;
      }
      if (isGroupSession(ev)) prior.groupSessionDays.push(day);
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

  for (const s of summaries.values()) {
    s.groupSessionDays = [...new Set(s.groupSessionDays)].sort();
  }
  return summaries;
}

/** The first group session on or after a date, or null if they have not had one. */
export function firstGroupSessionOnOrAfter(
  summary: AttendanceSummary | null | undefined,
  fromYmd: string,
): string | null {
  return summary?.groupSessionDays.find((d) => d >= fromYmd) ?? null;
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
