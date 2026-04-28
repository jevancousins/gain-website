import { test, expect } from "./fixtures";

const TEST_MARKER = "[QA-TEST]";

// We test the form on /contact. The same LeadForm component is used on
// /programmes and the /6-week/* landings, so we only need to exercise it once.
test("lead form on /contact submits successfully and shows the success state", async ({
  page,
}) => {
  await page.goto("/contact");

  await page.fill('input[name="firstName"]', "QA");
  await page.fill('input[name="email"]', "qa-test@example.com");
  await page.fill('input[name="phone"]', "+447700900000");
  await page.fill(
    'textarea[name="message"]',
    `${TEST_MARKER} automated end-to-end test, do not action`
  );

  // Listen for the API response so we can assert the test-mode short-circuit fired.
  const responsePromise = page.waitForResponse(
    (r) => r.url().includes("/api/lead") && r.request().method() === "POST"
  );
  await page.click('button[type="submit"]');
  const response = await responsePromise;

  expect(
    response.status(),
    "API should accept the test submission"
  ).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);

  const body = await response.json().catch(() => ({}));
  // When LEAD_TEST_MODE is on AND the body carries the marker, the API
  // returns ok:true with testMode:true so we know persistence was skipped.
  expect(
    body.testMode,
    "API should report testMode:true so we know Notion + Resend were skipped"
  ).toBe(true);

  // The form should swap to the success state.
  await expect(page.getByText(/Thanks/i).first()).toBeVisible({ timeout: 5000 });
});

test("lead form rejects an invalid email", async ({ page }) => {
  await page.goto("/contact");

  await page.fill('input[name="firstName"]', "QA");
  await page.fill('input[name="email"]', "not-an-email");
  await page.fill('input[name="phone"]', "+447700900000");

  await page.click('button[type="submit"]');

  // Server-side validation should produce a field error rendered by the form.
  await expect(page.getByText(/valid email/i).first()).toBeVisible({
    timeout: 5000,
  });
});
