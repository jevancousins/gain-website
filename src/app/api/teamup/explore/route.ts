import { teamupGet, TeamUpError } from "@/lib/teamup";

type Json = Record<string, unknown>;

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

async function tryEndpoint(path: string, query?: Record<string, string | number>): Promise<Json> {
  try {
    const data = await teamupGet<unknown>(path, query ? { query } : {});
    return summary(data);
  } catch (err) {
    if (err instanceof TeamUpError) {
      return { ok: false, status: err.status, body: err.body.slice(0, 240) };
    }
    return { ok: false, error: (err as Error).message };
  }
}

function summary(data: unknown): Json {
  if (data === null || typeof data !== "object") return { ok: true, type: typeof data };
  if (Array.isArray(data)) {
    return { ok: true, type: "array", length: data.length, sampleKeys: data[0] && typeof data[0] === "object" ? Object.keys(data[0] as object) : null };
  }
  const obj = data as Record<string, unknown>;
  const out: Json = { ok: true, keys: Object.keys(obj) };
  for (const k of ["results", "data", "items", "objects"]) {
    const v = obj[k];
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") {
      out.collectionKey = k;
      out.collectionLength = v.length;
      out.firstRowKeys = Object.keys(v[0] as object);
      out.firstRowSample = sampleRow(v[0] as Record<string, unknown>);
      break;
    }
  }
  return out;
}

function sampleRow(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) out[k] = String(v);
    else if (typeof v === "object") out[k] = Array.isArray(v) ? `array[${v.length}]` : "object";
    else out[k] = String(v).slice(0, 60);
  }
  return out;
}

export async function GET(request: Request) {
  if (!gate(request)) return Response.json({ error: "not found" }, { status: 404 });

  const result: Json = {};

  // 1. Sample customer detail (all fields including phone/dob if present)
  const list = await teamupGet<{ results: Array<{ id: number }> }>("/customers", { query: { limit: 1 } });
  const sampleId = list.results[0]?.id;
  if (sampleId) {
    result.customerDetail = await tryEndpoint(`/customers/${sampleId}`);
    result.customerDetailWithExpand = await tryEndpoint(`/customers/${sampleId}`, {
      expand: "membership,memberships,active_membership,phone_number,address,date_of_birth,attendance,last_attendance",
    });
  }

  // 2. Status value distribution
  const all = await teamupGet<{ results: Array<{ status: string | null; is_lead: boolean }> }>("/customers", {
    query: { limit: 200 },
  });
  const statusCounts: Record<string, number> = {};
  for (const c of all.results) {
    const k = (c.status ?? "null") + (c.is_lead ? " (lead)" : "");
    statusCounts[k] = (statusCounts[k] ?? 0) + 1;
  }
  result.statusDistribution = statusCounts;

  // 3. Attendance endpoint discovery
  const attendancePaths = [
    "/attendances",
    "/event_attendances",
    "/event-attendances",
    "/attendance",
    `/customers/${sampleId}/attendances`,
    `/customers/${sampleId}/event_attendances`,
    "/registrations",
    "/customer_attendances",
  ];
  const probes: Record<string, Json> = {};
  for (const p of attendancePaths) {
    probes[p] = await tryEndpoint(p, { limit: 1 });
  }
  result.attendanceProbes = probes;

  // 3b. Events endpoint + attendance with expand
  result.events = await tryEndpoint("/events", { limit: 1 });
  result.attendanceWithExpand = await tryEndpoint("/attendances", { limit: 1, expand: "event,event.start_at" });
  result.attendanceFilteredAttended = await tryEndpoint("/attendances", { limit: 1, status: "attended" });

  // 4. Membership endpoint discovery
  const membershipPaths = [
    "/customer_memberships",
    "/customer-memberships",
    "/memberships",
    `/customers/${sampleId}/memberships`,
    `/customers/${sampleId}/customer_memberships`,
  ];
  const memberships: Record<string, Json> = {};
  for (const p of membershipPaths) {
    memberships[p] = await tryEndpoint(p, { limit: 1 });
  }
  result.membershipProbes = memberships;

  return Response.json(result);
}
