/**
 * One-off script to populate the Sessions & Classes Notion DB
 * with historical data from TeamUp.
 *
 * Run: npx tsx scripts/populate-sessions-db.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
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

async function fetchAllEvents(): Promise<TeamUpEvent[]> {
  const all: TeamUpEvent[] = [];
  let offset = 0;
  const limit = 100;

  // First request to get total count
  const firstUrl = `${TEAMUP_BASE}/events?limit=${limit}&offset=0`;
  const firstRes = await fetch(firstUrl, { headers: teamupHeaders() });
  if (!firstRes.ok) throw new Error(`TeamUp API error: ${firstRes.status}`);
  const firstData = (await firstRes.json()) as { count?: number; results: TeamUpEvent[]; next: string | null };
  const totalCount = firstData.count ?? 2000;
  all.push(...firstData.results);
  console.log(`  Total count from API: ${totalCount}`);
  console.log(`  Fetched ${all.length} events...`);
  offset += limit;

  while (offset < totalCount) {
    const url = `${TEAMUP_BASE}/events?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: teamupHeaders() });
    if (!res.ok) throw new Error(`TeamUp API error: ${res.status}`);
    const data = (await res.json()) as { results: TeamUpEvent[]; next: string | null };
    if (data.results.length === 0) break;
    all.push(...data.results);
    console.log(`  Fetched ${all.length}/${totalCount} events...`);
    offset += limit;
  }

  return all;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createSessionPage(event: TeamUpEvent): Promise<void> {
  const type = classifyType(event.name);
  const startsAt = event.starts_at;

  const properties: Record<string, unknown> = {
    "Class Name": { title: [{ text: { content: event.name } }] },
    "Date & Time": { date: { start: startsAt } },
    Type: { select: { name: type } },
    "Attendance Count": { number: event.attending_count ?? 0 },
    Capacity: { number: event.max_occupancy ?? 6 },
  };

  const body = {
    parent: { database_id: SESSIONS_DB_ID },
    properties,
  };

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion create page failed: ${res.status} ${text}`);
  }
}

async function main() {
  console.log("Fetching all events from TeamUp...");
  const events = await fetchAllEvents();
  console.log(`Total events: ${events.length}`);

  // Filter: only group sessions (not 1-to-1 appointments), exclude test/free bookings
  const groupSessions = events.filter((e) => {
    if (e.is_appointment) return false;
    const lower = e.name.toLowerCase();
    if (lower.includes("test booking") || lower === "free test") return false;
    return true;
  });
  console.log(`Group sessions to import: ${groupSessions.length}`);

  let created = 0;
  let errors = 0;

  for (const event of groupSessions) {
    try {
      await createSessionPage(event);
      created++;
      if (created % 50 === 0) {
        console.log(`  Created ${created}/${groupSessions.length}...`);
      }
      // Notion rate limit: 3 req/s, so ~350ms between requests
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
