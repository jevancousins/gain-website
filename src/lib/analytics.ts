import posthog from "posthog-js";

/**
 * Fire a product-analytics event (PostHog). Client-only and best-effort: it
 * no-ops when analytics is not configured and never throws, so a tracking
 * failure can never break the UI. Import only from client components.
 *
 * Most clicks are captured automatically (PostHog autocapture), so reserve
 * explicit events for things autocapture can't see, e.g. a *successful*
 * async form submission.
 */
export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // analytics is best-effort; swallow any error
  }
}
