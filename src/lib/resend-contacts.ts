const RESEND_API = "https://api.resend.com";

export type ResendMarketingContact = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  unsubscribed: boolean;
  segmentNames: string[];
};

type ResendSegment = {
  id: string;
  name: string;
};

type ResendContact = {
  id: string;
  email: string;
  unsubscribed: boolean;
};

const MANAGED_SEGMENTS = new Set([
  "General",
  "Members",
  "Leads",
  "Marketing - All",
  "Members - Current",
  "Leads - Open",
]);

let segmentCache: Map<string, ResendSegment> | null = null;

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function resendJson<T>(
  apiKey: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await resendFetch(apiKey, path, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${init.method ?? "GET"} ${path} failed: ${res.status} ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

async function resendFetch(
  apiKey: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(`${RESEND_API}${path}`, {
      ...init,
      headers: {
        ...headers(apiKey),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
    if (res.status !== 429) return res;
    lastResponse = res;
    const retryAfter = Number(res.headers.get("retry-after"));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 750 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return lastResponse!;
}

async function listSegments(apiKey: string): Promise<ResendSegment[]> {
  const data = await resendJson<{ data: ResendSegment[] }>(apiKey, "/segments");
  return data.data;
}

async function createSegment(apiKey: string, name: string): Promise<ResendSegment> {
  return resendJson<ResendSegment>(apiKey, "/segments", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

async function ensureSegmentIds(apiKey: string, names: string[]): Promise<string[]> {
  const uniqueNames = Array.from(new Set(names.filter(Boolean)));
  segmentCache ??= new Map((await listSegments(apiKey)).map((segment) => [segment.name, segment]));
  const ids: string[] = [];

  for (const name of uniqueNames) {
    const segment = segmentCache.get(name) ?? await createSegment(apiKey, name);
    segmentCache.set(name, segment);
    ids.push(segment.id);
  }

  return ids;
}

async function getContact(apiKey: string, email: string): Promise<ResendContact | null> {
  const res = await resendFetch(apiKey, `/contacts/${encodeURIComponent(email)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend GET contact failed: ${res.status} ${body.slice(0, 300)}`);
  }
  return (await res.json()) as ResendContact;
}

async function addContactToSegment(apiKey: string, email: string, segmentId: string): Promise<boolean> {
  const res = await resendFetch(apiKey, `/contacts/${encodeURIComponent(email)}/segments/${segmentId}`, {
    method: "POST",
  });
  if (res.ok) return true;
  const body = await res.text().catch(() => "");
  if (res.status === 409 || /already/i.test(body)) return false;
  throw new Error(`Resend add segment failed: ${res.status} ${body.slice(0, 300)}`);
}

async function listContactSegments(apiKey: string, email: string): Promise<ResendSegment[]> {
  const data = await resendJson<{ data: ResendSegment[] }>(
    apiKey,
    `/contacts/${encodeURIComponent(email)}/segments`,
  );
  return data.data ?? [];
}

async function removeContactFromSegment(apiKey: string, email: string, segmentId: string): Promise<boolean> {
  const res = await resendFetch(apiKey, `/contacts/${encodeURIComponent(email)}/segments/${segmentId}`, {
    method: "DELETE",
  });
  if (res.ok) return true;
  if (res.status === 404) return false;
  const body = await res.text().catch(() => "");
  throw new Error(`Resend remove segment failed: ${res.status} ${body.slice(0, 300)}`);
}

async function reconcileManagedSegments(
  apiKey: string,
  email: string,
  desiredSegmentNames: string[],
): Promise<boolean> {
  const desired = new Set(desiredSegmentNames);
  const current = await listContactSegments(apiKey, email);
  let changed = false;

  for (const segment of current) {
    if (MANAGED_SEGMENTS.has(segment.name) && !desired.has(segment.name)) {
      changed = await removeContactFromSegment(apiKey, email, segment.id) || changed;
    }
  }

  return changed;
}

export async function upsertResendMarketingContact(
  apiKey: string,
  input: ResendMarketingContact,
): Promise<"created" | "updated" | "unchanged"> {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("email required");

  const segmentIds = await ensureSegmentIds(apiKey, input.segmentNames);
  const existing = await getContact(apiKey, email);

  if (!existing) {
    await resendJson(apiKey, "/contacts", {
      method: "POST",
      body: JSON.stringify({
        email,
        firstName: input.firstName || undefined,
        lastName: input.lastName || undefined,
        unsubscribed: input.unsubscribed,
        segments: segmentIds.map((id) => ({ id })),
      }),
    });
    return "created";
  }

  // Preserve a Resend-side unsubscribe even if Notion is stale. The webhook
  // should copy unsubscribes back to Notion, but this prevents accidental
  // re-subscription during a manual backfill.
  const desiredUnsubscribed = existing.unsubscribed || input.unsubscribed;
  let changed = false;

  if (existing.unsubscribed !== desiredUnsubscribed) {
    await resendJson(apiKey, `/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({ unsubscribed: desiredUnsubscribed }),
    });
    changed = true;
  }

  for (const segmentId of segmentIds) {
    changed = await addContactToSegment(apiKey, email, segmentId) || changed;
  }
  changed = await reconcileManagedSegments(apiKey, email, input.segmentNames) || changed;

  return changed ? "updated" : "unchanged";
}
