/**
 * One-off backfill: copy marketing-consent fields from Leads to Members
 * for any existing Members whose Lead record predates the consent capture.
 *
 * Run: npx tsx scripts/backfill-consent.ts
 *
 * Requires NOTION_TOKEN, NOTION_LEADS_DB_ID, NOTION_MEMBERS_DB_ID in .env.local.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

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

type MemberRow = {
  id: string;
  properties: {
    Email?: { email: string | null };
    "Newsletter Consent Version"?: { rich_text?: Array<{ plain_text: string }> };
  };
};

async function loadAllLeads(): Promise<Map<string, LeadRow>> {
  const dbId = process.env.NOTION_LEADS_DB_ID!;
  const index = new Map<string, LeadRow>();
  let cursor: string | undefined;

  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Leads query: ${res.status}`);
    const data = (await res.json()) as {
      results: LeadRow[];
      next_cursor: string | null;
      has_more: boolean;
    };
    for (const row of data.results) {
      const email = row.properties.Email?.email?.toLowerCase();
      if (email) index.set(email, row);
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return index;
}

async function loadAllMembers(): Promise<MemberRow[]> {
  const dbId = process.env.NOTION_MEMBERS_DB_ID!;
  const rows: MemberRow[] = [];
  let cursor: string | undefined;

  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Members query: ${res.status}`);
    const data = (await res.json()) as {
      results: MemberRow[];
      next_cursor: string | null;
      has_more: boolean;
    };
    rows.push(...data.results);
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return rows;
}

async function main() {
  console.log("Loading leads and members...");
  const [leads, members] = await Promise.all([loadAllLeads(), loadAllMembers()]);
  console.log(`Found ${leads.size} leads, ${members.length} members`);

  let copied = 0;
  let skipped = 0;
  let noLead = 0;

  for (const member of members) {
    const email = member.properties.Email?.email?.toLowerCase();
    if (!email) { skipped++; continue; }

    const existingConsent = member.properties["Newsletter Consent Version"]?.rich_text
      ?.map((t) => t.plain_text)
      .join("");
    if (existingConsent) { skipped++; continue; }

    const lead = leads.get(email);
    if (!lead) { noLead++; continue; }

    const newsletter = lead.properties.Newsletter?.checkbox ?? false;
    const consentVersion = lead.properties["Newsletter Consent Version"]?.rich_text
      ?.map((t) => t.plain_text)
      .join("") || null;

    if (!newsletter && !consentVersion) { skipped++; continue; }

    const props: Record<string, unknown> = {
      Newsletter: { checkbox: newsletter },
    };
    if (consentVersion) {
      props["Newsletter Consent Version"] = {
        rich_text: [{ text: { content: consentVersion } }],
      };
    }
    const consentAt = lead.properties["Newsletter Consent At"]?.date?.start;
    if (consentAt) {
      props["Newsletter Consent At"] = { date: { start: consentAt } };
    }
    const unsubAt = lead.properties["Newsletter Unsubscribed At"]?.date?.start;
    if (unsubAt) {
      props["Newsletter Unsubscribed At"] = { date: { start: unsubAt } };
    }
    const unsubReason = lead.properties["Newsletter Unsubscribe Reason"]?.select?.name;
    if (unsubReason) {
      props["Newsletter Unsubscribe Reason"] = { select: { name: unsubReason } };
    }

    const res = await fetch(`${NOTION_API}/pages/${member.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ properties: props }),
    });
    if (!res.ok) {
      console.error(`Failed to patch member ${member.id}: ${res.status}`);
      continue;
    }
    copied++;
    console.log(`Copied consent for ${email}`);
  }

  console.log(`Done. Copied: ${copied}, Skipped: ${skipped}, No matching lead: ${noLead}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
