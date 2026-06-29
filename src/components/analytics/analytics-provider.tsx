"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// EU ingestion host by default, to keep data in-region for a UK business.
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

type PostHog = (typeof import("posthog-js"))["default"];

// posthog-js is ~50KB+, and most of it is unused on first paint. Load it as its
// own async chunk (kept out of the initial bundle) and init exactly once. The
// promise is the single source of the initialised instance, so every caller
// awaits the same init rather than racing it.
let phPromise: Promise<PostHog | null> | null = null;
function getPostHog(): Promise<PostHog | null> {
  if (!POSTHOG_KEY || typeof window === "undefined") return Promise.resolve(null);
  if (!phPromise) {
    phPromise = import("posthog-js").then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Cookieless: nothing is written to the visitor's device, so no
        // cookie-consent banner is required. Trade-off: visitors are not
        // stitched across separate visits, which is fine for behaviour,
        // funnel and path analysis within a session.
        persistence: "memory",
        person_profiles: "identified_only",
        capture_pageview: false, // captured manually below (App Router)
        capture_pageleave: true,
        autocapture: true,
      });
      return posthog;
    });
  }
  return phPromise;
}

/** Manual pageview capture on client-side navigation (App Router). */
function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    void getPostHog().then((posthog) =>
      posthog?.capture("$pageview", { $current_url: url }),
    );
  }, [pathname, searchParams]);

  return null;
}

/**
 * Site-wide analytics: Vercel Web Analytics + Speed Insights (cookieless,
 * auto-enabled on Vercel) and PostHog (cookieless, behaviour/funnels). All
 * are inert until their config is present, so this is safe to ship before
 * the keys are set. Rendered once from the root layout. PostHog is loaded
 * lazily after hydration so its bundle never competes with first paint.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    void getPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
