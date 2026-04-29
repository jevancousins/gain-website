import { findAtRiskMembers, postRetentionDigestPage } from "@/lib/notion-retention";

const DEFAULT_THRESHOLD_DAYS = 14;
const DEFAULT_LAPSED_AFTER_DAYS = 60;

function gate(request: Request): boolean {
  const expected = [process.env.TEAMUP_DIAG_KEY, process.env.CRON_SECRET].filter(
    (v): v is string => Boolean(v),
  );
  if (expected.length === 0) return false;
  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  return expected.includes(provided);
}

export async function GET(request: Request) {
  if (!gate(request)) return Response.json({ error: "not found" }, { status: 404 });

  const url = new URL(request.url);
  const thresholdDays = Number(url.searchParams.get("days") ?? DEFAULT_THRESHOLD_DAYS);
  const lapsedAfterDays = Number(url.searchParams.get("lapsedAfter") ?? DEFAULT_LAPSED_AFTER_DAYS);
  const dryRun = url.searchParams.get("dryRun") === "true";

  const parentPageId = process.env.RETENTION_DIGEST_PARENT_PAGE_ID;
  if (!dryRun && !parentPageId) {
    return Response.json({ error: "RETENTION_DIGEST_PARENT_PAGE_ID not set" }, { status: 500 });
  }

  const window = { thresholdDays, lapsedAfterDays };
  const startedAt = Date.now();
  try {
    const members = await findAtRiskMembers(window);
    const summary = {
      ok: true,
      durationMs: 0,
      thresholdDays,
      lapsedAfterDays,
      atRiskCount: members.length,
      members: members.map((m) => ({
        name: m.name,
        daysSince: m.daysSinceLastSession,
        lastSession: m.lastSession,
      })),
      pageUrl: null as string | null,
    };

    if (!dryRun && parentPageId) {
      summary.pageUrl = await postRetentionDigestPage(parentPageId, members, window);
    }

    summary.durationMs = Date.now() - startedAt;
    return Response.json(summary);
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}
