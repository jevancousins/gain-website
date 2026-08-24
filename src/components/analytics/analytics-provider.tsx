import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MetaPixel } from "./meta-pixel";

/**
 * Site-wide analytics: Vercel Web Analytics + Speed Insights (cookieless,
 * auto-enabled on Vercel, no env vars or cookie banner needed). Rendered once
 * from the root layout. Pageviews are captured automatically; custom events go
 * through src/lib/analytics.ts.
 *
 * The Meta pixel sits alongside them and is a different animal: it is for ads,
 * it does set a cookie, and it renders nothing unless NEXT_PUBLIC_META_PIXEL_ID
 * is configured. See src/lib/meta-pixel.ts.
 */
export function AnalyticsProvider() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <MetaPixel />
    </>
  );
}
