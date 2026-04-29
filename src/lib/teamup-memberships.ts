import { teamupGet } from "@/lib/teamup";

type CustomerMembership = {
  id: number | string;
  name: string;
  status: string;
  customer: number | string;
  start_date: string | null;
  expiration_date: string | null;
  renewal_date: string | null;
  is_set_for_cancellation?: boolean;
};

type CustomerMembershipPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerMembership[];
};

export type MembershipSummary = {
  /** The active membership name (TeamUp programme name), if any. */
  activeName: string | null;
  /** Most recent status across history (active / cancelled / expired / etc.). */
  latestStatus: string | null;
  /** Expiration date of the active membership if one exists. */
  expiresAt: string | null;
  /** True if there has ever been any membership row, active or historical. */
  hasHistory: boolean;
};

const ACTIVE_STATUSES = new Set(["active"]);

/**
 * Walk paginated /customer_memberships to build a per-customer summary
 * of their current programme and membership history.
 */
export async function fetchMembershipSummaryByCustomer(
  maxPages = 30,
): Promise<Map<number, MembershipSummary>> {
  // Capture every membership row, then resolve to a per-customer summary in
  // memory. The dataset is small (~100 rows) so this is cheap.
  type RowsByCustomer = Map<number, CustomerMembership[]>;
  const rowsByCustomer: RowsByCustomer = new Map();

  let path: string | null = "/customer_memberships";
  let pages = 0;

  while (path && pages < maxPages) {
    const page: CustomerMembershipPage = await teamupGet<CustomerMembershipPage>(
      path,
      pages === 0 ? { query: { limit: 100 } } : {},
    );

    for (const m of page.results) {
      const cid = Number(m.customer);
      if (!Number.isFinite(cid)) continue;
      if (!rowsByCustomer.has(cid)) rowsByCustomer.set(cid, []);
      rowsByCustomer.get(cid)!.push(m);
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

  const out = new Map<number, MembershipSummary>();
  for (const [cid, rows] of rowsByCustomer.entries()) {
    // Active row: status=active; pick the one with latest start_date as the canonical programme.
    const activeRows = rows
      .filter((r) => ACTIVE_STATUSES.has(r.status.toLowerCase()))
      .sort((a, b) => (a.start_date ?? "") < (b.start_date ?? "") ? 1 : -1);
    const active = activeRows[0] ?? null;

    // Latest row by start_date for status fallback.
    const latest = [...rows]
      .sort((a, b) => (a.start_date ?? "") < (b.start_date ?? "") ? 1 : -1)[0] ?? null;

    out.set(cid, {
      activeName: active?.name ?? null,
      latestStatus: latest?.status ?? null,
      expiresAt: active?.expiration_date ?? null,
      hasHistory: rows.length > 0,
    });
  }

  return out;
}
