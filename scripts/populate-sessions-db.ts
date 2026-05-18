/**
 * One-off script to populate the Sessions & Classes Notion DB
 * with historical data from TeamUp.
 *
 * Steps:
 *   1. Archive every existing page in the DB (clears duplicates)
 *   2. Fetch all TeamUp events using page-based pagination
 *   3. Deduplicate by TeamUp event ID
 *   4. Create fresh Notion pages (storing TeamUp Event ID for future dedup)
 *
 * Run: npx tsx scripts/populate-sessions-db.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(import.meta.dirname ?? __dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[match[1]] = val;
  }
}

const TEAMUP_BASE = "https://goteamup.com/api/v2";
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const SESSIONS_DB_ID = "f5e940b4-1518-446a-99fd-f7deb314ac06";

function teamupHeaders() {
  return {
    Authorization: `Token ${process.env.TEAMUP_M2M_TOKEN}`,
    "TeamUp-Request-Mode": "provider",
    "TeamUp-Provider-ID": process.env.TEAMUP_PROVIDER_ID!,
    Accept: "application/json",
  };
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type TeamUpEvent = {
  id: number;
  name: string;
  starts_at: string;
  ends_at?: string;
  status: string;
  max_occupancy: number | null;
  attending_count: number | null;
  is_appointment: boolean;
};

function classifyType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("strength")) return "Strength";
  if (lower.includes("metcon") || lower.includes("cardio")) return "Cardio";
  if (lower.includes("mobility")) return "Mobility";
  if (lower.includes("sauna")) return "Sauna";
  if (lower.includes("cold") || lower.includes("plunge")) return "Cold Plunge";
  if (lower.includes("pt") || lower.includes("personal training")) return "PT";
  return "Other";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Step 1: archive all existing pages ---

async function archiveAllPages(): Promise<number> {
  let archived = 0;
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const res = await fetch(`${NOTION_API}/databases/${SESSIONS_DB_ID}/query`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: Array<{ id: string }>;
      has_more: boolean;
      next_cursor: string | null;
    };

    for (const page of data.results) {
      const patchRes = await fetch(`${NOTION_API}/pages/${page.id}`, {
        method: "PATCH",
        headers: notionHeaders(),
        body: JSON.stringify({ archived: true }),
      });
      if (!patchRes.ok) {
        console.error(`  Failed to archive ${page.id}: ${patchRes.status}`);
      } else {
        archived++;
      }
      await sleep(350);
    }

    hasMore = data.has_more;
    startCursor = data.next_cursor ?? undefined;
    if (data.results.length > 0) {
      console.log(`  Archived ${archived} pages so far...`);
    }
  }

  return archived;
}

// --- Step 2: fetch all TeamUp events with page-based pagination ---

async function fetchAllEvents(): Promise<TeamUpEvent[]> {
  const all: TeamUpEvent[] = [];
  const seenIds = new Set<number>();
  let page = 1;
  let totalCount: number | null = null;

  while (true) {
    const url = `${TEAMUP_BASE}/events?page=${page}`;
    const res = await fetch(url, { headers: teamupHeaders() });
    if (!res.ok) throw new Error(`TeamUp API error: ${res.status}`);
    const data = (await res.json()) as {
      count?: number;
      results: TeamUpEvent[];
      next: string | null;
    };

    if (totalCount === null) {
      totalCount = data.count ?? 0;
      console.log(`  Total count from API: ${totalCount}`);
    }

    if (data.results.length === 0) break;

    for (const ev of data.results) {
      if (!seenIds.has(ev.id)) {
        seenIds.add(ev.id);
        all.push(ev);
      }
    }

    console.log(`  Page ${page}: ${data.results.length} events (${all.length} unique total, latest: ${data.results[data.results.length - 1].starts_at})`);

    if (!data.next) break;
    page++;
  }

  return all;
}

// --- Step 3: create pages with TeamUp Event ID ---

async function createSessionPage(event: TeamUpEvent): Promise<void> {
  const properties: Record<string, unknown> = {
    "Class Name": { title: [{ text: { content: event.name } }] },
    "Date & Time": { date: { start: event.starts_at } },
    Type: { select: { name: classifyType(event.name) } },
    "Attendance Count": { number: event.attending_count ?? 0 },
    Capacity: { number: event.max_occupancy ?? 6 },
    "TeamUp Event ID": { number: event.id },
  };

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({ parent: { database_id: SESSIONS_DB_ID }, properties }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion create page failed: ${res.status} ${text}`);
  }
}

// --- Main ---

async function main() {
  console.log("Step 1: Archiving all existing pages...");
  const archived = await archiveAllPages();
  console.log(`Archived ${archived} pages.\n`);

  console.log("Step 2: Fetching all events from TeamUp...");
  const events = await fetchAllEvents();
  console.log(`Total unique events: ${events.length}`);

  // Only include past events (not future scheduled ones)
  const now = new Date().toISOString();
  const pastEvents = events.filter((e) => e.starts_at < now);
  console.log(`Past events (excluding future): ${pastEvents.length}`);

  const groupSessions = pastEvents.filter((e) => {
    if (e.is_appointment) return false;
    const lower = e.name.toLowerCase();
    if (lower.includes("test booking") || lower === "free test") return false;
    return true;
  });
  console.log(`Group sessions to import: ${groupSessions.length}\n`);

  console.log("Step 3: Creating Notion pages...");
  let created = 0;
  let errors = 0;

  for (const event of groupSessions) {
    try {
      await createSessionPage(event);
      created++;
      if (created % 50 === 0) {
        console.log(`  Created ${created}/${groupSessions.length}...`);
      }
      await sleep(350);
    } catch (err) {
      errors++;
      console.error(`  Error creating ${event.name} (${event.starts_at}): ${(err as Error).message}`);
      await sleep(1000);
    }
  }

  console.log(`\nDone. Created: ${created}, Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
