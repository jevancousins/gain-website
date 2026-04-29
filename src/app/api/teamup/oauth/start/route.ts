import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";

const AUTHORIZE_URL = "https://goteamup.com/api/v2/auth/oauth/authorize";

export async function GET() {
  const clientId = process.env.TEAMUP_CLIENT_ID;
  const redirectUri = process.env.TEAMUP_OAUTH_REDIRECT;
  const providerId = process.env.TEAMUP_PROVIDER_ID;
  if (!clientId || !redirectUri || !providerId) {
    return Response.json({ error: "OAuth env not configured" }, { status: 500 });
  }

  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");

  const jar = await cookies();
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  jar.set("teamup_pkce_verifier", verifier, cookieOpts);
  jar.set("teamup_oauth_state", state, cookieOpts);

  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", `read provider:${providerId}`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return Response.redirect(url.toString(), 302);
}
