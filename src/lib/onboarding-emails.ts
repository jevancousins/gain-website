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
// type (members-only, Hallum; customer-facing id 310928, read the duration from
// TeamUp as it has changed). Link to the customer-site APPOINTMENTS TAB, not to
// the type, and never wrap it in a redirect.
//
// Corrected 3 Sept 2026, and this is the whole reason no member had ever booked
// an induction. The previous value wrapped the deep link in TeamUp's
// `/start/?next=...`. `/start/` is TeamUp's join-the-business wizard, not a
// sign-in redirect: it discards `next` outright, so a click from the email
// landed on a sign-up flow asking whether you were enrolling a child or other
// dependent. Karen, Melanie and Paul each received that email and not one
// reached a booking screen; every induction that has happened, Hallum arranged
// by hand in his own diary.
//
// The bare `/c/appointment_types/310928` deep link is not the fix either: it
// errors for anyone whose membership does not grant that type. The tab respects
// the same membership gate and simply shows the member what they can book.
//
// The welcome email is TeamUp's "When a membership is purchased" notification
// (since 10 Aug 2026), which hardcodes this URL in its induction button. Nothing
// in this repo sends it, so this constant is documentation only: if you change
// it, change the TeamUp notification, the Email Library row and gain-context.md
// in the same run, or the next reader restores the broken URL from here.
export const INDUCTION_BOOKING_URL =
  "https://goteamup.com/p/8554886-gain-strength-therapy/c/appointment_types/";

/**
 * Drip emailIndex (1-6) -> Resend template alias.
 *
 * Aliases 1 and 2 NO LONGER EXIST IN RESEND. Both templates were deleted after
 * the steps moved to TeamUp (verified 15 Aug 2026: the alias lookup resolves for
 * every other entry here and 404s for these two). They are kept in the map so
 * the indices and the "Onboarding Email N Sent" checkboxes keep their meaning,
 * but nothing can send them: see DRIP_MIN_SENDABLE_INDEX below before lowering
 * the floor to 1 or 2.
 */
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
 * /media/gain-nutrition-guide.pdf, which 404d from 7 Aug 2026 until it was
 * committed on 6 Sept. The file now serves 200, so the DEAD LINK is fixed.
 *
 * The ceiling stays at 4 anyway, because the dead link was never the only gate.
 * Jevan's standing instruction of 12 Aug 2026, recorded on the "Onboarding 5 -
 * Nutrition guide" row in the Notion Email Library, is that no nutrition email
 * goes out until the guide is FINALISED, meaning he or Hallum has looked at the
 * eight pages and said yes. That approval has never been given.
 *
 * This was briefly raised to 5 on 6 Sept and reverted the same morning, before
 * the next 07:00 cron fired and before any member received it. Hosting the PDF
 * and approving its contents are two different gates, and only the first is
 * mechanical.
 *
 * RAISE THIS TO 5 on that approval, and not on the URL alone. Nothing else needs
 * to change: planDripEmail marks anything more than DRIP_MAX_LATE_DAYS past its
 * due day as stale, so only members inside the day 14 to day 28 window get it.
 */
export const DRIP_MAX_SENDABLE_INDEX = 4;

/**
 * Lowest drip email the cron will send. Email 1 (welcome) is RETIRED as of
 * 10 Aug 2026: TeamUp's "When a membership is purchased" notification now carries
 * the welcome and the induction booking button, and it fires within seconds of
 * payment instead of at programme start.
 *
 * Running both sent every new member two near-identical welcomes, each with the
 * same induction link. Karen Marshall got TeamUp's on 26 Jul 2026 at 18:15 and
 * this one on 10 Aug at 07:26, fifteen days apart, because the drip anchors to
 * programme start while the purchase fires on purchase. TeamUp's wins on timing:
 * a member who buys weeks ahead of their start needs the induction prompt on the
 * day they pay, not on the morning of their first session.
 *
 * Indices are deliberately NOT renumbered. Emails 2-6 keep their template
 * aliases and their "Onboarding Email N Sent" checkboxes, so no historic member
 * record changes meaning. Email 1 is recorded in ONBOARDING_SKIPPED_EMAILS
 * rather than left silently unticked, because an unticked box is exactly how a
 * retired step and a failed send come to look identical in Notion.
 *
 * If TeamUp's purchase email is ever disabled, new members get no welcome and no
 * induction link at all. Lowering this floor is NO LONGER ENOUGH to restore it:
 * the Resend template gain-onboarding-1-welcome has since been deleted, so index
 * 1 would fail to send rather than fall back. Recreate the template first from
 * "AI for SMBs/onboarding-flow/onboarding-emails.md" (which still holds the copy),
 * then lower the floor.
 *
 * Email 2 (induction prep) is RETIRED as of 12 Aug 2026, for a different and
 * more serious reason: its trigger was wrong, not merely duplicated. It was due
 * two days after programme start and went out regardless of whether an induction
 * was booked, already done, or never arranged. On 12 Aug it reached Karen
 * Marshall, whose induction had already happened, and Melanie Beard, who had
 * nothing booked at all. It opens "Your induction is coming up" and carries no
 * booking link, so it reads as confirmation of something that may not exist.
 * Hallum raised it that morning: "I was a bit confused as to why it's not in my
 * calendar though but she got an email confirming it".
 *
 * A date offset cannot express "an induction is booked", so no change to the
 * schedule would have fixed it. Inductions are now booked exclusively through
 * TeamUp, which knows when one exists, so TeamUp owns this email: a Registration
 * Confirmation case scoped to the Gain Programme Induction fires on booking, and
 * a Pre/Post Class notification scoped to the same type fires before the day.
 * Neither can fire when nothing is booked, which is the entire point.
 *
 * The Resend template gain-onboarding-2-induction-prep was expected to stay
 * published so its copy could be lifted into those TeamUp notifications. It has
 * since been deleted from Resend (confirmed 15 Aug 2026), so the copy now lives
 * only in "AI for SMBs/onboarding-flow/onboarding-emails.md" and in TeamUp
 * notification 36605. Email 2 keeps its index and its checkbox exactly as email 1
 * did.
 */
export const DRIP_MIN_SENDABLE_INDEX = 3;

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
