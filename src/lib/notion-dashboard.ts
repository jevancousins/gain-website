import { fetchMembershipSummaryByCustomer } from "@/lib/teamup-memberships";
import { teamupGet } from "@/lib/teamup";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionConfig() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");
  return { token };
}

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export type DashboardMetrics = {
  generatedAt: string;
  activeMembers: number;
  totalMembers: number;
  mrr: number;
  mrrCurrencySymbol: string;
  programmeBreakdown: Array<{ programme: string; count: number; mrrContribution: number }>;
  monthlyRevenue: Array<{ month: string; net: number; invoiceCount: number }>;
  atRiskCount: number;
  netLast30Days: number;
};

type ActiveMembershipRow = {
  status: string;
  customer: number | string;
  name: string;
  billed_price: { decimal?: number } | null;
  membership: number | string | null;
};

type ActiveMembershipsPage = {
  results: ActiveMembershipRow[];
  next: string | null;
};

async function fetchActiveCustomerMemberships(): Promise<ActiveMembershipRow[]> {
  const out: ActiveMembershipRow[] = [];
  let path: string | null = "/customer_memberships";
  let pages = 0;
  while (path && pages < 30) {
    const page: ActiveMembershipsPage = await teamupGet<ActiveMembershipsPage>(
      path,
      pages === 0 ? { query: { limit: 100, status: "active" } } : {},
    );
    out.push(...page.results);
    if (!page.next) break;
    try {
      const parsed: URL = new URL(page.next);
      path = parsed.pathname.replace(/^\/api\/v2/, "") + parsed.search;
    } catch {
      break;
    }
    pages += 1;
  }
  return out;
}

function readNumber(prop: { number?: number | null } | undefined): number {
  return prop?.number ?? 0;
}

