import { fetchMembershipSummaryByCustomer } from "@/lib/teamup-memberships";
import { teamupGet } from "@/lib/teamup";
import { detectExpansionTriggers, type SessionSlot } from "@/lib/teamup-events";
import { fetchMetaAdsMonthly, type MetaAdsSummary } from "@/lib/meta-ads";

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
  metaAds: MetaAdsSummary;
  leadFunnel: {
    total: number;
    byStatus: Record<string, number>;
    monthlyVolume: Array<{ month: string; count: number; converted: number }>;
    conversionRate: number | null;
    avgDaysToConvert: number | null;
  };
  pnl: {
    month: string;
    revenue: number;
    fixedCosts: number;
    adSpend: number;
    totalCosts: number;
    netProfit: number;
    fixedBreakdown: Array<{ item: string; amount: number }>;
    monthlyHistory: Array<{
      month: string;
      revenue: number;
      adSpend: number;
      totalCosts: number;
      netProfit: number;
    }>;
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

const LEADS_DB_ID = "3e2ca304-ebd8-4cea-8202-d0003bf94a6f";

const FIXED_COSTS: Array<{ item: string; amount: number }> = [
  { item: "Rent", amount: 1500 },
  { item: "Utilities", amount: 150 },
  { item: "Insurance", amount: 100 },
  { item: "Software/systems", amount: 100 },
  { item: "Marketing (non-ads)", amount: 400 },
  { item: "Miscellaneous", amount: 250 },
];

const TOTAL_FIXED = FIXED_COSTS.reduce((sum, c) => sum + c.amount, 0);

type LeadRow = {
  status: string;
  firstContact: string | null;
  hasConvertedMember: boolean;
};

async function fetchAllLeads(): Promise<LeadRow[]> {
  const { token } = notionConfig();
  const rows: LeadRow[] = [];
  let cursor: string | undefined = undefined;
  while (true) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${LEADS_DB_ID}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Notion leads query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      results: Array<{
        properties: {
          Status?: { select?: { name: string } | null };
          "First Contact"?: { date?: { start: string } | null };
          "Converted Member"?: { relation?: Array<{ id: string }> };
        };
      }>;
      next_cursor: string | null;
      has_more: boolean;
    };
    for (const row of data.results) {
      rows.push({
        status: row.properties.Status?.select?.name ?? "Unknown",
        firstContact: row.properties["First Contact"]?.date?.start ?? null,
        hasConvertedMember: (row.properties["Converted Member"]?.relation?.length ?? 0) > 0,
      });
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return rows;
}

function buildLeadFunnel(leads: LeadRow[]) {
  const byStatus: Record<string, number> = {};
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  }

  const converted = leads.filter((l) => l.status === "Converted" || l.hasConvertedMember);
  const conversionRate = leads.length > 0 ? round2((converted.length / leads.length) * 100) : null;

  // Monthly volume (last 6 months)
  const monthMap = new Map<string, { count: number; converted: number }>();
  for (const l of leads) {
    if (!l.firstContact) continue;
    const month = l.firstContact.slice(0, 7);
    const entry = monthMap.get(month) ?? { count: 0, converted: 0 };
    entry.count += 1;
    if (l.status === "Converted" || l.hasConvertedMember) entry.converted += 1;
    monthMap.set(month, entry);
  }
  const monthlyVolume = Array.from(monthMap.entries())
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 6)
    .reverse();

  return {
    total: leads.length,
    byStatus,
    monthlyVolume,
    conversionRate,
    avgDaysToConvert: null as number | null,
  };
}

