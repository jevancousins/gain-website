import { fetchMonthlyRevenue } from "@/lib/teamup-invoices";
import { syncTeamupMonthlyRevenue } from "@/lib/notion-finances";

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

  const startedAt = Date.now();
  try {
    const monthly = await fetchMonthlyRevenue();
    const upsert = await syncTeamupMonthlyRevenue(monthly);
    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      months: monthly.length,
      summary: monthly.slice(-6),
      ...upsert,
    });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}
