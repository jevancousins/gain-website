import { getAuthApplication, teamupGet, TeamUpError } from "@/lib/teamup";

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
    hasToken: Boolean(process.env.TEAMUP_M2M_TOKEN),
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
    checks.authApplication = errorShape(err);
  }

  // Probe likely endpoint paths to discover the right URL shape without doc archaeology.
  const probes = ["/customers", "/customer", "/core/customers", "/providers/customers"];
  const probeResults: Record<string, unknown> = {};
  for (const path of probes) {
    try {
      const data = await teamupGet<unknown>(path, { query: { limit: 1 } });
      probeResults[path] = { ok: true, keys: topLevelShape(data) };
    } catch (err) {
      if (err instanceof TeamUpError) {
        probeResults[path] = { ok: false, status: err.status, body: err.body.slice(0, 400) };
      } else {
        probeResults[path] = { ok: false, error: (err as Error).message };
      }
    }
  }
  checks.probes = probeResults;

  return Response.json(checks);
}

function errorShape(err: unknown) {
  if (err instanceof TeamUpError) {
    return { ok: false, status: err.status, body: err.body.slice(0, 500) };
  }
  return { ok: false, error: (err as Error).message };
}

function topLevelShape(data: unknown): unknown {
  if (data === null || typeof data !== "object") return typeof data;
  if (Array.isArray(data)) {
    return { type: "array", length: data.length, sampleKeys: data[0] && typeof data[0] === "object" ? Object.keys(data[0] as object) : null };
  }
  const obj = data as Record<string, unknown>;
  const result: Record<string, unknown> = { keys: Object.keys(obj) };
  // If there's a typical pagination wrapper, peek at the first row's keys too.
  for (const k of ["results", "data", "items", "objects"]) {
    const v = obj[k];
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") {
      result.firstRowKeys = Object.keys(v[0] as object);
      result.collectionKey = k;
      break;
    }
  }
  return result;
}
