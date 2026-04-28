import { getAuthApplication, TeamUpError } from "@/lib/teamup";

export async function GET(request: Request) {
  const expectedKey = process.env.TEAMUP_DIAG_KEY;
  if (!expectedKey) {
    return Response.json({ error: "diagnose disabled" }, { status: 404 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== expectedKey) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const checks: Record<string, unknown> = {
    hasToken: Boolean(process.env.TEAMUP_APPLICATION_TOKEN),
    providerIdEnv: process.env.TEAMUP_PROVIDER_ID ?? null,
  };

  try {
    const app = await getAuthApplication();
    checks.authApplication = {
      ok: true,
      id: app.id,
      name: app.name,
      scopedProviders: app.scoped_providers.map((p) => ({ id: p.id, name: p.name })),
    };
  } catch (err) {
    if (err instanceof TeamUpError) {
      checks.authApplication = { ok: false, status: err.status, body: err.body.slice(0, 500) };
    } else {
      checks.authApplication = { ok: false, error: (err as Error).message };
    }
  }

  return Response.json(checks);
}
