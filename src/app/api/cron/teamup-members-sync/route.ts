import { listAllCustomers } from "@/lib/teamup-customers";
import { upsertCustomers } from "@/lib/notion-members";

export async function GET(request: Request) {
  const expectedKey = process.env.TEAMUP_DIAG_KEY;
  if (!expectedKey) {
    return Response.json({ error: "cron disabled" }, { status: 404 });
  }

  // Allow the key as ?key= (manual / Vercel Cron URL) or Authorization: Bearer.
  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  if (provided !== expectedKey) {
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
