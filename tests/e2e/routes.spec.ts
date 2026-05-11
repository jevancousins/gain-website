import { test, expect } from "./fixtures";

const ROUTES = [
  { path: "/", title: /Gain Strength Therapy/i, h1: /strength|gain/i },
  { path: "/about", title: /About/i, h1: /Empowering adults/i },
  { path: "/facilities", title: /Facilities/i, h1: /Gym\.|And studio/i },
  { path: "/programmes", title: /Programmes/i, h1: /Build real strength/i },
  { path: "/contact", title: /Contact/i, h1: /Leave your details/i },
  { path: "/faqs", title: /FAQ/i, h1: /./ },
  { path: "/privacy", title: /Privacy/i, h1: /handle your information/i },
  { path: "/terms", title: /Terms/i, h1: /house rules/i },
  { path: "/6-week/beginner", title: /6-Week|First-Timers/i, h1: /You do not need to be fit/i },
  { path: "/6-week/post-physio", title: /6-Week|Post-Physio/i, h1: /Discharged/i },
  { path: "/6-week/active-senior", title: /6-Week|After 60/i, h1: /Light weights/i },
  { path: "/6-week/post-illness", title: /6-Week|Rebuilding/i, h1: /Deconditioning/i },
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

const PERSONA_ROUTES = [
  "/6-week/beginner",
  "/6-week/post-physio",
  "/6-week/active-senior",
  "/6-week/post-illness",
];

for (const path of PERSONA_ROUTES) {
  test(`${path} hides the main site nav (keeps visitors focused on enquiring)`, async ({
    page,
  }) => {
    await page.goto(path);

    // Persona landings should NOT link to the main site routes. We let
    // /privacy and /terms through (the slim landing footer is allowed to
    // link to them) but block /about, /facilities, /programmes, /faqs and
    // /contact, which are the main-site exit points the ChromeGate strips.
    for (const exit of ["/about", "/facilities", "/programmes", "/faqs", "/contact"]) {
      const matches = await page.locator(`a[href$="${exit}"]`).count();
      expect(
        matches,
        `${path} should not link to ${exit} but found ${matches} link(s)`
      ).toBe(0);
    }

    // Lead form must be present (persona pages render two: hero + final CTA).
    await expect(page.locator("form").first()).toBeVisible();
  });
}
