import { fetchMembershipSummaryByCustomer } from "@/lib/teamup-memberships";
import { teamupGet } from "@/lib/teamup";
import { detectExpansionTriggers, type SessionSlot } from "@/lib/teamup-events";

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
  recurringMembers: number;
  recurringMrr: number;
  prepaidActive: number;
  prepaidActivePeople: number;
  mrrCurrencySymbol: string;
  programmeBreakdown: Array<{
    programme: string;
    count: number;
    mrrContribution: number;
    cohort: "recurring" | "prepaid";
  }>;
  monthlyRevenue: Array<{ month: string; net: number; invoiceCount: number }>;
  atRiskCount: number;
  netLast30Days: number;
  capacity: {
    windowDays: number;
    threshold: number;
    slotsAtThreshold: SessionSlot[];
    topSlots: SessionSlot[];
  };
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

  const [
    activeMemberships,
    totalMembers,
    activeMembers,
    revenueRows,
    membershipSummaries,
    expansionTriggers,
  ] = await Promise.all([
    fetchActiveCustomerMemberships(),
    countMembersByStatus(membersDbId, null),
    countMembersByStatus(membersDbId, "Active"),
    fetchTeamupRevenueRows(financesDbId),
    fetchMembershipSummaryByCustomer(),
    detectExpansionTriggers(14, 5),
  ]);

  // Programme breakdown: count + MRR contribution per programme name.
  // Programmes that bill £0 are pre-paid one-offs (e.g. 30 Day Strength,
  // 5-Week Fix); they contribute one-off revenue at signup, not MRR.
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
    .map(([programme, v]) => ({
      programme,
      count: v.count,
      mrrContribution: round2(v.mrr),
      cohort: (v.mrr > 0 ? "recurring" : "prepaid") as "recurring" | "prepaid",
    }))
    .sort((a, b) => b.mrrContribution - a.mrrContribution);

  const recurringMembers = programmeBreakdown
    .filter((p) => p.cohort === "recurring")
    .reduce((sum, p) => sum + p.count, 0);
  const recurringMrr = programmeBreakdown
    .filter((p) => p.cohort === "recurring")
    .reduce((sum, p) => sum + p.mrrContribution, 0);
  const prepaidActive = programmeBreakdown.filter((p) => p.cohort === "prepaid").length;
  const prepaidActivePeople = programmeBreakdown
    .filter((p) => p.cohort === "prepaid")
    .reduce((sum, p) => sum + p.count, 0);

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
    recurringMembers,
    recurringMrr: round2(recurringMrr),
    prepaidActive,
    prepaidActivePeople,
    mrrCurrencySymbol: "£",
    programmeBreakdown,
    monthlyRevenue,
    atRiskCount,
    netLast30Days: round2(netLast30Days),
    capacity: {
      windowDays: expansionTriggers.windowDays,
      threshold: expansionTriggers.threshold,
      slotsAtThreshold: expansionTriggers.slotsAtThreshold,
      topSlots: expansionTriggers.allSlots.slice(0, 8),
    },
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
  const sym = m.mrrCurrencySymbol;
  const blocks: unknown[] = [
    paragraph(`Auto-generated ${dateLabel}. Refreshes Mondays at 08:00 UTC.`),
    heading2("Headline numbers"),
    callout(
      "💷",
      `${sym}${m.recurringMrr.toFixed(2)} MRR from ${m.recurringMembers} recurring member${m.recurringMembers === 1 ? "" : "s"} (avg ${sym}${m.recurringMembers > 0 ? (m.recurringMrr / m.recurringMembers).toFixed(0) : "0"}/mo)`,
    ),
    callout(
      "📈",
      `${sym}${m.netLast30Days.toFixed(2)} net revenue in the last 30 days (includes one-off programme purchases)`,
    ),
    callout(
      "🎫",
      `${m.prepaidActivePeople} ${m.prepaidActivePeople === 1 ? "person is" : "people are"} on a pre-paid programme right now (one-off revenue, no MRR contribution)`,
    ),
    callout(
      "👥",
      `${m.activeMembers} Notion-Active members (of ${m.totalMembers} total in TeamUp; the difference is leads, lapsed, or PT-only customers)`,
    ),
  ];

  if (m.monthlyRevenue.length > 0) {
    blocks.push(heading2("Revenue trend (last 6 months)"));
    const chartUrl = revenueLineChartUrl(m);
    if (chartUrl) blocks.push(image(chartUrl));
    blocks.push(paragraph(`Net invoice revenue per month, GBP.`));
  }

  // Programme MRR contribution as a horizontal bar chart (recurring only).
  const billed = m.programmeBreakdown.filter((p) => p.cohort === "recurring");
  if (billed.length > 0) {
    blocks.push(heading2("MRR by programme"));
    const chartUrl = programmeBarChartUrl(m, billed);
    if (chartUrl) blocks.push(image(chartUrl));
  }

  const recurringList = m.programmeBreakdown.filter((p) => p.cohort === "recurring");
  const prepaidList = m.programmeBreakdown.filter((p) => p.cohort === "prepaid");
  if (recurringList.length > 0) {
    blocks.push(heading2("Active recurring programmes"));
    for (const p of recurringList) {
      blocks.push(
        bullet(
          `${p.programme} - ${p.count} member${p.count === 1 ? "" : "s"}, ${m.mrrCurrencySymbol}${p.mrrContribution.toFixed(2)}/mo`,
        ),
      );
    }
  }
  if (prepaidList.length > 0) {
    blocks.push(heading2("Active pre-paid programmes"));
    blocks.push(
      paragraph(
        "These customers have already paid in full for a fixed-length programme. They sit in 'active' status until expiry and don't contribute to MRR.",
      ),
    );
    for (const p of prepaidList) {
      blocks.push(bullet(`${p.programme} - ${p.count} customer${p.count === 1 ? "" : "s"}`));
    }
  }

  blocks.push(heading2("Session capacity (last 14 days)"));
  if (m.capacity.slotsAtThreshold.length > 0) {
    blocks.push(
      callout(
        "⚠️",
        `${m.capacity.slotsAtThreshold.length} session slot${m.capacity.slotsAtThreshold.length === 1 ? "" : "s"} averaging ${m.capacity.threshold}+/${m.capacity.topSlots[0]?.capacity ?? 6} for the last ${m.capacity.windowDays} days. Time to add the next session from the expansion list.`,
      ),
    );
    for (const s of m.capacity.slotsAtThreshold) {
      blocks.push(
        bullet(
          `${s.slotKey} - avg ${s.averageAttending.toFixed(1)}/${s.capacity} across ${s.occurrences.length} session${s.occurrences.length === 1 ? "" : "s"}`,
        ),
      );
    }
  } else {
    blocks.push(
      paragraph(
        `No session slots are at the ${m.capacity.threshold}/${m.capacity.topSlots[0]?.capacity ?? 6} expansion threshold yet.`,
      ),
    );
  }
  if (m.capacity.topSlots.length > 0) {
    blocks.push(paragraph(`Top sessions by average attendance:`));
    for (const s of m.capacity.topSlots) {
      blocks.push(
        bullet(
          `${s.slotKey} (${s.sampleName}) - avg ${s.averageAttending.toFixed(1)}/${s.capacity}, ${s.occurrences.length} occurrence${s.occurrences.length === 1 ? "" : "s"}`,
        ),
      );
    }
  }

  blocks.push(heading2("Notes"));
  blocks.push(
    bullet(
      "MRR sums billed_price across active customer_memberships. Programmes billing £0 (pre-paid one-offs like 30 Day Strength) sit in 'active' state in TeamUp but don't contribute to MRR.",
    ),
  );
  blocks.push(
    bullet(
      "Charts auto-render via QuickChart when the data changes. They will update on the next Monday cron.",
    ),
  );
  blocks.push(
    bullet(
      "At-risk members live on a separate page generated by the Wednesday retention digest cron.",
    ),
  );

  return blocks;
}

