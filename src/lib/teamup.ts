import { getTeamupTokens, upsertTeamupTokens } from "@/lib/notion-tokens";

const BASE_URL = "https://goteamup.com/api/v2";
const REFRESH_URL = "https://goteamup.com/api/v2/auth/refresh_access_token";
const REFRESH_LEEWAY_MS = 60_000;

export class TeamUpError extends Error {
  constructor(public status: number, public path: string, public body: string) {
    super(`TeamUp ${status} on ${path}: ${body.slice(0, 300)}`);
  }
}

type FetchOpts = {
  query?: Record<string, string | number | undefined>;
  expand?: string[];
};

type AuthMode =
  | { kind: "application" }
  | { kind: "oauth" };

function authMode(): AuthMode {
  // Prefer OAuth (provider-mode access). Fall back to the static Application
  // Token only for the /auth/application diagnostic, which works under either.
  if (process.env.TEAMUP_TOKENS_DB_ID) return { kind: "oauth" };
  return { kind: "application" };
}

async function getAccessToken(): Promise<string> {
  const tokens = await getTeamupTokens();
  if (!tokens) {
    throw new Error("No TeamUp tokens stored. Visit /api/teamup/oauth/start to authorize.");
  }
  if (tokens.expiresAt.getTime() - Date.now() > REFRESH_LEEWAY_MS) {
    return tokens.accessToken;
  }
  return refreshTokens(tokens.refreshToken);
}

async function refreshTokens(refreshToken: string): Promise<string> {
  const res = await fetch(REFRESH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new TeamUpError(res.status, "/auth/refresh_access_token", body);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
  };
  const ttl = data.expires_in ?? 7200;
  await upsertTeamupTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + ttl * 1000),
  });
  return data.access_token;
}

async function authHeaders(): Promise<Record<string, string>> {
  const mode = authMode();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "TeamUp-Request-Mode": "provider",
  };
  const providerId = process.env.TEAMUP_PROVIDER_ID;
  if (providerId) headers["TeamUp-Provider-ID"] = providerId;

  if (mode.kind === "oauth") {
    headers.Authorization = `JWT ${await getAccessToken()}`;
  } else {
    const token = process.env.TEAMUP_APPLICATION_TOKENS;
    if (!token) throw new Error("TEAMUP_APPLICATION_TOKENS not set");
    headers.Authorization = `Token ${token}`;
  }
  return headers;
}

export async function teamupGet<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  if (opts.expand?.length) url.searchParams.set("expand", opts.expand.join(","));

  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
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
