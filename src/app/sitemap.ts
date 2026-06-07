import type { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Only indexable pages belong here. The /6-week/[persona] routes are
  // deliberately noindex paid-ad landing pages, so they are excluded.
  const paths = ["", "/6-week", "/about", "/contact", "/faqs", "/privacy", "/terms"];
  return paths.map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority:
      p === ""
        ? 1
        : p === "/6-week"
          ? 0.9
          : p === "/contact"
            ? 0.9
            : 0.6,
  }));
}
