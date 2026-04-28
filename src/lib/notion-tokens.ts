const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const SERVICE_NAME = "TeamUp";

export type TokenState = {
  pageId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

type NotionRichText = { plain_text: string };
type NotionPageProperties = {
  Service?: { title?: NotionRichText[] };
  "Access Token"?: { rich_text?: NotionRichText[] };
  "Refresh Token"?: { rich_text?: NotionRichText[] };
  "Expires At"?: { date?: { start?: string } };
};
type NotionPage = { id: string; properties: NotionPageProperties };

function notionConfig() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.TEAMUP_TOKENS_DB_ID;
  if (!token) throw new Error("NOTION_TOKEN not set");
  if (!dbId) throw new Error("TEAMUP_TOKENS_DB_ID not set");
  return { token, dbId };
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function readText(prop: { rich_text?: NotionRichText[] } | undefined): string {
  return prop?.rich_text?.map((r) => r.plain_text).join("") ?? "";
}

export async function getTeamupTokens(): Promise<TokenState | null> {
  const { token, dbId } = notionConfig();
  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      filter: { property: "Service", title: { equals: SERVICE_NAME } },
      page_size: 1,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { results: NotionPage[] };
  const page = data.results[0];
  if (!page) return null;
  const expiresStart = page.properties["Expires At"]?.date?.start;
  return {
    pageId: page.id,
    accessToken: readText(page.properties["Access Token"]),
    refreshToken: readText(page.properties["Refresh Token"]),
    expiresAt: expiresStart ? new Date(expiresStart) : new Date(0),
  };
}

export async function upsertTeamupTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}): Promise<void> {
  const { token, dbId } = notionConfig();
  const existing = await getTeamupTokens();

  const properties = {
    Service: { title: [{ text: { content: SERVICE_NAME } }] },
    "Access Token": { rich_text: [{ text: { content: tokens.accessToken } }] },
    "Refresh Token": { rich_text: [{ text: { content: tokens.refreshToken } }] },
    "Expires At": { date: { start: tokens.expiresAt.toISOString() } },
  };

  const res = existing
    ? await fetch(`${NOTION_API}/pages/${existing.pageId}`, {
        method: "PATCH",
        headers: notionHeaders(token),
        body: JSON.stringify({ properties }),
      })
    : await fetch(`${NOTION_API}/pages`, {
        method: "POST",
        headers: notionHeaders(token),
        body: JSON.stringify({ parent: { database_id: dbId }, properties }),
      });

  if (!res.ok) throw new Error(`Notion ${existing ? "update" : "create"} failed: ${res.status} ${await res.text()}`);
}
