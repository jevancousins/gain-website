import type { TeamupCustomer } from "@/lib/teamup-customers";
import { fetchAttendanceSummaryByCustomer } from "@/lib/teamup-attendances";
import {
  fetchMembershipSummaryByCustomer,
  type MembershipSummary,
} from "@/lib/teamup-memberships";
import { copyConsentFromLeadToMember, markLeadConverted } from "@/lib/notion-leads";
import { MID_PROGRAMME_EMAIL_INDEX } from "@/lib/onboarding-emails";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const NOTION_STATUS_OPTIONS = ["Trial", "Active", "Paused", "Lapsed", "Cancelled"] as const;
type NotionStatus = (typeof NOTION_STATUS_OPTIONS)[number];

const NOTION_SOURCE_OPTIONS = ["Instagram", "Referral", "Website", "Walk-in", "Google", "Other"] as const;
type NotionSource = (typeof NOTION_SOURCE_OPTIONS)[number];

const NOTION_MEMBERSHIP_TYPES = ["Class Pack", "Monthly Unlimited", "PT Only", "Trial", "Other"] as const;
type NotionMembershipType = (typeof NOTION_MEMBERSHIP_TYPES)[number];

function notionConfig() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_MEMBERS_DB_ID;
  if (!token) throw new Error("NOTION_TOKEN not set");
  if (!dbId) throw new Error("NOTION_MEMBERS_DB_ID not set");
  return { token, dbId };
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

/**
 * Display name for a TeamUp customer. Used both when writing the Notion Name
 * and when disambiguating shared-email family accounts during the migration
 * fallback (see findExisting).
 */
function customerName(c: TeamupCustomer): string {
  return [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.email || `TeamUp #${c.id}`;
}

function mapMembershipStatus(membership: MembershipSummary | undefined): NotionStatus | null {
  if (!membership || !membership.hasHistory) return null;
  if (membership.activeName) {
    const name = membership.activeName.toLowerCase();
    if (/(trial|foundations|strength boost|fix|6.?week|12.?week|30.?day|movement)/.test(name)) {
      return "Trial";
    }
    return "Active";
  }
  const latest = (membership.latestStatus ?? "").toLowerCase();
  if (latest.includes("hold") || latest.includes("paused")) return "Paused";
  if (latest.includes("cancel")) return "Cancelled";
  if (latest.includes("expire") || latest.includes("ended") || latest.includes("lapsed")) return "Lapsed";
  return "Lapsed";
}

function mapMembershipType(activeName: string | null): NotionMembershipType | null {
  if (!activeName) return null;
  const n = activeName.toLowerCase();
  if (/personal training|\bpt\b/.test(n)) return "PT Only";
  if (/(trial|foundations|strength boost|fix|6.?week|12.?week|30.?day|movement assessment)/.test(n)) return "Trial";
  if (/pack|sessions/.test(n)) return "Class Pack";
  if (/membership|elite|core|essential|founders|football/.test(n)) return "Monthly Unlimited";
  return "Other";
}

function mapSource(teamupSource: string | null): NotionSource | null {
  if (!teamupSource) return null;
  const s = teamupSource.toLowerCase();
  for (const opt of NOTION_SOURCE_OPTIONS) {
    if (s.includes(opt.toLowerCase())) return opt;
  }
  if (s.includes("facebook") || s.includes("meta") || s.includes("ad")) return "Instagram"; // best-fit; tracked together as social ads
  if (s.includes("friend") || s.includes("word")) return "Referral";
  return "Other";
}

type EnrichmentInput = {
  customer: TeamupCustomer;
  lastSession: string | null;
  sessionCount: number;
  membership: MembershipSummary | undefined;
};

function buildProperties(input: EnrichmentInput) {
  const { customer: c, lastSession, membership } = input;
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: customerName(c) } }] },
    // Stable unique key. Email is NOT unique — TeamUp family accounts share one
    // email across several customers — so the sync dedupes on this instead.
    "TeamUp ID": { number: c.id },
  };
  if (c.email) properties.Email = { email: c.email };
  if (c.created_at) properties.Joined = { date: { start: c.created_at.slice(0, 10) } };

  const status = mapMembershipStatus(membership);
  if (status) properties.Status = { select: { name: status } };

  const source = mapSource(c.lead_source);
  if (source) properties.Source = { select: { name: source } };

  if (lastSession) properties["Last Session"] = { date: { start: lastSession } };

  const membershipType = mapMembershipType(membership?.activeName ?? null);
  if (membershipType) properties["Membership Type"] = { select: { name: membershipType } };

  if (membership?.activeName) {
    properties["Programme"] = {
      rich_text: [{ text: { content: membership.activeName } }],
    };
  }
  return properties;
}

