import { track as vercelTrack } from "@vercel/analytics";

/**
 * Fire a custom analytics event (Vercel Web Analytics). Client-only and
 * best-effort: it no-ops when Web Analytics is not enabled on the project and
 * never throws, so a tracking failure can never break the UI. Import only from
 * client components.
 *
 * Pageviews are captured automatically by <Analytics /> in the root layout, so
 * reserve explicit events for things it can't see, e.g. a *successful* async
 * form submission.
 */
export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(event, properties);
  } catch {
    // analytics is best-effort; swallow any error
  }
}
