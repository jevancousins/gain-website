import { listAllCustomers } from "@/lib/teamup-customers";
import { upsertCustomers } from "@/lib/notion-members";

export async function GET(request: Request) {
  // Two valid gate values so manual curl (TEAMUP_DIAG_KEY) and Vercel Cron
  // (CRON_SECRET, sent automatically as Authorization: Bearer) both work.
  const expected = [process.env.TEAMUP_DIAG_KEY, process.env.CRON_SECRET].filter(
    (v): v is string => Boolean(v),
  );
  if (expected.length === 0) {
    return Response.json({ error: "cron disabled" }, { status: 404 });
  }

  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  if (!expected.includes(provided)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const startedAt = Date.now();
  try {
    const customers = await listAllCustomers();
    const result = await upsertCustomers(customers);
    return Response.json({ ok: true, durationMs: Date.now() - startedAt, ...result });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}
