const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

type MemberRow = {
  id: string;
  url?: string;
  properties: {
    Email?: { email: string | null };
    Name?: { title?: Array<{ plain_text: string }> };
    Status?: { select?: { name: string } | null };
    "Last Session"?: { date?: { start: string } | null };
    "Membership Type"?: { select?: { name: string } | null };
  };
};

export type AtRiskMember = {
  name: string;
  email: string | null;
  status: string | null;
  membershipType: string | null;
  lastSession: string;
  daysSinceLastSession: number;
  notionPageUrl: string | null;
};

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

const ACTIVE_STATUSES = new Set(["Active", "Trial", "Paused"]);

export type AtRiskWindow = {
  /** Members whose last session is older than this are surfaced. */
  thresholdDays: number;
  /** Members whose last session is older than this are treated as lapsed and skipped. */
  lapsedAfterDays: number;
};

export async function findAtRiskMembers(
  window: AtRiskWindow,
  today = new Date(),
): Promise<AtRiskMember[]> {
  const { token, dbId } = notionConfig();
  const upper = new Date(today);
  upper.setUTCDate(upper.getUTCDate() - window.thresholdDays);
  const upperISO = upper.toISOString().slice(0, 10);
  const lower = new Date(today);
  lower.setUTCDate(lower.getUTCDate() - window.lapsedAfterDays);
  const lowerISO = lower.toISOString().slice(0, 10);

  const out: AtRiskMember[] = [];
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
      const lastSession = row.properties["Last Session"]?.date?.start;
      if (!lastSession) continue;
      if (lastSession >= upperISO) continue; // attended within threshold window, not at risk yet
      if (lastSession < lowerISO) continue; // older than the lapsed cutoff, treat as churned

      const status = row.properties.Status?.select?.name ?? null;
      // Only flag members whose membership status implies they should still be coming.
      if (status && !ACTIVE_STATUSES.has(status)) continue;

      const name = row.properties.Name?.title?.map((t) => t.plain_text).join("") ?? "(no name)";
      const email = row.properties.Email?.email ?? null;
      const membershipType = row.properties["Membership Type"]?.select?.name ?? null;
      const daysSinceLastSession = Math.floor(
        (today.getTime() - new Date(lastSession).getTime()) / (24 * 60 * 60 * 1000),
      );
      out.push({
        name,
        email,
        status,
        membershipType,
        lastSession,
        daysSinceLastSession,
        notionPageUrl: row.url ?? null,
      });
    }

    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  out.sort((a, b) => b.daysSinceLastSession - a.daysSinceLastSession);
  return out;
}

export async function postRetentionDigestPage(
  parentPageId: string,
  members: AtRiskMember[],
  window: AtRiskWindow,
  today = new Date(),
): Promise<string> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");

  const dateISO = today.toISOString().slice(0, 10);
  const title = `At-risk member review — ${dateISO}`;
  const intro = members.length === 0
    ? `No members are between ${window.thresholdDays} and ${window.lapsedAfterDays} days since their last session. Nothing to action this week.`
    : `${members.length} member${members.length === 1 ? "" : "s"} haven't trained in ${window.thresholdDays}-${window.lapsedAfterDays} days. Reach out personally before they slip further.`;

  const children: unknown[] = [
    {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: intro } }] },
    },
  ];

  for (const m of members) {
    const head = `${m.name} — ${m.daysSinceLastSession} days (last session ${m.lastSession})`;
    const detailParts = [m.email, m.membershipType ? `membership: ${m.membershipType}` : null]
      .filter(Boolean) as string[];
    const detail = detailParts.length > 0 ? detailParts.join(" · ") : "";

    children.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: head, link: m.notionPageUrl ? { url: m.notionPageUrl } : null } },
        ],
      },
    });
    if (detail) {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { type: "text", text: { content: `    ${detail}` }, annotations: { color: "gray" } },
          ],
        },
      });
    }
  }

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { page_id: parentPageId },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
      children,
    }),
  });

  if (!res.ok) throw new Error(`Notion page create failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { id: string; url: string };
  return data.url ?? data.id;
}
