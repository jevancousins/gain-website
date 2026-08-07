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
 * Days after the join date at which each of emails 1-5 is due.
 *
 * These emails used to be carried by the Resend "Member onboarding drip"
 * Automation on its own delays. That was wrong in two ways and cost a real
 * member her whole onboarding: an Automation will not send to a contact marked
 * `unsubscribed`, and the contact sync marks anyone who did not tick the
 * newsletter box as unsubscribed (correctly, for MARKETING). Onboarding is
 * transactional, not marketing, so it must not be gated on newsletter consent.
 * On top of that, steps 1, 2 and 5 were removed from the Automation on 22 Jul
 * 2026 and never re-wired, so only 3 and 4 were reachable at all.
 *
 * The cron now owns emails 1-5 and sends them directly, the way email 6 already
 * worked. The Resend Automation must stay disabled or subscribed members get
 * emails 3 and 4 twice.
 *
 * Offsets match the drafts in AI for SMBs/onboarding-flow/onboarding-emails.md.
 */
export const DRIP_SCHEDULE_DAYS: Record<number, number> = {
  1: 0, // welcome (lands the morning after signup: cron runs daily at 07:00)
  2: 2, // induction prep
  3: 5, // at-home mobility guide
  4: 7, // week 1 check-in
  5: 14, // nutrition guide
};

/**
 * Highest drip email the cron will send. Email 5 links to
 * /media/gain-nutrition-guide.pdf, which does not exist yet (404 as of 7 Aug
 * 2026) — the missing nutrition doc Hallum has flagged since 18 July. Sending it
 * would email members a dead link, so 5 stays gated.
 *
 * RAISE THIS TO 5 once the nutrition guide is committed to public/media/ and
 * serves 200. Nothing else needs to change.
 */
export const DRIP_MAX_SENDABLE_INDEX = 4;

/**
 * How many days past its due date an email may still be sent. Beyond this the
 * cron marks it done without sending, so a member recovering from an outage
 * never receives a stale "how was your first week?" weeks late.
 */
export const DRIP_MAX_LATE_DAYS = 14;

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