type MemberRow = {
  id: string;
  properties: {
    Email?: { email: string | null };
    "TeamUp ID"?: { number: number | null };
    Name?: { title?: Array<{ plain_text: string }> };
    Status?: { select?: { name: string } | null };
    Source?: { select?: { name: string } | null };
    Joined?: { date?: { start: string } | null };
    "Last Session"?: { date?: { start: string } | null };
    "Membership Type"?: { select?: { name: string } | null };
    Programme?: { rich_text?: Array<{ plain_text: string }> };
  };
};

type ExistingMember = {
  pageId: string;
  teamupId: number | null;
  email: string | null;
  name: string;
  status: string | null;
  source: string | null;
  joined: string | null;
  lastSession: string | null;
  membershipType: string | null;
  programme: string | null;
};

type MemberIndex = {
  byTeamupId: Map<number, ExistingMember>;
  byEmail: Map<string, ExistingMember[]>;
};

/**
 * Ensure a Members DB property exists with the requested type. Idempotent —
 * Notion accepts the same payload every run; if the property already exists
 * with that type the call is a no-op.
 */
async function ensureProperty(name: string, definition: Record<string, unknown>): Promise<void> {
  const { token, dbId } = notionConfig();
  const res = await fetch(`${NOTION_API}/databases/${dbId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ properties: { [name]: definition } }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Don't fail the whole sync just because we couldn't add a property; log
    // and continue. Writes that depend on it will surface a per-row error.
    console.error(`[teamup sync] could not ensure ${name} property: ${res.status} ${body.slice(0, 200)}`);
  }
}

async function loadMemberIndex(): Promise<MemberIndex> {
  const { token, dbId } = notionConfig();
  const byTeamupId = new Map<number, ExistingMember>();
  const byEmail = new Map<string, ExistingMember[]>();
  let cursor: string | undefined = undefined;

  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: MemberRow[];
      next_cursor: string | null;
      has_more: boolean;
    };
    for (const row of data.results) {
      const email = row.properties.Email?.email ?? null;
      const member: ExistingMember = {
        pageId: row.id,
        teamupId: row.properties["TeamUp ID"]?.number ?? null,
        email,
        name: row.properties.Name?.title?.map((t) => t.plain_text).join("") ?? "",
        status: row.properties.Status?.select?.name ?? null,
        source: row.properties.Source?.select?.name ?? null,
        joined: row.properties.Joined?.date?.start ?? null,
        lastSession: row.properties["Last Session"]?.date?.start ?? null,
        membershipType: row.properties["Membership Type"]?.select?.name ?? null,
        programme: row.properties.Programme?.rich_text?.map((t) => t.plain_text).join("") || null,
      };
      if (member.teamupId != null) byTeamupId.set(member.teamupId, member);
      if (email) {
        const key = email.toLowerCase();
        const list = byEmail.get(key);
        if (list) list.push(member);
        else byEmail.set(key, [member]);
      }
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return { byTeamupId, byEmail };
}

/**
 * Resolve the existing Notion row for a customer.
 *
 * Primary key is the TeamUp customer id (stable and unique). For rows created
 * before the id column existed, fall back to email — but carefully, because
 * family accounts share one email across multiple customers:
 *  - email unique to a single customer  -> match the one unclaimed row even if
 *    the stored name differs in formatting (e.g. "Lisa FISHER" vs "Lisa Fisher").
 *  - email shared by several customers   -> require an exact name match so we
 *    don't hijack a sibling's row; an unmatched sibling falls through to create.
 * Only rows without a TeamUp id yet are eligible for the email fallback, so a
 * row already claimed by another customer is never stolen.
 */
function findExisting(
  c: TeamupCustomer,
  index: MemberIndex,
  emailShareCount: number,
): ExistingMember | undefined {
  const byId = index.byTeamupId.get(c.id);
  if (byId) return byId;

  const email = c.email ? c.email.toLowerCase() : null;
  if (!email) return undefined;

  const candidates = (index.byEmail.get(email) ?? []).filter((m) => m.teamupId == null);
  if (candidates.length === 0) return undefined;

  if (emailShareCount <= 1 && candidates.length === 1) return candidates[0];

  const desired = customerName(c).trim().toLowerCase();
  const named = candidates.filter((m) => m.name.trim().toLowerCase() === desired);
  return named.length === 1 ? named[0] : undefined;
}

function isUnchanged(input: EnrichmentInput, existing: ExistingMember): boolean {
  const c = input.customer;
  const desiredStatus = mapMembershipStatus(input.membership);
  const desiredSource = mapSource(c.lead_source);
  const desiredJoined = c.created_at ? c.created_at.slice(0, 10) : null;
  const desiredMembershipType = mapMembershipType(input.membership?.activeName ?? null);
  const desiredProgramme = input.membership?.activeName ?? null;

  return (
    existing.teamupId === c.id &&
    existing.name === customerName(c) &&
    existing.status === desiredStatus &&
    existing.source === desiredSource &&
    existing.joined === desiredJoined &&
    existing.lastSession === input.lastSession &&
    existing.membershipType === desiredMembershipType &&
    existing.programme === desiredProgramme
  );
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) break;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export type SyncResult = {
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  /** Website leads auto-marked Converted + linked to their new member row. */
  converted: number;
  errors: Array<{ id: number; reason: string }>;
  dryRun?: boolean;
  /** Names that would be created (dry run only). */
  plannedCreates?: string[];
  /** Rows that would get a TeamUp id written for the first time (dry run only). */
  plannedBackfills?: string[];
};

// ——— Onboarding drip support ———————————————————————————————————————————————
//
// The onboarding-drip cron (src/app/api/cron/onboarding-drip/route.ts) reads
// members and their per-email sent-flags from here. The flags are checkbox
// properties on the Members DB and guarantee idempotency: a sent email is
// never sent twice regardless of how often the cron runs.

export const ONBOARDING_EMAIL_COUNT = 6;

/** "Onboarding Email N Sent" for N in 1..6. */
export function onboardingFlagName(emailIndex: number): string {
  return `Onboarding Email ${emailIndex} Sent`;
}

// Persistent state for the programme-anchored mid-programme check-in (email 6).
// The check-in fires at a member's true midpoint counted in ACTIVE days, so the
// cron accumulates active days here (paused days do not advance it), keyed to the
// current programme membership so a re-take/upgrade resets cleanly. Dedup is per
// membership id, not per member, for the same reason.
export const PROGRAMME_ACTIVE_DAYS = "Programme Active Days";
export const PROGRAMME_ACTIVE_DAYS_COUNTED_ON = "Programme Active Days Counted On";
export const PROGRAMME_ANCHOR_MEMBERSHIP_ID = "Programme Anchor Membership ID";
export const EMAIL6_SENT_MEMBERSHIPS = "Email 6 Sent Memberships";
export const EMAIL6_SKIPPED_MEMBERSHIPS = "Email 6 Skipped Memberships";

// Sequence emails 1-5 that were ticked WITHOUT being sent, because they were more
// than DRIP_MAX_LATE_DAYS past due. The "Onboarding Email N Sent" checkbox alone
// cannot express this: the stale path ticks the very same box a real send does, so
// a member who received nothing is indistinguishable from one who received
// everything. That ambiguity is exactly what hid Lisa Gillette's missed onboarding
// (joined 19 Jul 2026, email 1 ticked, zero sends in Resend) for three weeks.
export const ONBOARDING_SKIPPED_EMAILS = "Onboarding Emails Skipped (not sent)";

export type OnboardingMember = {
  pageId: string;
  email: string;
  firstName: string;
  joined: string | null; // YYYY-MM-DD
  /** TeamUp customer id; the join key to live membership data. Null if unset. */
  teamupId: number | null;
  /** sent[i] is true if "Onboarding Email (i+1) Sent" is ticked. Length 6. */
  sent: boolean[];
  /** Accumulated active-training days on the current programme (email 6 timer). */
  programmeActiveDays: number;
  /** London YMD the counter last incremented; guards one increment per day. */
  activeDaysCountedOn: string | null;
  /** Membership id the counter is anchored to; a change resets the counter. */
  anchorMembershipId: string | null;
  /** Membership ids the check-in has already been sent for. */
  email6SentMembershipIds: string[];
  /** Membership ids the check-in was deliberately skipped for (past ceiling). */
  email6SkippedMembershipIds: string[];
  /** Sequence indexes (1-5) ticked without sending because they were too late. */
  onboardingSkippedIndexes: number[];
};

type OnboardingMemberRow = {
  id: string;
  properties: Record<string, {
    email?: string | null;
    title?: Array<{ plain_text: string }>;
    date?: { start: string } | null;
    checkbox?: boolean;
    number?: number | null;
    rich_text?: Array<{ plain_text: string }>;
  }>;
};

/** Parse a comma-separated membership-id list stored in a rich_text property. */
function parseIdList(row: OnboardingMemberRow, prop: string): string[] {
  const raw = row.properties[prop]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Ensure the six "Onboarding Email N Sent" checkbox properties exist on the
 * Members DB. Idempotent — Notion treats re-adding an existing property of the
 * same type as a no-op. Mirrors `ensureProperty`.
 */
export async function ensureOnboardingProperties(): Promise<void> {
  const { token, dbId } = notionConfig();
  const properties: Record<string, unknown> = {};
  for (let i = 1; i <= ONBOARDING_EMAIL_COUNT; i++) {
    properties[onboardingFlagName(i)] = { checkbox: {} };
  }
  // Programme-anchored check-in state (see the constants above).
  properties[PROGRAMME_ACTIVE_DAYS] = { number: {} };
  properties[PROGRAMME_ACTIVE_DAYS_COUNTED_ON] = { date: {} };
  properties[PROGRAMME_ANCHOR_MEMBERSHIP_ID] = { rich_text: {} };
  properties[EMAIL6_SENT_MEMBERSHIPS] = { rich_text: {} };
  properties[EMAIL6_SKIPPED_MEMBERSHIPS] = { rich_text: {} };
  properties[ONBOARDING_SKIPPED_EMAILS] = { rich_text: {} };
  const res = await fetch(`${NOTION_API}/databases/${dbId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `[onboarding drip] could not ensure sent-flag properties: ${res.status} ${body.slice(0, 200)}`,
    );
  }
}

