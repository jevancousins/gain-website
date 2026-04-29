import type { MonthlyRevenue } from "@/lib/teamup-invoices";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

type FinanceRow = {
  id: string;
  properties: {
    Description?: { title?: Array<{ plain_text: string }> };
    Amount?: { number: number | null };
    Source?: { select?: { name: string } | null };
    Category?: { select?: { name: string } | null };
    Type?: { select?: { name: string } | null };
    Date?: { date?: { start: string } | null };
  };
};

const TEAMUP_REVENUE_CATEGORY = "Group Memberships";
const TEAMUP_REFUND_CATEGORY = "Group Memberships";

function notionConfig() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_FINANCES_DB_ID;
  if (!token) throw new Error("NOTION_TOKEN not set");
  if (!dbId) throw new Error("NOTION_FINANCES_DB_ID not set");
  return { token, dbId };
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type ExistingRevenueRow = { pageId: string; amount: number };

/** Load existing TeamUp-sourced rows so we can update in place. */
async function loadExistingTeamupRows(): Promise<Map<string, ExistingRevenueRow>> {
  const { token, dbId } = notionConfig();
  const out = new Map<string, ExistingRevenueRow>();
  let cursor: string | undefined = undefined;
  while (true) {
    const body: Record<string, unknown> = {
      page_size: 100,
      filter: { property: "Source", select: { equals: "TeamUp" } },
    };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: FinanceRow[];
      next_cursor: string | null;
      has_more: boolean;
    };
    for (const row of data.results) {
      const desc = row.properties.Description?.title?.map((t) => t.plain_text).join("") ?? "";
      out.set(desc, { pageId: row.id, amount: row.properties.Amount?.number ?? 0 });
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return out;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const idx = Number(m) - 1;
  return `${MONTH_NAMES[idx] ?? m} ${y}`;
}

function lastDayOfMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  // Day 0 of the next month is the last day of this month.
  const d = new Date(Date.UTC(y, m, 0));
  return d.toISOString().slice(0, 10);
}

export type RevenueSyncResult = {
  monthsProcessed: number;
  created: number;
  updated: number;
  unchanged: number;
};

export async function syncTeamupMonthlyRevenue(
  monthly: MonthlyRevenue[],
): Promise<RevenueSyncResult> {
  const { token, dbId } = notionConfig();
  const result: RevenueSyncResult = { monthsProcessed: monthly.length, created: 0, updated: 0, unchanged: 0 };
  const existing = await loadExistingTeamupRows();

  for (const m of monthly) {
    const desc = `TeamUp Revenue (${monthLabel(m.month)})`;
    const date = lastDayOfMonth(m.month);
    const properties = {
      Description: { title: [{ text: { content: desc } }] },
      Amount: { number: m.net },
      Type: { select: { name: "Revenue" } },
      Source: { select: { name: "TeamUp" } },
      Category: { select: { name: TEAMUP_REVENUE_CATEGORY } },
      Date: { date: { start: date } },
      Notes: {
        rich_text: [
          {
            text: {
              content: `Auto-synced from TeamUp on ${new Date().toISOString().slice(0, 10)}. Paid £${m.paidGross.toFixed(2)} - refunds £${m.refunds.toFixed(2)} = net £${m.net.toFixed(2)} across ${m.invoiceCount} invoices.`,
            },
          },
        ],
      },
    };

    const existingRow = existing.get(desc);
    if (existingRow) {
      if (Math.abs((existingRow.amount ?? 0) - m.net) < 0.005) {
        result.unchanged += 1;
        continue;
      }
      const res = await fetch(`${NOTION_API}/pages/${existingRow.pageId}`, {
        method: "PATCH",
        headers: notionHeaders(token),
        body: JSON.stringify({ properties }),
      });
      if (!res.ok) throw new Error(`Notion update failed: ${res.status} ${await res.text()}`);
      result.updated += 1;
    } else {
      const res = await fetch(`${NOTION_API}/pages`, {
        method: "POST",
        headers: notionHeaders(token),
        body: JSON.stringify({ parent: { database_id: dbId }, properties }),
      });
      if (!res.ok) throw new Error(`Notion create failed: ${res.status} ${await res.text()}`);
      result.created += 1;
    }
  }

  return result;
}
