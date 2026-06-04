const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function leadsConfig() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_LEADS_DB_ID;
  if (!token) throw new Error("NOTION_TOKEN not set");
  if (!dbId) throw new Error("NOTION_LEADS_DB_ID not set");
  return { token, dbId };
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export type LeadConsentFields = {
  pageId: string;
  newsletter: boolean;
  consentVersion: string | null;
  consentAt: string | null;
  unsubscribedAt: string | null;
  unsubscribeReason: string | null;
};

type LeadRow = {
  id: string;
  properties: {
    Email?: { email: string | null };
    Newsletter?: { checkbox: boolean };
    "Newsletter Consent Version"?: { rich_text?: Array<{ plain_text: string }> };
    "Newsletter Consent At"?: { date?: { start: string } | null };
    "Newsletter Unsubscribed At"?: { date?: { start: string } | null };
    "Newsletter Unsubscribe Reason"?: { select?: { name: string } | null };
  };
};

export async function findLeadsByEmail(email: string): Promise<LeadConsentFields[]> {
  const { token, dbId } = leadsConfig();
  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      filter: {
        property: "Email",
        email: { equals: email.toLowerCase() },
      },
      page_size: 10,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Notion leads query failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { results: LeadRow[] };
  return data.results.map((row) => ({
    pageId: row.id,
    newsletter: row.properties.Newsletter?.checkbox ?? false,
    consentVersion:
      row.properties["Newsletter Consent Version"]?.rich_text
        ?.map((t) => t.plain_text)
        .join("") || null,
    consentAt:
      row.properties["Newsletter Consent At"]?.date?.start ?? null,
    unsubscribedAt:
      row.properties["Newsletter Unsubscribed At"]?.date?.start ?? null,
    unsubscribeReason:
      row.properties["Newsletter Unsubscribe Reason"]?.select?.name ?? null,
  }));
}

export async function findMembersByEmail(email: string): Promise<Array<{ pageId: string }>> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_MEMBERS_DB_ID;
  if (!token || !dbId) return [];
  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      filter: {
        property: "Email",
        email: { equals: email.toLowerCase() },
      },
      page_size: 10,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Notion members query failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { results: Array<{ id: string }> };
  return data.results.map((row) => ({ pageId: row.id }));
}

export async function patchNotionPage(
  pageId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Notion patch ${pageId} failed: ${res.status} ${body.slice(0, 200)}`);
  }
}

export function buildConsentProperties(lead: LeadConsentFields): Record<string, unknown> {
  const props: Record<string, unknown> = {
    Newsletter: { checkbox: lead.newsletter },
  };
  if (lead.consentVersion) {
    props["Newsletter Consent Version"] = {
      rich_text: [{ text: { content: lead.consentVersion } }],
    };
  }
  if (lead.consentAt) {
    props["Newsletter Consent At"] = { date: { start: lead.consentAt } };
  }
  if (lead.unsubscribedAt) {
    props["Newsletter Unsubscribed At"] = { date: { start: lead.unsubscribedAt } };
  }
  if (lead.unsubscribeReason) {
    props["Newsletter Unsubscribe Reason"] = {
      select: { name: lead.unsubscribeReason },
    };
  }
  return props;
}

type MemberConsentRow = {
  id: string;
  properties: {
    Email?: { email: string | null };
    Newsletter?: { checkbox: boolean };
    "Newsletter Consent Version"?: { rich_text?: Array<{ plain_text: string }> };
    "Newsletter Consent At"?: { date?: { start: string } | null };
  };
};

export async function copyConsentFromLeadToMember(memberEmail: string): Promise<boolean> {
  const leads = await findLeadsByEmail(memberEmail);
  if (leads.length === 0) return false;

  const lead = leads[0];
  if (!lead.newsletter && !lead.consentVersion) return false;

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_MEMBERS_DB_ID;
  if (!token || !dbId) return false;

  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      filter: {
        property: "Email",
        email: { equals: memberEmail.toLowerCase() },
      },
      page_size: 5,
    }),
    cache: "no-store",
  });
  if (!res.ok) return false;

  const data = (await res.json()) as { results: MemberConsentRow[] };
  let copied = false;

  for (const member of data.results) {
    const existing = member.properties["Newsletter Consent Version"]?.rich_text
      ?.map((t) => t.plain_text)
      .join("");
    if (existing) continue;

    await patchNotionPage(member.id, buildConsentProperties(lead));
    copied = true;
  }

  return copied;
}
