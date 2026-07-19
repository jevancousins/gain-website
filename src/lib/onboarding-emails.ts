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
// type (members-only, 45 min, Hallum; customer-facing id 310928). This is the
// DIRECT booking link, wrapped in TeamUp's start/?next= sign-in redirect: a
// logged-out click (common from email) lands on the branded sign-in page and is
// then taken straight to the induction, whereas a raw /c/appointment_types/310928
// deep link errors when the click comes in logged-out.
//
// The welcome email (Resend template gain-onboarding-1-welcome) now hardcodes
// this URL directly, since it is static and the Resend Automation that sends the
// welcome no longer passes it as a variable. This constant is the canonical value
// and documentation; keep it and the template in sync.
export const INDUCTION_BOOKING_URL =
  "https://goteamup.com/p/8554886-gain-strength-therapy/start/?next=/p/8554886-gain-strength-therapy/c/appointment_types/310928";

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
 * The mid-programme check-in is drip email 6. Unlike emails 1-5 (which the Resend
 * "Member onboarding drip" automation sends on fixed delays from the join event),
 * email 6 is sent by the daily cron at each member's TRUE programme midpoint, so
 * it must NOT be a step in that automation. See the onboarding-drip route.
 */
export const MID_PROGRAMME_EMAIL_INDEX = 6;

/**
 * Total nominal length in days of a finite programme, derived from its TeamUp
 * membership name, or null for open-ended memberships (monthly, PT, class packs)
 * which have no midpoint and never receive the mid-programme check-in.
 *
 * The go-live offering is the 6-Week and 12-Week programmes. We match the "N week"
 * token rather than an exact title so the mapping holds whatever exact name Hallum
 * gives the TeamUp membership (e.g. "6 Week Transformation", "12-Week Programme"),
 * in digit or word form. Check 12 before 6, and require a boundary before the
 * digit so "16 week" is not read as a 6-week programme.
 */
export function programmeLengthDays(programme: string | null): number | null {
  if (!programme) return null;
  const n = programme.toLowerCase();
  if (/\b(12|twelve)[\s-]*week/.test(n)) return 84;
  if (/\b(6|six)[\s-]*week/.test(n)) return 42;
  return null;
}

/**
 * Active-training days at which the mid-programme check-in is due (the halfway
 * point): 21 for a 6-week programme, 42 for a 12-week. Counted in ACTIVE days
 * (paused days do not count), so a member is checked in at their true midpoint.
 */
export function midpointActiveDays(lengthDays: number): number {
  return Math.round(lengthDays / 2);
}

/**
 * Upper grace bound in active days: past this the member is too far through the
 * programme for a "you're halfway" email to make sense, so we suppress rather
 * than send stale (e.g. after a long cron outage). Two thirds of the programme:
 * 28 for a 6-week, 56 for a 12-week.
 */
export function ceilingActiveDays(lengthDays: number): number {
  return Math.round((lengthDays * 2) / 3);
}