function buildPnl(
  monthlyRevenue: Array<{ month: string; net: number }>,
  metaAdsMonths: Array<{ month: string; spend: number }>,
) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentRevenue = monthlyRevenue.find((r) => r.month === currentMonth)?.net ?? 0;
  const currentAdSpend = metaAdsMonths.find((m) => m.month === currentMonth)?.spend ?? 0;
  const totalCosts = TOTAL_FIXED + currentAdSpend;

  const monthlyHistory = monthlyRevenue.map((r) => {
    const adSpend = metaAdsMonths.find((m) => m.month === r.month)?.spend ?? 0;
    const costs = TOTAL_FIXED + adSpend;
    return {
      month: r.month,
      revenue: r.net,
      adSpend,
      totalCosts: costs,
      netProfit: round2(r.net - costs),
    };
  });

  return {
    month: currentMonth,
    revenue: currentRevenue,
    fixedCosts: TOTAL_FIXED,
    adSpend: currentAdSpend,
    totalCosts,
    netProfit: round2(currentRevenue - totalCosts),
    fixedBreakdown: FIXED_COSTS,
    monthlyHistory,
  };
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
    metaAds,
    allLeads,
  ] = await Promise.all([
    fetchActiveCustomerMemberships(),
    countMembersByStatus(membersDbId, null),
    countMembersByStatus(membersDbId, "Active"),
    fetchTeamupRevenueRows(financesDbId),
    fetchMembershipSummaryByCustomer(),
    detectExpansionTriggers(14, 5),
    fetchMetaAdsMonthly(6),
    fetchAllLeads(),
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
    metaAds,
    leadFunnel: buildLeadFunnel(allLeads),
    pnl: buildPnl(monthlyRevenue, metaAds.months),
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

  // Meta Ads spend section
  if (m.metaAds.months.length > 0 || m.metaAds.last30Days) {
    blocks.push(heading2("Meta Ads spend"));
    if (m.metaAds.last30Days) {
      const a = m.metaAds.last30Days;
      const cplText = a.costPerLead !== null ? ` (${sym}${a.costPerLead.toFixed(2)} per lead)` : "";
      blocks.push(
        callout(
          "📣",
          `${sym}${a.spend.toFixed(2)} spent in the last 30 days, generating ${a.leads} lead${a.leads === 1 ? "" : "s"}${cplText}. ${a.impressions.toLocaleString()} impressions, ${a.clicks} clicks.`,
        ),
      );
    }
    if (m.metaAds.months.length > 0) {
      const chartUrl = metaAdsChartUrl(m);
      if (chartUrl) blocks.push(image(chartUrl));
      blocks.push(paragraph("Monthly ad spend (bars) vs leads generated (line)."));
      for (const month of m.metaAds.months) {
        const cplText = month.costPerLead !== null ? ` | CPL ${sym}${month.costPerLead.toFixed(2)}` : "";
        blocks.push(
          bullet(
            `${month.month}: ${sym}${month.spend.toFixed(2)} spend, ${month.leads} leads, ${month.landingPageViews} LPVs${cplText}`,
          ),
        );
      }
    }
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

  // Lead funnel
  if (m.leadFunnel.total > 0) {
    blocks.push(heading2("Lead funnel"));
    const f = m.leadFunnel;
    const statusLine = Object.entries(f.byStatus)
      .sort((a, b) => b[1] - a[1])
      .map(([s, n]) => `${s}: ${n}`)
      .join(" | ");
    blocks.push(
      callout(
        "🎯",
        `${f.total} total leads. Conversion rate: ${f.conversionRate !== null ? f.conversionRate + "%" : "N/A"}`,
      ),
    );
    blocks.push(paragraph(statusLine));
    if (f.monthlyVolume.length > 0) {
      const chartUrl = leadFunnelChartUrl(m);
      if (chartUrl) blocks.push(image(chartUrl));
      for (const mv of f.monthlyVolume) {
        const rate = mv.count > 0 ? round2((mv.converted / mv.count) * 100) : 0;
        blocks.push(
          bullet(`${mv.month}: ${mv.count} leads, ${mv.converted} converted (${rate}%)`),
        );
      }
    }
  }

  // P&L
  blocks.push(heading2("Profit & Loss"));
  const p = m.pnl;
  const isCurrentMonthPartial = p.month === m.generatedAt.slice(0, 7);
  const profitEmoji = p.netProfit >= 0 ? "✅" : isCurrentMonthPartial ? "📊" : "🔴";
  const partialNote = isCurrentMonthPartial ? " (month-to-date; revenue will increase as invoices land)" : "";
  blocks.push(
    callout(
      profitEmoji,
      `${p.month}: ${sym}${p.revenue.toFixed(0)} revenue − ${sym}${p.totalCosts.toFixed(0)} costs = ${sym}${p.netProfit.toFixed(0)} net${partialNote}`,
    ),
  );
  blocks.push(paragraph("Fixed monthly costs:"));
  for (const c of p.fixedBreakdown) {
    blocks.push(bullet(`${c.item}: ${sym}${c.amount}`));
  }
  blocks.push(bullet(`Meta Ads (variable): ${sym}${p.adSpend.toFixed(2)}`));
  blocks.push(bullet(`Total costs: ${sym}${p.totalCosts.toFixed(0)}`));

  if (p.monthlyHistory.length > 1) {
    blocks.push(heading2("Month-over-month P&L"));
    const pnlChartUrl = pnlHistoryChartUrl(m);
    if (pnlChartUrl) blocks.push(image(pnlChartUrl));
    for (const h of p.monthlyHistory) {
      const sign = h.netProfit >= 0 ? "+" : "";
      blocks.push(
        bullet(
          `${h.month}: ${sym}${h.revenue.toFixed(0)} rev − ${sym}${h.totalCosts.toFixed(0)} costs = ${sign}${sym}${h.netProfit.toFixed(0)}`,
        ),
      );
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

function leadFunnelChartUrl(m: DashboardMetrics): string | null {
  if (m.leadFunnel.monthlyVolume.length === 0) return null;
  const labels = m.leadFunnel.monthlyVolume.map((r) => r.month);
  const totalData = m.leadFunnel.monthlyVolume.map((r) => r.count);
  const convertedData = m.leadFunnel.monthlyVolume.map((r) => r.converted);
  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Leads",
          data: totalData,
          backgroundColor: "rgba(31,111,235,0.6)",
        },
        {
          label: "Converted",
          data: convertedData,
          backgroundColor: "rgba(45,164,78,0.8)",
        },
      ],
    },
    options: {
      plugins: {
        title: { display: true, text: "Monthly leads vs conversions" },
        datalabels: { display: true, color: "#222" },
      },
      scales: { y: { beginAtZero: true } },
    },
  };
  return quickChartUrl(config, 700, 300);
}

function pnlHistoryChartUrl(m: DashboardMetrics): string | null {
  if (m.pnl.monthlyHistory.length === 0) return null;
  const labels = m.pnl.monthlyHistory.map((r) => r.month);
  const revenueData = m.pnl.monthlyHistory.map((r) => r.revenue);
  const costsData = m.pnl.monthlyHistory.map((r) => r.totalCosts);
  const profitData = m.pnl.monthlyHistory.map((r) => r.netProfit);
  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue (£)",
          data: revenueData,
          backgroundColor: "rgba(45,164,78,0.6)",
        },
        {
          label: "Costs (£)",
          data: costsData,
          backgroundColor: "rgba(234,67,53,0.5)",
        },
        {
          label: "Net Profit (£)",
          data: profitData,
          type: "line",
          borderColor: "#1f6feb",
          backgroundColor: "rgba(31,111,235,0.1)",
          fill: false,
          tension: 0.25,
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: {
        title: { display: true, text: "Monthly P&L (£)" },
        datalabels: { display: false },
      },
      scales: { y: { ticks: { callback: "function(v){return '£'+v}" } } },
    },
  };
  return quickChartUrl(config, 700, 320);
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
    type: "bar",
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
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        title: { display: true, text: `MRR contribution by programme (${m.mrrCurrencySymbol})` },
        datalabels: { align: "end", anchor: "end", color: "#222" },
      },
      scales: {
        x: { beginAtZero: true },
      },
    },
  };
  return quickChartUrl(config, 700, Math.max(220, labels.length * 40 + 80));
}

function metaAdsChartUrl(m: DashboardMetrics): string | null {
  if (m.metaAds.months.length === 0) return null;
  const labels = m.metaAds.months.map((r) => r.month);
  const spendData = m.metaAds.months.map((r) => r.spend);
  const leadsData = m.metaAds.months.map((r) => r.leads);
  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Spend (£)",
          data: spendData,
          backgroundColor: "rgba(234,67,53,0.6)",
          yAxisID: "y",
        },
        {
          label: "Leads",
          data: leadsData,
          type: "line",
          borderColor: "#1f6feb",
          backgroundColor: "rgba(31,111,235,0.15)",
          fill: false,
          tension: 0.25,
          pointRadius: 4,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      plugins: {
        title: { display: true, text: "Meta Ads: monthly spend vs leads" },
        datalabels: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          position: "left",
          ticks: { callback: "function(v){return '£'+v}" },
          title: { display: true, text: "Spend (£)" },
        },
        y1: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Leads" },
        },
      },
    },
  };
  return quickChartUrl(config, 700, 320);
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
