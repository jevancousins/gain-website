import type { TeamupCustomer } from "@/lib/teamup-customers";

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

function buildProperties(c: TeamupCustomer) {
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
  return properties;
}

type FoundPage = { id: string };

async function findByEmail(email: string): Promise<FoundPage | null> {
  const { token, dbId } = notionConfig();
  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      filter: { property: "Email", email: { equals: email } },
      page_size: 1,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { results: FoundPage[] };
  return data.results[0] ?? null;
}

export type SyncResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ id: number; reason: string }>;
};

export async function upsertCustomers(customers: TeamupCustomer[]): Promise<SyncResult> {
  const { token, dbId } = notionConfig();
  const result: SyncResult = { total: customers.length, created: 0, updated: 0, skipped: 0, errors: [] };

  for (const c of customers) {
    try {
      if (!c.email) {
        result.skipped += 1;
        continue;
      }
      const existing = await findByEmail(c.email);
      const properties = buildProperties(c);

      if (existing) {
        const res = await fetch(`${NOTION_API}/pages/${existing.id}`, {
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
  }

  return result;
}
