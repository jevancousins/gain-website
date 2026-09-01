import { test, expect } from "./fixtures";

/**
 * Guards the enquiry form against the class of fault that silently lost leads
 * in August 2026, where nothing errored and nothing reached the server.
 *
 * /6-week renders <LeadForm> twice (sticky sidebar + lower section). Both
 * instances hardcoded id="firstName" etc., so every id appeared twice in the
 * document. A duplicate id makes htmlFor resolve to the FIRST match, so on the
 * lower form every label pointed at the upper form's input, ~1000px up the
 * page. A visitor who clicks labels rather than the boxes types into a form
 * they cannot see, then fails browser validation on fields that look filled in.
 * No request is ever made, so the lost enquiry leaves no trace in Resend, in
 * Notion, or in any server log: the daily health check saw a healthy funnel
 * while enquiries were being dropped in the browser.
 *
 * The old lead-form spec could not catch it. It exercised /contact only, on the
 * reasoning that "the same LeadForm component is used on the /6-week landing,
 * so we only need to exercise it once". That is exactly the assumption that
 * broke: the fault is not in the component, it is in rendering it twice.
 *
 * So these tests deliberately drive the form BY LABEL rather than by CSS
 * selector. getByLabel resolves through the label/control association, which is
 * the thing that was broken, and is how a real visitor and a screen reader
 * reach the fields. A name-based selector passes happily on a broken page.
 */

const PAGES_WITH_FORM = ["/contact", "/6-week"] as const;

/** Pages and how many copies of the form each is expected to render. */
const EXPECTED_FORM_COUNT: Record<string, number> = {
  "/contact": 1,
  "/6-week": 2,
};

const FIELD_LABELS = [/first name/i, /phone/i, /email/i] as const;

for (const path of PAGES_WITH_FORM) {
  test(`${path}: every form control id is unique in the document`, async ({ page }) => {
    await page.goto(path);
    await page.locator("form").first().waitFor();

    const duplicates = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("input,textarea,select")]
        .map((el) => el.id)
        .filter(Boolean);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });

    expect(
      duplicates,
      "duplicate element ids break label/for binding: a label focuses the FIRST " +
        "match, which on a page rendering the form twice is the other form's input",
    ).toEqual([]);
  });

  test(`${path}: every label points at a control inside its own form`, async ({ page }) => {
    await page.goto(path);
    await page.locator("form").first().waitFor();

    const strays = await page.evaluate(() =>
      [...document.querySelectorAll("label[for]")]
        .map((label) => {
          const target = document.getElementById(label.getAttribute("for")!);
          return {
            for: label.getAttribute("for"),
            resolves: Boolean(target),
            sameForm: Boolean(target) && target!.closest("form") === label.closest("form"),
          };
        })
        .filter((l) => !l.resolves || !l.sameForm),
    );

    expect(strays, "a label must not reach across into a different form").toEqual([]);
  });

  test(`${path}: renders the expected number of forms`, async ({ page }) => {
    await page.goto(path);
    await page.locator("form").first().waitFor();

    // Without this guard the uniqueness tests above would still pass if a page
    // silently stopped rendering its second form, hiding a real regression.
    await expect(page.locator("form")).toHaveCount(EXPECTED_FORM_COUNT[path]);
  });
}

test("/6-week: each form copy is independently fillable by label", async ({ page }) => {
  await page.goto("/6-week");
  const forms = page.locator("form");
  await expect(forms).toHaveCount(2);

  // Fill BOTH copies via their labels, scoped to each form. On the broken build
  // the second form's labels resolved into the first form, so the second form's
  // own inputs stayed empty and this assertion fails.
  for (let i = 0; i < 2; i++) {
    const form = forms.nth(i);
    for (const label of FIELD_LABELS) {
      await form.getByLabel(label).fill(`copy-${i}`);
    }
  }

  for (let i = 0; i < 2; i++) {
    const form = forms.nth(i);
    for (const label of FIELD_LABELS) {
      await expect(
        form.getByLabel(label),
        `form ${i} should hold its own value, not have it land in the other form`,
      ).toHaveValue(`copy-${i}`);
    }
  }
});

test("/6-week: the lower form actually posts to /api/lead", async ({ page }) => {
  await page.goto("/6-week");
  const lower = page.locator("form").nth(1);

  await lower.getByLabel(/first name/i).fill("QA");
  await lower.getByLabel(/email/i).fill("qa-test@example.com");
  await lower.getByLabel(/phone/i).fill("+447700900000");
  await lower
    .getByLabel(/mind/i)
    .fill("[QA-TEST] automated end-to-end test, do not action");

  const responsePromise = page.waitForResponse(
    (r) => r.url().includes("/api/lead") && r.request().method() === "POST",
  );
  await lower.locator('button[type="submit"]').click();
  const response = await responsePromise;

  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);

  // The honeypot must be empty, or the server silently drops a real enquiry.
  const sent = JSON.parse(response.request().postData() ?? "{}");
  expect(sent.hp_field ?? "", "honeypot must not be populated by a real fill").toBe("");
  expect(sent.firstName).toBe("QA");
});

test("the honeypot field carries no name autofill would recognise", async ({ page }) => {
  // Headless Chromium has no autofill or password manager, so no end-to-end
  // test can catch a real browser filling the honeypot and silently dropping
  // the enquiry. What CAN be asserted is the precondition: the field must not
  // be named anything an autofill heuristic matches. "website", "url",
  // "company" and friends are all recognised tokens; that is why the field was
  // renamed, and this test is what stops it drifting back.
  const AUTOFILLABLE = [
    "website", "url", "homepage", "company", "organization", "organisation",
    "address", "name", "nickname", "title", "username", "tel", "phone", "email",
  ];

  await page.goto("/6-week");
  const hidden = page.locator('form input[tabindex="-1"]');
  const count = await hidden.count();
  expect(count, "every form should still render its honeypot").toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const name = (await hidden.nth(i).getAttribute("name")) ?? "";
    expect(name, "honeypot must be named").not.toBe("");
    expect(
      AUTOFILLABLE.includes(name.toLowerCase()),
      `honeypot named "${name}" is a token browser autofill recognises, which silently drops real enquiries`,
    ).toBe(false);
    expect(await hidden.nth(i).getAttribute("autocomplete")).toBe("off");
  }
});
