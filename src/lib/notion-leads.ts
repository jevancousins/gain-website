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
  status: string | null;
  convertedMemberIds: string[];
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
    Status?: { select?: { name: string } | null };
    "Converted Member"?: { relation?: Array<{ id: string }> };
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
    status: row.properties.Status?.select?.name ?? null,
    convertedMemberIds:
      row.properties["Converted Member"]?.relation?.map((r) => r.id) ?? [],
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

/**
 * Statuses a Cal.com booking is allowed to advance a lead from.
 *
 * Deliberately narrow. Anything else on the row — Converted, Lost, No Response,
 * or Consultation Booked already — was set by a person or by
 * `markLeadConverted`, and a booking is not evidence that judgement was wrong.
 * A blank Status is included: that is a row the website wrote and nobody has
 * touched.
 */
const CONSULTATION_PROMOTABLE_FROM = new Set([null, "New", "Contacted"]);

/**
 * Mark the lead behind a Cal.com consultation as Consultation Booked.
 *
 * Nothing did this before 17 Aug 2026: Cal.com was read only to send reminders,
 * so a lead who booked sat at New until a maintenance run happened to notice and
 * moved it by hand (Lynda on 13 Aug, Susan Wilson on 17 Aug). Hallum watches the
 * Leads board, so the board was telling him nobody had booked when they had.
 *
 * Matching is by email. The two sources disagree on case — Lynda is
 * `lyndasorrellflee@` in Notion and `Lyndasorrellflee@` in Cal.com — but
 * Notion's email filter matches case-insensitively (checked against both rows
 * on 17 Aug 2026), so the plain lookup is enough.
 *
 * Returns the number of lead rows updated.
 */
export async function markLeadConsultationBooked(
  attendeeEmail: string,
): Promise<number> {
  const leads = await findLeadsByEmail(attendeeEmail);

  let updated = 0;
  for (const lead of leads) {
    if (!CONSULTATION_PROMOTABLE_FROM.has(lead.status)) continue;
    await patchNotionPage(lead.pageId, {
      Status: { select: { name: "Consultation Booked" } },
    });
    updated += 1;
  }
  return updated;
}

/**
 * When a TeamUp member is synced, mark the matching website lead as Converted and
 * link the two records, so the Leads DB reflects conversions automatically rather
 * than relying on a manual update. Matches by email.
 *
 * Guardrails:
 * - Shared / family TeamUp accounts put several customers on one email, so an
 *   email match can't reliably identify the enquirer. `shareCount` is how many
 *   TeamUp customers share this email; we only auto-convert when it is 1.
 * - Idempotent: skips the write when the lead is already Converted and already
 *   linked to this member, and preserves any existing Converted Member links.
 *
 * Returns the number of lead rows updated.
 */
export async function markLeadConverted(
  memberEmail: string,
  memberPageId: string,
  shareCount: number,
): Promise<number> {
  if (shareCount > 1) return 0;
  const leads = await findLeadsByEmail(memberEmail);
  if (leads.length === 0) return 0;

  let converted = 0;
  for (const lead of leads) {
    const alreadyLinked = lead.convertedMemberIds.includes(memberPageId);
    if (lead.status === "Converted" && alreadyLinked) continue;
    const relationIds = alreadyLinked
      ? lead.convertedMemberIds
      : [...lead.convertedMemberIds, memberPageId];
    await patchNotionPage(lead.pageId, {
      Status: { select: { name: "Converted" } },
      "Converted Member": { relation: relationIds.map((id) => ({ id })) },
    });
    converted += 1;
  }
  return converted;
}
