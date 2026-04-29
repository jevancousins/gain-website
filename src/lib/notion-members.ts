import type { TeamupCustomer } from "@/lib/teamup-customers";
import { fetchLastAttendedByCustomer } from "@/lib/teamup-attendances";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const NOTION_STATUS_OPTIONS = ["Trial", "Active", "Paused", "Lapsed", "Cancelled"] as const;
type NotionStatus = (typeof NOTION_STATUS_OPTIONS)[number];

const NOTION_SOURCE_OPTIONS = ["Instagram", "Referral", "Website", "Walk-in", "Google", "Other"] as const;
type NotionSource = (typeof NOTION_SOURCE_OPTIONS)[number];

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

function mapStatus(teamupStatus: string | null | undefined): NotionStatus | null {
  if (!teamupStatus) return null;
  const s = teamupStatus.toLowerCase();
  if (s.includes("trial") || s === "new") return "Trial";
  if (s.includes("active")) return "Active";
  if (s.includes("paused") || s.includes("hold")) return "Paused";
  if (s.includes("lapsed") || s.includes("slipping")) return "Lapsed";
  if (s.includes("cancel") || s.includes("inactive")) return "Cancelled";
  return null;
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

function buildProperties(c: TeamupCustomer, lastSession: string | null) {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.email || `TeamUp #${c.id}`;
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: name } }] },
  };
  if (c.email) properties.Email = { email: c.email };
  if (c.created_at) properties.Joined = { date: { start: c.created_at.slice(0, 10) } };
  const status = mapStatus(c.status);
  if (status) properties.Status = { select: { name: status } };
  const source = mapSource(c.lead_source);
  if (source) properties.Source = { select: { name: source } };
  if (lastSession) properties["Last Session"] = { date: { start: lastSession } };
  return properties;
}

type MemberRow = {
  id: string;
  properties: {
    Email?: { email: string | null };
    Name?: { title?: Array<{ plain_text: string }> };
    Status?: { select?: { name: string } | null };
    Source?: { select?: { name: string } | null };
    Joined?: { date?: { start: string } | null };
    "Last Session"?: { date?: { start: string } | null };
  };
};

type ExistingMember = {
  pageId: string;
  name: string;
  status: string | null;
  source: string | null;
  joined: string | null;
  lastSession: string | null;
};

async function loadEmailIndex(): Promise<Map<string, ExistingMember>> {
  const { token, dbId } = notionConfig();
  const index = new Map<string, ExistingMember>();
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
      const email = row.properties.Email?.email;
      if (!email) continue;
      index.set(email.toLowerCase(), {
        pageId: row.id,
        name: row.properties.Name?.title?.map((t) => t.plain_text).join("") ?? "",
        status: row.properties.Status?.select?.name ?? null,
        source: row.properties.Source?.select?.name ?? null,
        joined: row.properties.Joined?.date?.start ?? null,
        lastSession: row.properties["Last Session"]?.date?.start ?? null,
      });
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return index;
}

function isUnchanged(c: TeamupCustomer, existing: ExistingMember, lastSession: string | null): boolean {
  const desiredName =
    [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.email || `TeamUp #${c.id}`;
  const desiredStatus = mapStatus(c.status);
  const desiredSource = mapSource(c.lead_source);
  const desiredJoined = c.created_at ? c.created_at.slice(0, 10) : null;

  return (
    existing.name === desiredName &&
    existing.status === desiredStatus &&
    existing.source === desiredSource &&
    existing.joined === desiredJoined &&
    existing.lastSession === lastSession
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
  errors: Array<{ id: number; reason: string }>;
};

export async function upsertCustomers(customers: TeamupCustomer[]): Promise<SyncResult> {
  const { token, dbId } = notionConfig();
  const result: SyncResult = {
    total: customers.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    errors: [],
  };

  const [emailIndex, lastAttendedByCustomer] = await Promise.all([
    loadEmailIndex(),
    fetchLastAttendedByCustomer(),
  ]);
  // Notion's published rate limit averages ~3 req/s. Three concurrent writers
  // matches that without bursting hard enough to draw 429s.
  const CONCURRENCY = 3;

  await runWithConcurrency(customers, CONCURRENCY, async (c) => {
    try {
      if (!c.email) {
        result.skipped += 1;
        return;
      }
      const existing = emailIndex.get(c.email.toLowerCase());
      const lastSession = lastAttendedByCustomer.get(c.id) ?? null;

      if (existing && isUnchanged(c, existing, lastSession)) {
        result.unchanged += 1;
        return;
      }

      const properties = buildProperties(c, lastSession);

      if (existing) {
        const res = await fetch(`${NOTION_API}/pages/${existing.pageId}`, {
          method: "PATCH",
          headers: notionHeaders(token),
          body: JSON.stringify({ properties }),
        });
        if (!res.ok) throw new Error(`update ${res.status}: ${(await res.text()).slice(0, 200)}`);
        result.updated += 1;
      } else {
        const res = await fetch(`${NOTION_API}/pages`, {
          method: "POST",
          headers: notionHeaders(token),
          body: JSON.stringify({ parent: { database_id: dbId }, properties }),
        });
        if (!res.ok) throw new Error(`create ${res.status}: ${(await res.text()).slice(0, 200)}`);
        result.created += 1;
      }
    } catch (err) {
      result.errors.push({ id: c.id, reason: (err as Error).message });
    }
  });

  return result;
}
