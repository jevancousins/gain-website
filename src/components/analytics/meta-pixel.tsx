"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID } from "@/lib/meta-pixel";

/**
 * Base Meta pixel, rendered once from the root layout.
 *
 * Renders nothing at all when NEXT_PUBLIC_META_PIXEL_ID is unset, so the site
 * serves no Meta script and sets no Meta cookie until Gain's existing dataset id
 * is configured. The inline snippet is Meta's own, with its init + first
 * PageView; because this is an App Router site the browser does not reload on
 * navigation, so subsequent PageViews are fired here on pathname change.
 */
export function MetaPixel() {
  const pathname = usePathname();
  // The snippet's own init already counts the first view; skip it once so the
  // landing page is not double-counted against the ad that sent them.
  const skippedFirst = useRef(false);

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    if (!skippedFirst.current) {
      skippedFirst.current = true;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