/** Load every member with an email, plus their Joined date and sent-flags. */
export async function loadOnboardingMembers(): Promise<OnboardingMember[]> {
  const { token, dbId } = notionConfig();
  const members: OnboardingMember[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: OnboardingMemberRow[];
      next_cursor: string | null;
      has_more: boolean;
    };
    for (const row of data.results) {
      const email = row.properties.Email?.email;
      if (!email) continue;
      const name = row.properties.Name?.title?.map((t) => t.plain_text).join("") ?? "";
      const sent = Array.from({ length: ONBOARDING_EMAIL_COUNT }, (_, i) =>
        Boolean(row.properties[onboardingFlagName(i + 1)]?.checkbox),
      );
      members.push({
        pageId: row.id,
        email,
        firstName: name.trim().split(/\s+/)[0] || "",
        joined: row.properties.Joined?.date?.start ?? null,
        teamupId: row.properties["TeamUp ID"]?.number ?? null,
        sent,
        programmeActiveDays: row.properties[PROGRAMME_ACTIVE_DAYS]?.number ?? 0,
        activeDaysCountedOn:
          row.properties[PROGRAMME_ACTIVE_DAYS_COUNTED_ON]?.date?.start ?? null,
        anchorMembershipId:
          row.properties[PROGRAMME_ANCHOR_MEMBERSHIP_ID]?.rich_text
            ?.map((t) => t.plain_text)
            .join("") || null,
        email6SentMembershipIds: parseIdList(row, EMAIL6_SENT_MEMBERSHIPS),
        email6SkippedMembershipIds: parseIdList(row, EMAIL6_SKIPPED_MEMBERSHIPS),
        onboardingSkippedIndexes: parseIdList(row, ONBOARDING_SKIPPED_EMAILS)
          .map((s) => Number(s))
          .filter((n) => Number.isInteger(n) && n >= 1 && n <= ONBOARDING_EMAIL_COUNT),
      });
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return members;
}

/** Mark "Onboarding Email N Sent" = true on a member page after a successful send. */
export async function setOnboardingFlag(pageId: string, emailIndex: number): Promise<void> {
  const { token } = notionConfig();
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({
      properties: { [onboardingFlagName(emailIndex)]: { checkbox: true } },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`set ${onboardingFlagName(emailIndex)} ${res.status}: ${body.slice(0, 200)}`);
  }
}

async function patchMemberProps(
  pageId: string,
  properties: Record<string, unknown>,
  what: string,
): Promise<void> {
  const { token } = notionConfig();
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${what} ${res.status}: ${body.slice(0, 200)}`);
  }
}

/**
 * Persist the programme active-day counter for a member: the running total, the
 * London day it was last counted (so a re-run the same day does not double-count),
 * and the membership id it is anchored to (a change resets the total to 0).
 */
export async function setProgrammeCounter(
  pageId: string,
  state: { activeDays: number; countedOn: string | null; anchorMembershipId: string },
): Promise<void> {
  await patchMemberProps(
    pageId,
    {
      [PROGRAMME_ACTIVE_DAYS]: { number: state.activeDays },
      [PROGRAMME_ACTIVE_DAYS_COUNTED_ON]: {
        date: state.countedOn ? { start: state.countedOn } : null,
      },
      [PROGRAMME_ANCHOR_MEMBERSHIP_ID]: {
        rich_text: [{ text: { content: state.anchorMembershipId } }],
      },
    },
    "set programme counter",
  );
}

/**
 * Record that the mid-programme check-in was sent for a membership: append its id
 * to the sent set (the authoritative dedup) and tick the Onboarding Email 6 Sent
 * checkbox for reporting parity. Called only after the send succeeds.
 */
export async function recordEmail6Sent(
  pageId: string,
  currentSentIds: string[],
  membershipId: string,
): Promise<void> {
  const next = Array.from(new Set([...currentSentIds, membershipId])).join(", ");
  await patchMemberProps(
    pageId,
    {
      [EMAIL6_SENT_MEMBERSHIPS]: { rich_text: [{ text: { content: next } }] },
      [onboardingFlagName(MID_PROGRAMME_EMAIL_INDEX)]: { checkbox: true },
    },
    "record email6 sent",
  );
}

/**
 * Record that the mid-programme check-in was deliberately skipped for a membership
 * (member is already past the grace ceiling), so it is never revisited or sent
 * stale. Distinct from the sent set for reporting.
 */
export async function recordEmail6Skipped(
  pageId: string,
  currentSkippedIds: string[],
  membershipId: string,
): Promise<void> {
  const next = Array.from(new Set([...currentSkippedIds, membershipId])).join(", ");
  await patchMemberProps(
    pageId,
    { [EMAIL6_SKIPPED_MEMBERSHIPS]: { rich_text: [{ text: { content: next } }] } },
    "record email6 skipped",
  );
}

/**
 * Record that a sequence email (1-5) was ticked WITHOUT being sent because it was
 * too far past due. Ticks the flag so the member advances through the sequence,
 * exactly as before, but also appends the index to the skipped set so the two
 * outcomes stay tellable apart afterwards.
 *
 * Both writes go in one PATCH deliberately: ticking the flag without recording the
 * skip is the very failure this exists to prevent, so they must not be able to
 * half-succeed.
 */
export async function recordOnboardingSkipped(
  pageId: string,
  currentSkippedIndexes: number[],
  emailIndex: number,
): Promise<void> {
  const next = Array.from(new Set([...currentSkippedIndexes, emailIndex]))
    .sort((a, b) => a - b)
    .join(", ");
  await patchMemberProps(
    pageId,
    {
      [onboardingFlagName(emailIndex)]: { checkbox: true },
      [ONBOARDING_SKIPPED_EMAILS]: { rich_text: [{ text: { content: next } }] },
    },
    "record onboarding skipped",
  );
}

export async function upsertCustomers(
  customers: TeamupCustomer[],
  options: { dryRun?: boolean } = {},
): Promise<SyncResult> {
  const { token, dbId } = notionConfig();
  const dryRun = options.dryRun === true;
  const result: SyncResult = {
    total: customers.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    converted: 0,
    errors: [],
    ...(dryRun ? { dryRun: true, plannedCreates: [], plannedBackfills: [] } : {}),
  };

  if (!dryRun) {
    await ensureProperty("Programme", { rich_text: {} });
    await ensureProperty("TeamUp ID", { number: {} });
  }

  const [memberIndex, attendanceByCustomer, membershipByCustomer] = await Promise.all([
    loadMemberIndex(),
    fetchAttendanceSummaryByCustomer(),
    fetchMembershipSummaryByCustomer(),
  ]);

  // How many customers share each email — drives the family-account fallback.
  const emailShareCount = new Map<string, number>();
  for (const c of customers) {
    if (!c.email) continue;
    const key = c.email.toLowerCase();
    emailShareCount.set(key, (emailShareCount.get(key) ?? 0) + 1);
  }

  // Notion's published rate limit averages ~3 req/s. Three concurrent writers
  // matches that without bursting hard enough to draw 429s.
  const CONCURRENCY = 3;

  await runWithConcurrency(customers, CONCURRENCY, async (c) => {
    try {
      if (!c.email) {
        result.skipped += 1;
        return;
      }
      const shareCount = emailShareCount.get(c.email.toLowerCase()) ?? 1;
      const existing = findExisting(c, memberIndex, shareCount);
      const attendance = attendanceByCustomer.get(c.id);
      const input: EnrichmentInput = {
        customer: c,
        lastSession: attendance?.lastSession ?? null,
        sessionCount: attendance?.sessionCount ?? 0,
        membership: membershipByCustomer.get(c.id),
      };

      if (existing && isUnchanged(input, existing)) {
        result.unchanged += 1;
        return;
      }

      if (dryRun) {
        if (existing) {
          result.updated += 1;
          if (existing.teamupId == null) result.plannedBackfills?.push(customerName(c));
        } else {
          result.created += 1;
          result.plannedCreates?.push(customerName(c));
        }
        return;
      }

      const properties = buildProperties(input);

      let memberPageId: string;
      if (existing) {
        const res = await fetch(`${NOTION_API}/pages/${existing.pageId}`, {
          method: "PATCH",
          headers: notionHeaders(token),
          body: JSON.stringify({ properties }),
        });
        if (!res.ok) throw new Error(`update ${res.status}: ${(await res.text()).slice(0, 200)}`);
        memberPageId = existing.pageId;
        result.updated += 1;
      } else {
        const res = await fetch(`${NOTION_API}/pages`, {
          method: "POST",
          headers: notionHeaders(token),
          body: JSON.stringify({ parent: { database_id: dbId }, properties }),
        });
        if (!res.ok) throw new Error(`create ${res.status}: ${(await res.text()).slice(0, 200)}`);
        memberPageId = ((await res.json()) as { id: string }).id;
        result.created += 1;
      }

      if (c.email) {
        try {
          await copyConsentFromLeadToMember(c.email);
        } catch (err) {
          console.error(`[teamup sync] consent copy failed for ${c.email}`, (err as Error).message);
        }
        // Reflect the conversion in the Leads DB automatically: flip the matching
        // website lead to Converted and link it to this member, so the Leads
        // pipeline stops drifting from reality (was manual-only). See
        // markLeadConverted for the family-account guard.
        try {
          result.converted += await markLeadConverted(c.email, memberPageId, shareCount);
        } catch (err) {
          console.error(`[teamup sync] lead conversion failed for ${c.email}`, (err as Error).message);
        }
      }
    } catch (err) {
      result.errors.push({ id: c.id, reason: (err as Error).message });
    }
  });

  return result;
}
