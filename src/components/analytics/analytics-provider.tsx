import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Site-wide analytics: Vercel Web Analytics + Speed Insights (cookieless,
 * auto-enabled on Vercel, no env vars or cookie banner needed). Rendered once
 * from the root layout. Pageviews are captured automatically; custom events go
 * through src/lib/analytics.ts.
 */
export function AnalyticsProvider() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
