import { teamupGet, TeamUpError } from "@/lib/teamup";

export async function GET(request: Request) {
  const expected = [process.env.TEAMUP_DIAG_KEY, process.env.CRON_SECRET].filter(
    (v): v is string => Boolean(v),
  );
  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  if (!expected.includes(provided)) return Response.json({ error: "not found" }, { status: 404 });

  const customQuery = Object.fromEntries(
    Array.from(url.searchParams.entries()).filter(([k]) => !["key", "path"].includes(k)),
  );
  const path = url.searchParams.get("path") ?? "/attendances";

  try {
    const data = await teamupGet<{ count?: number; results?: Array<{ id: number; event?: unknown; status?: string }> }>(
      path,
      { query: customQuery, expand: ["event"] },
    );
    const sample = (data.results ?? []).slice(0, 5).map((r) => ({
      id: r.id,
      status: r.status,
      start: typeof r.event === "object" && r.event && "starts_at" in r.event ? (r.event as { starts_at?: string }).starts_at : null,
    }));
    return Response.json({ ok: true, count: data.count, returned: data.results?.length, sample });
  } catch (err) {
    if (err instanceof TeamUpError) return Response.json({ ok: false, status: err.status, body: err.body.slice(0, 400) });
    return Response.json({ ok: false, error: (err as Error).message });
  }
}
