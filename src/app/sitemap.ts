import type { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/about", "/facilities", "/programme", "/contact", "/faqs", "/privacy", "/terms"];
  return paths.map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: p === "/programme" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/programme" || p === "/contact" ? 0.9 : 0.6,
  }));
}
