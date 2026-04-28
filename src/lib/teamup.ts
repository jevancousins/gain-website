const BASE_URL = "https://goteamup.com/api/v2";

export class TeamUpError extends Error {
  constructor(public status: number, public path: string, public body: string) {
    super(`TeamUp ${status} on ${path}: ${body.slice(0, 300)}`);
  }
}

type FetchOpts = {
  query?: Record<string, string | number | undefined>;
  expand?: string[];
};

export async function teamupGet<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const token = process.env.TEAMUP_APPLICATION_TOKENS;
  if (!token) throw new Error("TEAMUP_APPLICATION_TOKENS not set");

  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  if (opts.expand?.length) url.searchParams.set("expand", opts.expand.join(","));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new TeamUpError(res.status, path, body);
  }
  return (await res.json()) as T;
}

export type AuthApplication = {
  id: number;
  name: string;
  object: "authenticated_application";
  scoped_providers: Array<{ id: number; name: string; object: "scoped_provider" }>;
};

export async function getAuthApplication() {
  return teamupGet<AuthApplication>("/auth/application");
}
