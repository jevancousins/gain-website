/**
 * Does this request want a dry run?
 *
 * Deliberately asymmetric: the presence of a `dryRun` parameter is enough, and
 * only an explicit negative turns it back off. A typo therefore costs nothing,
 * where the obvious `=== "true"` reading makes every typo a live run.
 *
 * That is not hypothetical. On 30 Aug 2026 a maintenance pass meaning to
 * inspect the onboarding drip called it with `?dryRun=1` against a route that
 * only accepted `"true"`, and sent a member her real mid-programme check-in.
 * Two routes already accepted `"1"` and four did not, so whether a shorthand
 * was safe depended on which route you happened to be looking at.
 *
 * Callers that genuinely want to send pass no parameter at all, which is what
 * the Vercel scheduler does.
 */
const EXPLICIT_NEGATIVES = new Set(["false", "0", "no", "off"]);

export function wantsDryRun(url: URL): boolean {
  const raw = url.searchParams.get("dryRun");
  if (raw === null) return false; // absent: a real run, as the scheduler intends
  return !EXPLICIT_NEGATIVES.has(raw.trim().toLowerCase());
}
