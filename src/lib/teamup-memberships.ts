import { teamupGet } from "@/lib/teamup";
import { programmeLengthDays } from "@/lib/onboarding-emails";

type CustomerMembership = {
  id: number | string;
  name: string;
  status: string;
  customer: number | string;
  start_date: string | null;
  expiration_date: string | null;
  renewal_date: string | null;
  is_set_for_cancellation?: boolean;
  active_hold?: unknown;
};

type CustomerMembershipPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerMembership[];
};

/**
 * The member's current finite 6/12-week programme, if they are on one. Drives the
 * mid-programme check-in (onboarding email 6). Anchored to the TeamUp membership,
 * not the customer join date. A member on only an open-ended membership (monthly,
 * PT, class pack) has `programme: null` and never gets the check-in.
 */
export type ProgrammeMembership = {
  /** TeamUp customer_membership row id (the dedup + accumulator anchor). */
  membershipId: string;
  name: string;
  /** Nominal programme length: 42 (6-week) or 84 (12-week). */
  lengthDays: number;
  /** Membership start date (YMD); the programme anchor. */
  startDate: string;
  /** Live status: "active", "hold" (paused), etc. */
  status: string;
  /** True when the programme is currently paused (TeamUp status "hold"). */
  isPaused: boolean;
  expiresAt: string | null;
  renewalDate: string | null;
  isSetForCancellation: boolean;
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
  /** The member's current 6/12-week programme, or null. Additive; does not affect
   *  activeName/latestStatus/expiresAt, which the members sync still relies on. */
  programme: ProgrammeMembership | null;
  /**
   * Start date (YMD) of a 6/12-week programme the member holds that has NOT begun
   * yet, or null. `programme` deliberately excludes future starts because the
   * mid-programme check-in counts active training days and cannot start early.
   * The onboarding drip needs the opposite: it anchors emails 1-5 to the day the
   * member actually begins, so it must see the future start.
   *
   * Karen Marshall bought on 26 Jul 2026 with a start of 10 Aug. Anchored to the
   * purchase date she would have received "how's your first week going?" two weeks
   * before her first session.
   */
  upcomingProgrammeStart: string | null;
};

const ACTIVE_STATUSES = new Set(["active"]);
// A programme membership is still "in play" (kept for the check-in) while active
// OR paused; excluded once cancelled/completed. A paused programme must stay
// visible so the cron can defer the check-in rather than lose the member.
const PROGRAMME_LIVE_STATUSES = new Set(["active", "hold"]);

/** Today as YMD in Europe/London (matches the cron's day math). */
function todayLondonYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Pick the member's current 6/12-week programme from their membership rows, or
 * null. Keeps only rows that classify as a 6/12-week programme, are active or
 * paused, and have already started; among those picks the latest start_date so a
 * re-take or upgrade anchors to the newest instance deterministically.
 */
function selectProgramme(
  rows: CustomerMembership[],
  todayYmd: string,
): ProgrammeMembership | null {
  const candidates = rows.filter((r) => {
    const len = programmeLengthDays(r.name);
    if (len === null) return false;
    if (!PROGRAMME_LIVE_STATUSES.has((r.status ?? "").toLowerCase())) return false;
    if (!r.start_date || r.start_date > todayYmd) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  const chosen = candidates.sort((a, b) =>
    (a.start_date ?? "") < (b.start_date ?? "") ? 1 : -1,
  )[0];
  const lengthDays = programmeLengthDays(chosen.name)!;
  return {
    membershipId: String(chosen.id),
    name: chosen.name,
    lengthDays,
    startDate: chosen.start_date as string,
    status: chosen.status,
    // "hold" is the confirmed pause signal in the live data. active_hold could
    // refine this once its shape is verified against a real held fixed-term row.
    isPaused: (chosen.status ?? "").toLowerCase() === "hold",
    expiresAt: chosen.expiration_date ?? null,
    renewalDate: chosen.renewal_date ?? null,
    isSetForCancellation: Boolean(chosen.is_set_for_cancellation),
  };
}

/**
 * Earliest start date of a 6/12-week programme the member holds that has not begun
 * yet, or null. The mirror of `selectProgramme`'s `start_date > todayYmd` exclusion.
 * Earliest rather than latest, so a member who has bought consecutive blocks anchors
 * to the one they are about to start.
 */
function selectUpcomingProgrammeStart(
  rows: CustomerMembership[],
  todayYmd: string,
): string | null {
  const starts = rows
    .filter((r) => {
      if (programmeLengthDays(r.name) === null) return false;
      if (!PROGRAMME_LIVE_STATUSES.has((r.status ?? "").toLowerCase())) return false;
      return Boolean(r.start_date) && (r.start_date as string) > todayYmd;
    })
    .map((r) => r.start_date as string)
    .sort();
  return starts[0] ?? null;
}

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

  const todayYmd = todayLondonYmd();
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
      programme: selectProgramme(rows, todayYmd),
      upcomingProgrammeStart: selectUpcomingProgrammeStart(rows, todayYmd),
    });
  }

  return out;
}
