"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// EU ingestion host by default, to keep data in-region for a UK business.
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

let started = false;
function startPostHog() {
  if (started || !POSTHOG_KEY || typeof window === "undefined") return;
  started = true;
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
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Site-wide analytics: Vercel Web Analytics + Speed Insights (cookieless,
 * auto-enabled on Vercel) and PostHog (cookieless, behaviour/funnels). All
 * are inert until their config is present, so this is safe to ship before
 * the keys are set. Rendered once from the root layout.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    startPostHog();
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
