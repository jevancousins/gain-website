/**
 * Onboarding drip configuration.
 *
 * The email COPY and layout now live in published Resend templates (aliases
 * below), edited in the Resend dashboard so Hallum can change wording without a
 * code change. This module only maps each drip step to its template and holds
 * the one runtime value the welcome email needs (the induction booking URL).
 *
 * The previous inline HTML/text drafts are in AI for SMBs/onboarding-flow/
 * onboarding-emails.md and the git history of this file.
 */

// Induction booking lives in TeamUp as the "Gain Programme Induction" appointment
// type (members-only, 45 min, Hallum). We link to the appointments list page
// rather than the type's deep link: the deep link errors for visitors not yet
// logged in, whereas the list page loads for everyone and surfaces the induction
// once the member signs in. Passed into onboarding email 1 as BOOK_INDUCTION_URL.
export const INDUCTION_BOOKING_URL =
  "https://goteamup.com/p/8554886-gain-strength-therapy/c/appointment_types";

/** Drip emailIndex (1-6) -> published Resend template alias. */
export const DRIP_TEMPLATE_ALIAS: Record<number, string> = {
  1: "gain-onboarding-1-welcome",
  2: "gain-onboarding-2-induction-prep",
  3: "gain-onboarding-3-mobility-guide",
  4: "gain-onboarding-4-week-1-check-in",
  5: "gain-onboarding-5-nutrition-guide",
  6: "gain-onboarding-6-mid-programme-check-in",
};

/** Number of emails in the drip sequence (1-6); used to validate callers. */
export const DRIP_EMAIL_COUNT = 6;

/**
 * The mid-programme check-in is drip email 6. Unlike emails 1-5, which sit at
 * fixed offsets from the join date, this one is timed to the true halfway point
 * of the member's programme, so a 6-week member is checked in around day 21 and
 * a 12-week member around day 42. See `midProgrammeCheckInDay`.
 */
export const MID_PROGRAMME_EMAIL_INDEX = 6;

/**
 * Total length in days of a finite programme, derived from its TeamUp membership
 * name (stored verbatim in the member's Notion `Programme` field), or null for
 * open-ended memberships (monthly, PT, class packs) which have no fixed midpoint
 * and therefore receive no mid-programme check-in.
 *
 * The go-live offering is the 6-Week and 12-Week programmes. We match on the
 * "N week" token rather than an exact title so the mapping holds whatever exact
 * name Hallum gives the TeamUp membership (e.g. "6 Week Transformation",
 * "12-Week Programme"), in digit or word form. If a programme launches under a
 * name that does not carry its length as "6 week"/"12 week", add it here.
 */
export function programmeLengthDays(programme: string | null): number | null {
  if (!programme) return null;
  const n = programme.toLowerCase();
  // Check 12 before 6: "12 week" must not be read as a 6-week programme. The
  // \b before the digit keeps "16 week" from matching the 6-week branch.
  if (/\b(12|twelve)[\s-]*week/.test(n)) return 84;
  if (/\b(6|six)[\s-]*week/.test(n)) return 42;
  return null;
}

/**
 * Day after joining on which the mid-programme check-in is due (the programme's
 * halfway point), or null for open-ended memberships that have no midpoint.
 */
export function midProgrammeCheckInDay(programme: string | null): number | null {
  const total = programmeLengthDays(programme);
  return total === null ? null : Math.round(total / 2);
}
