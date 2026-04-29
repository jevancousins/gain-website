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

/**
 * Fetch the most-recent attended event date for each customer.
 *
 * Uses ?status=attended&expand=event so each row carries the event date
 * inline; one paginated walk replaces ~hundreds of individual lookups.
 */
export async function fetchLastAttendedByCustomer(maxPages = 10): Promise<Map<number, string>> {
  const lastByCustomer = new Map<number, string>();

  let path: string | null = "/attendances";
  let pages = 0;

  while (path && pages < maxPages) {
    const page: AttendanceListPage = await teamupGet<AttendanceListPage>(
      path,
      pages === 0 ? { query: { limit: 100, status: "attended" }, expand: ["event"] } : {},
    );

    for (const a of page.results) {
      if (a.status !== "attended") continue;
      const cid = Number(a.customer);
      if (!Number.isFinite(cid)) continue;
      const ev = a.event as ExpandedEvent;
      const dateStr = (ev && typeof ev === "object" ? ev.starts_at : undefined) ?? undefined;
      if (!dateStr) continue;
      const day = dateStr.slice(0, 10);
      const prior = lastByCustomer.get(cid);
      if (!prior || day > prior) lastByCustomer.set(cid, day);
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

  return lastByCustomer;
}