async function countMembersByStatus(membersDbId: string, statusEquals: string | null): Promise<number> {
  const { token } = notionConfig();
  let total = 0;
  let cursor: string | undefined = undefined;
  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (statusEquals !== null) body.filter = { property: "Status", select: { equals: statusEquals } };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${membersDbId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { results: unknown[]; next_cursor: string | null; has_more: boolean };
    total += data.results.length;
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return total;
}

async function fetchTeamupRevenueRows(financesDbId: string) {
  const { token } = notionConfig();
  const rows: Array<{ description: string; amount: number; date: string }> = [];
  let cursor: string | undefined = undefined;
  while (true) {
    const body: Record<string, unknown> = {
      page_size: 100,
      filter: { property: "Source", select: { equals: "TeamUp" } },
    };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${financesDbId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: Array<{
        properties: {
          Description?: { title?: Array<{ plain_text: string }> };
          Amount?: { number: number | null };
          Date?: { date?: { start: string } | null };
        };
      }>;
      next_cursor: string | null;
      has_more: boolean;
    };
    for (const row of data.results) {
      const description = row.properties.Description?.title?.map((t) => t.plain_text).join("") ?? "";
      const amount = readNumber(row.properties.Amount);
      const date = row.properties.Date?.date?.start ?? "";
      rows.push({ description, amount, date });
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return rows;
}

export async function buildDashboardMetrics(): Promise<DashboardMetrics> {
  const membersDbId = process.env.NOTION_MEMBERS_DB_ID;
  const financesDbId = process.env.NOTION_FINANCES_DB_ID;
  if (!membersDbId) throw new Error("NOTION_MEMBERS_DB_ID not set");
  if (!financesDbId) throw new Error("NOTION_FINANCES_DB_ID not set");

  const [activeMemberships, totalMembers, activeMembers, revenueRows, membershipSummaries] = await Promise.all([
    fetchActiveCustomerMemberships(),
    countMembersByStatus(membersDbId, null),
    countMembersByStatus(membersDbId, "Active"),
    fetchTeamupRevenueRows(financesDbId),
    fetchMembershipSummaryByCustomer(),
  ]);

  // MRR: sum billed_price across active customer_memberships.
  const mrr = activeMemberships.reduce((sum, m) => sum + (m.billed_price?.decimal ?? 0), 0);

  // Programme breakdown: count + MRR contribution per programme name.
  const programmeMap = new Map<string, { count: number; mrr: number }>();
  for (const m of activeMemberships) {
    const name = m.name || "Unknown";
    const billed = m.billed_price?.decimal ?? 0;
    const entry = programmeMap.get(name) ?? { count: 0, mrr: 0 };
    entry.count += 1;
    entry.mrr += billed;
    programmeMap.set(name, entry);
  }
  const programmeBreakdown = Array.from(programmeMap.entries())
    .map(([programme, v]) => ({ programme, count: v.count, mrrContribution: round2(v.mrr) }))
    .sort((a, b) => b.mrrContribution - a.mrrContribution);

  // Monthly revenue: extract YYYY-MM from Date and pair with Amount.
  const monthlyRevenue = revenueRows
    .filter((r) => r.description.startsWith("TeamUp Revenue"))
    .map((r) => ({
      month: r.date.slice(0, 7),
      net: r.amount,
      invoiceCount: 0,
    }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 6)
    .reverse();

  // Net last 30 days: sum revenue rows with date in last 30 days.
  const cutoff30 = new Date();
  cutoff30.setUTCDate(cutoff30.getUTCDate() - 30);
  const cutoffISO = cutoff30.toISOString().slice(0, 10);
  const netLast30Days = revenueRows
    .filter((r) => r.date >= cutoffISO && r.description.startsWith("TeamUp Revenue"))
    .reduce((sum, r) => sum + r.amount, 0);

  // At-risk count from membership summaries: members with active membership
  // whose last session is between 14 and 60 days ago. We'll keep this simple
  // and use the membership summaries to gate; an exact gap-based count needs
  // attendance data which the dashboard cron pulls separately.
  const atRiskCount = 0; // placeholder; see retention-digest cron for actual list

  return {
    generatedAt: new Date().toISOString(),
    activeMembers,
    totalMembers,
    mrr: round2(mrr),
    mrrCurrencySymbol: "£",
    programmeBreakdown,
    monthlyRevenue,
    atRiskCount,
    netLast30Days: round2(netLast30Days),
    // membershipSummaries is unused here but kept in scope above for clarity
    ...{ membershipSummariesCount: membershipSummaries.size as number },
  } as DashboardMetrics;
}

export async function refreshDashboardPage(metrics: DashboardMetrics): Promise<{ pageUrl: string }> {
  const { token } = notionConfig();
  const pageId = process.env.DASHBOARD_PAGE_ID;
  if (!pageId) throw new Error("DASHBOARD_PAGE_ID not set");

  // 1. Archive existing children to clear the page before re-rendering
  const childRes = await fetch(`${NOTION_API}/blocks/${pageId}/children?page_size=100`, {
    headers: notionHeaders(token),
  });
  if (!childRes.ok) throw new Error(`Notion list children failed: ${childRes.status}`);
  const children = (await childRes.json()) as { results: Array<{ id: string }> };
  for (const block of children.results) {
    await fetch(`${NOTION_API}/blocks/${block.id}`, {
      method: "DELETE",
      headers: notionHeaders(token),
    });
  }

  // 2. Append fresh content blocks
  const blocks = renderDashboardBlocks(metrics);
  const appendRes = await fetch(`${NOTION_API}/blocks/${pageId}/children`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ children: blocks }),
  });
  if (!appendRes.ok) throw new Error(`Notion append blocks failed: ${appendRes.status} ${await appendRes.text()}`);

  return { pageUrl: `https://www.notion.so/${pageId.replace(/-/g, "")}` };
}

function renderDashboardBlocks(m: DashboardMetrics): unknown[] {
  const dateLabel = m.generatedAt.slice(0, 10);
  const blocks: unknown[] = [
    paragraph(`Auto-generated ${dateLabel}. Refreshes Mondays at 08:00 UTC.`),
    heading2("Headline numbers"),
    callout("👥", `${m.activeMembers} active members (of ${m.totalMembers} total in TeamUp)`),
    callout("💷", `${m.mrrCurrencySymbol}${m.mrr.toFixed(2)} MRR (sum of billed prices on active memberships)`),
    callout("📈", `${m.mrrCurrencySymbol}${m.netLast30Days.toFixed(2)} net revenue in the last 30 days`),
  ];

  if (m.programmeBreakdown.length > 0) {
    blocks.push(heading2("Active programmes"));
    blocks.push(paragraph(`Each row is a TeamUp membership currently in 'active' status with its member count and total billed price.`));
    for (const p of m.programmeBreakdown) {
      blocks.push(
        bullet(
          `${p.programme} - ${p.count} member${p.count === 1 ? "" : "s"}, ${m.mrrCurrencySymbol}${p.mrrContribution.toFixed(2)} billed`,
        ),
      );
    }
  }

  if (m.monthlyRevenue.length > 0) {
    blocks.push(heading2("Last 6 months revenue"));
    blocks.push(paragraph(`Net invoice revenue per month from TeamUp.`));
    for (const r of m.monthlyRevenue) {
      blocks.push(bullet(`${r.month}: ${m.mrrCurrencySymbol}${r.net.toFixed(2)}`));
    }
  }

  blocks.push(heading2("Open follow-ups"));
  blocks.push(
    bullet(
      "MRR figure assumes one billing period per active customer_membership. Pre-paid programmes (e.g. 12-week packs) are still counted; treat with caution if a programme is non-recurring.",
    ),
  );
  blocks.push(
    bullet(
      "At-risk member count is generated separately by the Wednesday retention digest. See that page for the live list.",
    ),
  );

  return blocks;
}

function paragraph(text: string) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: text } }] } };
}

function heading2(text: string) {
  return { object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: text } }] } };
}

function callout(icon: string, text: string) {
  return {
    object: "block",
    type: "callout",
    callout: {
      icon: { type: "emoji", emoji: icon },
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

function bullet(text: string) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
