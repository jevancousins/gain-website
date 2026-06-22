import { fetchUpcomingSchedule, type ScheduleItem } from "@/lib/teamup-schedule";

/**
 * Mirrors the forward-looking TeamUp schedule into a dedicated Notion DB so the
 * Gain Command Centre can read it through the notion-gain connector (Cowork
 * artifacts pull data via MCP connectors, not arbitrary fetch, so the live
 * /api/teamup/schedule endpoint can't be called from the artifact directly).
 *
 * The DB holds only the current forward window: each run upserts upcoming
 * sessions by TeamUp event ID and archives rows that have rolled out of the
 * window (past or cancelled). It is rebuilt automatically; do not hand-edit.
 */

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const SCHEDULE_DB_ID = "38769be1-efae-8144-a3dd-c7ba4c46eb9c";

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type ExistingRow = {
  pageId: string;
  eventId: number | null;
  startISO: string | null;
  attending: number | null;
  capacity: number | null;
};

async function fetchExistingRows(token: string): Promise<ExistingRow[]> {
  const rows: ExistingRow[] = [];
  let cursor: string | undefined;
  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${SCHEDULE_DB_ID}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion schedule query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: Array<{
        id: string;
        properties: {
          "Date & Time"?: { date?: { start: string } | null };
          Attending?: { number: number | null };
          Capacity?: { number: number | null };
          "TeamUp Event ID"?: { number: number | null };
        };
      }>;
      has_more: boolean;
      next_cursor: string | null;
    };
    for (const p of data.results) {
      rows.push({
        pageId: p.id,
        eventId: p.properties["TeamUp Event ID"]?.number ?? null,
        startISO: p.properties["Date & Time"]?.date?.start ?? null,
        attending: p.properties.Attending?.number ?? null,
        capacity: p.properties.Capacity?.number ?? null,
      });
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return rows;
}

function itemProperties(item: ScheduleItem): Record<string, unknown> {
  return {
    Session: { title: [{ text: { content: item.name || "Untitled" } }] },
    "Date & Time": { date: { start: item.startsAt } },
    Type: { select: { name: item.type === "appointment" ? "Appointment" : "Class" } },
    Attending: { number: item.attending },
    Capacity: { number: item.capacity },
    "TeamUp Event ID": { number: typeof item.id === "number" ? item.id : Number(item.id) },
  };
}

async function createRow(token: string, item: ScheduleItem): Promise<void> {
  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({ parent: { database_id: SCHEDULE_DB_ID }, properties: itemProperties(item) }),
  });
  if (!res.ok) throw new Error(`Notion schedule create failed: ${res.status} ${await res.text()}`);
}

async function patchRow(token: string, pageId: string, item: ScheduleItem): Promise<void> {
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ properties: itemProperties(item) }),
  });
  if (!res.ok) throw new Error(`Notion schedule patch failed: ${res.status} ${await res.text()}`);
}

async function archiveRow(token: string, pageId: string): Promise<void> {
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ archived: true }),
  });
  if (!res.ok) throw new Error(`Notion schedule archive failed: ${res.status} ${await res.text()}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncUpcomingSchedule(daysAhead = 14): Promise<{
  created: number;
  updated: number;
  unchanged: number;
  archived: number;
  windowItems: number;
}> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");

  const [{ items }, existing] = await Promise.all([
    fetchUpcomingSchedule(daysAhead),
    fetchExistingRows(token),
  ]);

  const byEventId = new Map<number, ExistingRow>();
  for (const row of existing) {
    if (row.eventId != null) byEventId.set(row.eventId, row);
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  const seen = new Set<number>();

  for (const item of items) {
    const eventId = typeof item.id === "number" ? item.id : Number(item.id);
    if (Number.isNaN(eventId)) continue;
    seen.add(eventId);
    const row = byEventId.get(eventId);
    if (!row) {
      await createRow(token, item);
      created += 1;
      await sleep(350);
      continue;
    }
    const changed =
      row.attending !== item.attending ||
      row.capacity !== item.capacity ||
      row.startISO !== item.startsAt;
    if (changed) {
      await patchRow(token, row.pageId, item);
      updated += 1;
      await sleep(350);
    } else {
      unchanged += 1;
    }
  }

  // Archive rows whose event is no longer in the forward window (past / cancelled).
  let archived = 0;
  for (const row of existing) {
    if (row.eventId == null || !seen.has(row.eventId)) {
      await archiveRow(token, row.pageId);
      archived += 1;
      await sleep(350);
    }
  }

  return { created, updated, unchanged, archived, windowItems: items.length };
}
