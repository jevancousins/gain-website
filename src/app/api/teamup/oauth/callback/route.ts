import { cookies } from "next/headers";
import { upsertTeamupTokens } from "@/lib/notion-tokens";

const TOKEN_URL = "https://goteamup.com/api/v2/auth/oauth/token";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.json({ error: `TeamUp returned error: ${error}` }, { status: 400 });
  }
  if (!code || !state) {
    return Response.json({ error: "Missing code or state" }, { status: 400 });
  }

  const jar = await cookies();
  const cookieState = jar.get("teamup_oauth_state")?.value;
  const verifier = jar.get("teamup_pkce_verifier")?.value;
  if (!cookieState || !verifier) {
    return Response.json({ error: "Missing OAuth cookies; restart the flow at /api/teamup/oauth/start" }, { status: 400 });
  }
  if (state !== cookieState) {
    return Response.json({ error: "State mismatch" }, { status: 400 });
  }

  const clientId = process.env.TEAMUP_CLIENT_ID;
  const clientSecret = process.env.TEAMUP_CLIENT_SECRET;
  const redirectUri = process.env.TEAMUP_OAUTH_REDIRECT;
  if (!clientId || !clientSecret || !redirectUri) {
    return Response.json({ error: "OAuth env not configured" }, { status: 500 });
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text().catch(() => "");
    return Response.json({ error: "Token exchange failed", status: tokenRes.status, body: errBody.slice(0, 500) }, { status: 502 });
  }

  const tokens = (await tokenRes.json()) as { access_token: string; refresh_token: string; expires_in?: number };
  const ttlSeconds = tokens.expires_in ?? 7200;

  await upsertTeamupTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000),
  });

  jar.delete("teamup_pkce_verifier");
  jar.delete("teamup_oauth_state");

  return Response.json({ ok: true, message: "TeamUp OAuth complete. Tokens stored in Notion." });
}
