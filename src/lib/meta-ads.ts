const GRAPH_API = "https://graph.facebook.com/v21.0";

export type MetaAdsMonthly = {
  month: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  landingPageViews: number;
  costPerLead: number | null;
};

export type MetaAdsSummary = {
  months: MetaAdsMonthly[];
  last30Days: {
    spend: number;
    leads: number;
    costPerLead: number | null;
    impressions: number;
    clicks: number;
  } | null;
};

function actionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  type: string,
): number {
  if (!actions) return 0;
  const found = actions.find((a) => a.action_type === type);
  return found ? parseInt(found.value, 10) : 0;
}

export async function fetchMetaAdsMonthly(monthsBack = 6): Promise<MetaAdsSummary> {
  const token = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;
  if (!token || !accountId) return { months: [], last30Days: null };

  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const sinceStr = since.toISOString().slice(0, 10);
  const untilStr = now.toISOString().slice(0, 10);

  const [monthlyData, last30Data] = await Promise.all([
    fetchInsights(accountId, token, sinceStr, untilStr, "monthly"),
    fetchInsights(
      accountId,
      token,
      new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10),
      untilStr,
      "all_days",
    ),
  ]);

  const months: MetaAdsMonthly[] = (monthlyData ?? []).map((row) => {
    const spend = parseFloat(row.spend ?? "0");
    const leads = actionValue(row.actions, "lead");
    return {
      month: row.date_start.slice(0, 7),
      spend: Math.round(spend * 100) / 100,
      impressions: parseInt(row.impressions ?? "0", 10),
      clicks: parseInt(row.clicks ?? "0", 10),
      leads,
      landingPageViews: actionValue(row.actions, "landing_page_view"),
      costPerLead: leads > 0 ? Math.round((spend / leads) * 100) / 100 : null,
    };
  });

  let last30Days: MetaAdsSummary["last30Days"] = null;
  if (last30Data && last30Data.length > 0) {
    const row = last30Data[0];
    const spend = parseFloat(row.spend ?? "0");
    const leads = actionValue(row.actions, "lead");
    last30Days = {
      spend: Math.round(spend * 100) / 100,
      leads,
      costPerLead: leads > 0 ? Math.round((spend / leads) * 100) / 100 : null,
      impressions: parseInt(row.impressions ?? "0", 10),
      clicks: parseInt(row.clicks ?? "0", 10),
    };
  }

  return { months, last30Days };
}

type InsightRow = {
  spend: string;
  impressions: string;
  clicks: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
};

async function fetchInsights(
  accountId: string,
  token: string,
  since: string,
  until: string,
  timeIncrement: string,
): Promise<InsightRow[] | null> {
  const params = new URLSearchParams({
    fields: "spend,impressions,clicks,actions",
    time_range: JSON.stringify({ since, until }),
    time_increment: timeIncrement,
    access_token: token,
  });

  try {
    const res = await fetch(`${GRAPH_API}/${accountId}/insights?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: InsightRow[] };
    return json.data ?? null;
  } catch {
    return null;
  }
}
