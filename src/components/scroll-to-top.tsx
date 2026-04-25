"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Force scroll to top on every route change.
 *
 * Next.js 16's App Router preserves scroll position across navigations as
 * long as the new page's first element is "visible in the viewport", and
 * its visibility check skips sticky/fixed elements (our SiteNav). The
 * effect: clicking a nav link from halfway down one page often leaves you
 * halfway down the next, hiding the section header at the top.
 *
 * Hash anchors (e.g. /programmes#six) are honoured by skipping the reset.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
