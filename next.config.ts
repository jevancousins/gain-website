import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All media now lives in /public/media — no external image hosts needed.

  // Redirects from the old Wix URLs to their new equivalents, so existing
  // bookmarks and search-engine results keep working after the cutover.
  // permanent: true emits a 308 (treated like a 301 by search engines).
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/faq", destination: "/faqs", permanent: true },
      { source: "/kickstart", destination: "/6-week", permanent: true },
      { source: "/ourfacility", destination: "/about", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-conditions", destination: "/terms", permanent: true },
      // The Wix "news" blog held only template placeholder posts; send any
      // lingering links to the homepage rather than 404.
      { source: "/news", destination: "/", permanent: true },
      { source: "/news/:slug*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
