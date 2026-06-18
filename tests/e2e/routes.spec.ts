import { test, expect } from "./fixtures";

const ROUTES = [
  { path: "/", title: /Gain Strength Therapy/i, h1: /The gym/i },
  { path: "/about", title: /About/i, h1: /Built for the people/i },
  { path: "/contact", title: /Contact/i, h1: /Leave your details/i },
  { path: "/faqs", title: /FAQ/i, h1: /./ },
  { path: "/privacy", title: /Privacy/i, h1: /handle your information/i },
  { path: "/terms", title: /Terms/i, h1: /house rules/i },
  { path: "/6-week", title: /6-Week/i, h1: /Not sure where to start/i },
];

for (const r of ROUTES) {
  test(`${r.path} renders`, async ({ page }) => {
    const response = await page.goto(r.path);
    expect(response?.status(), `expected 2xx for ${r.path}`).toBeLessThan(400);

    await expect(page).toHaveTitle(r.title);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText(r.h1);
  });
}
