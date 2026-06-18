import { test, expect } from "./fixtures";

const PAGES = [
  "/",
  "/about",
  "/contact",
  "/faqs",
  "/6-week",
];

for (const path of PAGES) {
  test(`${path} has valid SEO metadata`, async ({ page }) => {
    await page.goto(path);

    const title = await page.title();
    expect(title.length, `${path} title should be non-empty`).toBeGreaterThan(0);
    expect(title.length, `${path} title should be under 100 chars`).toBeLessThan(100);

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
