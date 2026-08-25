#!/usr/bin/env bash
# Install a new META_ACCESS_TOKEN without it ever being printed, logged or pasted
# into a chat. Prompts for the token with hidden input, proves it actually works
# against Gain's ad account, then writes it to .env.local and Vercel production.
#
# Everything except generating the token itself is already done:
#   - System user "Conversions API System User" (61574258008835) exists
#   - It now holds Gain Ad Account with "View performance" (= ads_read)
#   - App is "Conversions API Application"
#
# Generate the token here, then run this script and paste it at the prompt:
#   Business settings > Users > System users > Conversions API System User
#   > Generate token > app "Conversions API Application" > tick ads_read
#   > (leave expiry as Never) > Generate
#
# Usage:  ./scripts/set-meta-token.sh
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO/.env.local"
ACT="$(grep -E '^META_AD_ACCOUNT_ID=' "$ENV_FILE" | cut -d= -f2- | tr -d '"'"'"'')"
[ -n "$ACT" ] || { echo "Could not read META_AD_ACCOUNT_ID from $ENV_FILE" >&2; exit 1; }

# Hidden input. Never echoed, never written to shell history, never in argv.
printf 'Paste the new Meta system-user token (input hidden), then press Enter:\n> '
IFS= read -rs TOKEN
printf '\n'
[ -n "${TOKEN:-}" ] || { echo "No token entered. Nothing changed." >&2; exit 1; }

echo "Validating against ad account $ACT ..."
# --data-urlencode keeps the token out of the process list and out of any URL log.
CODE="$(curl -sG "https://graph.facebook.com/v21.0/${ACT}/insights" \
  --data-urlencode "access_token=${TOKEN}" \
  --data-urlencode "fields=spend" \
  --data-urlencode "date_preset=last_30d" \
  -o /tmp/meta_probe.$$ -w '%{http_code}')"

if [ "$CODE" != "200" ]; then
  echo "REJECTED (HTTP $CODE). The token was NOT saved. Meta said:" >&2
  # Print only the error message, which contains no secret.
  python3 -c "import json,sys;d=json.load(open('/tmp/meta_probe.$$'));print(' ',d.get('error',{}).get('message','(no message)'))" 2>/dev/null || true
  rm -f "/tmp/meta_probe.$$"; exit 1
fi
rm -f "/tmp/meta_probe.$$"
echo "Token works: the ad account returned insights."

# --- .env.local ---
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
grep -v -E '^META_ACCESS_TOKEN=' "$ENV_FILE" > "$TMP" || true
printf 'META_ACCESS_TOKEN=%s\n' "$TOKEN" >> "$TMP"
cp "$TMP" "$ENV_FILE"
echo "Updated $ENV_FILE"

# --- Vercel production ---
cd "$REPO"
npx vercel env rm META_ACCESS_TOKEN production --yes >/dev/null 2>&1 || true
printf '%s' "$TOKEN" | npx vercel env add META_ACCESS_TOKEN production >/dev/null
echo "Updated Vercel production."

unset TOKEN
echo
echo "Done. Redeploy for the server to pick it up:"
echo "  npx vercel redeploy \$(npx vercel ls --prod 2>/dev/null | awk '/Ready/{print \$3; exit}')"
