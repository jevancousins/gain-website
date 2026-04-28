import { test as base, expect } from "@playwright/test";

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/**
 * Custom test fixture that sets the Vercel deployment-protection bypass
 * cookie once before each test, when running against a protected preview.
 *
 * We use the URL-parameter form (not extraHTTPHeaders) so the bypass
 * applies only to same-origin Vercel requests via cookie, and cross-origin
 * resource fetches stay headerless and don't trigger a CORS preflight that
 * the third-party CDN would reject.
 */
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    if (bypassSecret && baseURL) {
      const u = new URL(baseURL);
      u.searchParams.set("x-vercel-protection-bypass", bypassSecret);
      u.searchParams.set("x-vercel-set-bypass-cookie", "samesitenone");
      await page.goto(u.toString(), { waitUntil: "commit" });
    }
    await use(page);
  },
});

export { expect };
