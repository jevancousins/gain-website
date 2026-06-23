import type { ResendMarketingContact } from "@/lib/resend-contacts";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

type SourceKind = "Members" | "Leads";

type NotionMarketingRow = {
  id: string;
  properties: {
    Name?: { title?: Array<{ plain_text: string }> };
    Email?: { email: string | null };
    Status?: { select?: { name: string } | null; status?: { name: string } | null };
    Newsletter?: { checkbox: boolean };
    "Newsletter Unsubscribed At"?: { date?: { start: string } | null };
  };
};

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export type MarketingContactSource = ResendMarketingContact & {
  source: SourceKind;
  explicitlyUnsubscribed: boolean;
};

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function splitName(name: string): { firstName: string | null; lastName: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function rowStatus(row: NotionMarketingRow): string | null {
  const status = row.properties.Status;
  return status?.select?.name ?? status?.status?.name ?? null;
}

function memberSegment(status: string | null): string {
  switch (status) {
    case "Active":
    case "Paused":
    case "Trial":
      return "Members - Current";
    default:
      return "";
  }
}

function leadSegment(status: string | null): string {
  switch (status) {
    case "New":
    case "Contacted":
    case "Consultation Booked":
    case "No Response":
      return "Leads - Open";
    default:
      return "";
  }
}

function marketingSegments(source: SourceKind, status: string | null): string[] {
  return ["Marketing - All", source === "Members" ? memberSegment(status) : leadSegment(status)]
    .filter(Boolean);
}

async function listRows(databaseId: string): Promise<NotionMarketingRow[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");

  const rows: NotionMarketingRow[] = [];
  let cursor: string | undefined;

  while (true) {
    const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Notion marketing query failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      results: NotionMarketingRow[];
      next_cursor: string | null;
      has_more: boolean;
    };

    rows.push(...data.results);
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return rows;
}

function toMarketingContacts(rows: NotionMarketingRow[], source: SourceKind): MarketingContactSource[] {
  return rows.flatMap((row) => {
    const email = row.properties.Email?.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return [];

    const name = row.properties.Name?.title?.map((t) => t.plain_text).join("").trim() ?? "";
    const { firstName, lastName } = splitName(name);
    const status = rowStatus(row);
    const newsletter = row.properties.Newsletter?.checkbox === true;
    const unsubscribedAt = row.properties["Newsletter Unsubscribed At"]?.date?.start ?? null;

    return [{
      email,
      firstName,
      lastName,
      source,
      explicitlyUnsubscribed: Boolean(unsubscribedAt),
      unsubscribed: !newsletter || Boolean(unsubscribedAt),
      segmentNames: marketingSegments(source, status),
    }];
  });
}

export async function listMemberMarketingContacts(): Promise<MarketingContactSource[]> {
  const dbId = process.env.NOTION_MEMBERS_DB_ID;
  if (!dbId) return [];
  return toMarketingContacts(await listRows(dbId), "Members");
}

export async function listLeadMarketingContacts(): Promise<MarketingContactSource[]> {
  const dbId = process.env.NOTION_LEADS_DB_ID;
  if (!dbId) return [];
  return toMarketingContacts(await listRows(dbId), "Leads");
}

export function mergeMarketingContacts(
  contacts: MarketingContactSource[],
): ResendMarketingContact[] {
  const byEmail = new Map<string, ResendMarketingContact & { hasNewsletterConsent: boolean; hasExplicitUnsubscribe: boolean }>();

  for (const contact of contacts) {
    const existing = byEmail.get(contact.email);
    const hasNewsletterConsent = !contact.unsubscribed;
    const hasExplicitUnsubscribe = contact.explicitlyUnsubscribed;

    if (!existing) {
      byEmail.set(contact.email, {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        segmentNames: contact.segmentNames,
        hasNewsletterConsent,
        hasExplicitUnsubscribe,
        unsubscribed: contact.unsubscribed,
      });
      continue;
    }

    existing.firstName ||= contact.firstName;
    existing.lastName ||= contact.lastName;
    existing.segmentNames = Array.from(new Set([...existing.segmentNames, ...contact.segmentNames]));
    existing.hasNewsletterConsent ||= hasNewsletterConsent;
    existing.hasExplicitUnsubscribe ||= hasExplicitUnsubscribe;
    existing.unsubscribed = existing.hasExplicitUnsubscribe || !existing.hasNewsletterConsent;
  }

  return Array.from(byEmail.values()).map((contact) => ({
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    unsubscribed: contact.unsubscribed,
    segmentNames: contact.segmentNames,
  }));
}
