import { teamupGet } from "@/lib/teamup";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const SESSIONS_DB_ID = "f5e940b4-1518-446a-99fd-f7deb314ac06";

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type TeamUpEvent = {
  id: number;
  name: string;
  starts_at: string;
  max_occupancy: number | null;
  attending_count: number | null;
  is_appointment: boolean;
};

type TeamUpPage = {
  count: number;
  results: TeamUpEvent[];
  next: string | null;
};

function classifyType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("strength")) return "Strength";
  if (lower.includes("metcon") || lower.includes("cardio")) return "Cardio";
  if (lower.includes("mobility")) return "Mobility";
  if (lower.includes("sauna")) return "Sauna";
  if (lower.includes("cold") || lower.includes("plunge")) return "Cold Plunge";
  if (lower.includes("personal training") || lower.includes("1-2-1")) return "PT";
  return "Other";
}

async function fetchLatestSessionDate(token: string): Promise<string | null> {
  const body = {
    page_size: 1,
    sorts: [{ property: "Date & Time", direction: "descending" }],
  };
  const res = await fetch(`${NOTION_API}/databases/${SESSIONS_DB_ID}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results: Array<{
      properties: { "Date & Time"?: { date?: { start: string } | null } };
    }>;
  };
  return data.results[0]?.properties["Date & Time"]?.date?.start ?? null;
}

async function fetchExistingEventIds(token: string): Promise<Set<number>> {
  const ids = new Set<number>();
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const body: Record<string, unknown> = {
      page_size: 100,
      filter_properties: ["TeamUp Event ID"],
    };
    if (startCursor) body.start_cursor = startCursor;

    const res = await fetch(`${NOTION_API}/databases/${SESSIONS_DB_ID}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) break;
    const data = (await res.json()) as {
      results: Array<{
        properties: { "TeamUp Event ID"?: { number: number | null } };
      }>;
      has_more: boolean;
      next_cursor: string | null;
    };

    for (const page of data.results) {
      const eventId = page.properties["TeamUp Event ID"]?.number;
      if (eventId) ids.add(eventId);
    }

    hasMore = data.has_more;
    startCursor = data.next_cursor ?? undefined;
  }

  return ids;
}

async function fetchTeamUpEventsSince(since: string): Promise<TeamUpEvent[]> {
  const all: TeamUpEvent[] = [];
  const now = new Date().toISOString();
  let pageNum = 1;

  while (true) {
    const page = await teamupGet<TeamUpPage>("/events", {
      query: { page: pageNum },
    });
    if (page.results.length === 0) break;

    for (const ev of page.results) {
      if (ev.starts_at > since && ev.starts_at <= now) all.push(ev);
    }

    if (!page.next) break;
    pageNum++;
  }

  return all;
}

async function createSessionPage(
  token: string,
  event: TeamUpEvent,
): Promise<void> {
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
    headers: notionHeaders(token),
    body: JSON.stringify({ parent: { database_id: SESSIONS_DB_ID }, properties }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion create failed: ${res.status} ${text}`);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncNewSessions(): Promise<{
  synced: number;
  skipped: number;
  errors: number;
  since: string | null;
}> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");

  const latestDate = await fetchLatestSessionDate(token);
  const since = latestDate ?? "2024-01-01T00:00:00";

  const existingIds = await fetchExistingEventIds(token);

  const newEvents = await fetchTeamUpEventsSince(since);

  const groupSessions = newEvents.filter((e) => {
    if (e.is_appointment) return false;
    const lower = e.name.toLowerCase();
    if (lower.includes("test booking") || lower === "free test") return false;
    return true;
  });

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  for (const event of groupSessions) {
    if (existingIds.has(event.id)) {
      skipped++;
      continue;
    }
    try {
      await createSessionPage(token, event);
      synced++;
      await sleep(350);
    } catch {
      errors++;
      await sleep(1000);
    }
  }

  return { synced, skipped, errors, since };
}
