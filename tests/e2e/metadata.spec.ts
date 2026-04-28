import { test, expect } from "./fixtures";

const PAGES = [
  "/",
  "/about",
  "/facilities",
  "/programmes",
  "/contact",
  "/faqs",
  "/6-week/beginner",
  "/6-week/post-physio",
  "/6-week/active-senior",
  "/6-week/post-illness",
];

for (const path of PAGES) {
  test(`${path} has valid SEO metadata`, async ({ page }) => {
    await page.goto(path);

    const title = await page.title();
    expect(title.length, `${path} title should be non-empty`).toBeGreaterThan(0);
    expect(title.length, `${path} title should be under 80 chars`).toBeLessThan(80);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description, `${path} should have a meta description`).toBeTruthy();
    expect(
      description!.length,
      `${path} description should be under 200 chars`
    ).toBeLessThan(200);

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    expect(ogTitle, `${path} should have og:title`).toBeTruthy();

    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport, `${path} should have a viewport meta`).toContain("width=device-width");
  });
}

// Persona pages set robots: noindex,nofollow because they're paid-traffic landings.
const PERSONA_PAGES = [
  "/6-week/beginner",
  "/6-week/post-physio",
  "/6-week/active-senior",
  "/6-week/post-illness",
];

for (const path of PERSONA_PAGES) {
  test(`${path} is noindex,nofollow`, async ({ page }) => {
    await page.goto(path);
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robots, `${path} should have a robots meta`).toBeTruthy();
    expect(robots!.toLowerCase()).toContain("noindex");
    expect(robots!.toLowerCase()).toContain("nofollow");
  });
}