function revenueLineChartUrl(m: DashboardMetrics): string | null {
  if (m.monthlyRevenue.length === 0) return null;
  const labels = m.monthlyRevenue.map((r) => r.month);
  const data = m.monthlyRevenue.map((r) => r.net);
  const config = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Net revenue (£)",
          data,
          borderColor: "#1f6feb",
          backgroundColor: "rgba(31,111,235,0.15)",
          fill: true,
          tension: 0.25,
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: `Last 6 months net revenue (${m.mrrCurrencySymbol})` },
        datalabels: { align: "top", anchor: "end", color: "#222" },
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: "function(v){return '" + m.mrrCurrencySymbol + "'+v}" } },
      },
    },
  };
  return quickChartUrl(config, 700, 320);
}

function programmeBarChartUrl(
  m: DashboardMetrics,
  billed: DashboardMetrics["programmeBreakdown"],
): string | null {
  const labels = billed.map((p) => p.programme.replace(/Gain /g, "").slice(0, 30));
  const data = billed.map((p) => p.mrrContribution);
  const config = {
    type: "horizontalBar",
    data: {
      labels,
      datasets: [
        {
          label: "Billed (£)",
          data,
          backgroundColor: "#2da44e",
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: `MRR contribution by programme (${m.mrrCurrencySymbol})` },
        datalabels: { align: "end", anchor: "end", color: "#222" },
      },
      scales: {
        xAxes: [
          { ticks: { beginAtZero: true, callback: "function(v){return '" + m.mrrCurrencySymbol + "'+v}" } },
        ],
      },
    },
  };
  return quickChartUrl(config, 700, Math.max(220, labels.length * 40 + 80));
}

function quickChartUrl(config: unknown, width: number, height: number): string {
  const c = encodeURIComponent(JSON.stringify(config));
  return `https://quickchart.io/chart?c=${c}&w=${width}&h=${height}&backgroundColor=white&v=4`;
}

function image(url: string) {
  return {
    object: "block",
    type: "image",
    image: { type: "external", external: { url } },
  };
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
