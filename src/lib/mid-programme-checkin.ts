import type { OnboardingMember } from "@/lib/notion-members";
import type { ProgrammeMembership } from "@/lib/teamup-memberships";
import { ceilingActiveDays, midpointActiveDays } from "@/lib/onboarding-emails";
import { attendedSince, daysBetweenYmd } from "@/lib/onboarding-drip-plan";

/**
 * Decides, for one member on one run, whether the mid-programme check-in (email 6)
 * is due, and returns the accumulator state to persist. Pure and deterministic so
 * it can be unit-tested without TeamUp/Notion/Resend.
 *
 * The trigger is anchored to ACTIVE-training days, accumulated one per day the
 * cron sees the programme active (paused days do not advance it), so the check-in
 * lands at the member's true halfway point (21 active days for a 6-week programme,
 * 42 for a 12-week) and is deferred, not lost, while the member is paused. See the
 * design note in the onboarding-drip route.
 *
 * ATTENDANCE IS REQUIRED, not just elapsed time. The copy tells the member they are
 * halfway through their programme and asks how the training is going, which asserts
 * they have been training. Reaching day 21 of a membership does not establish that.
 * Melanie Beard was the live case on 19 Aug 2026: a 6-week programme running from
 * 10 Aug with no TeamUp attendance row at all, on course to be told she was halfway
 * through sessions she had never attended.
 *
 * This is the same rule already carried by emails 3 and 4 in REQUIRES_ATTENDANCE
 * (see onboarding-drip-plan), and `attendedSince` is imported from there rather than
 * restated, because the last time this rule was decided per-email by recalling what
 * an email was for rather than reading its copy, email 3 was wrongly left ungated
 * and went out to a member who had not trained.
 *
 * The same caveat applies here as there: this depends on attendance actually being
 * registered in TeamUp. An induction that was run but never recorded is
 * indistinguishable from a member who never came, so the failure mode is a held
 * email rather than a false one. That is the safer direction, not a harmless one.
 */

export type Email6Decision =
  | "SEND"
  | "SKIP_PAUSED"
  | "SKIP_NOT_YET"
  | "SKIP_PAST_CEILING"
  | "SKIP_NO_ATTENDANCE"
  | "SKIP_EARLY_DEPARTURE"
  | "SKIP_ALREADY_HANDLED"
  | "SKIP_ORDERING"
  | "SKIP_BEFORE_PROGRAMME_CUTOFF"
  | "SKIP_NO_PROGRAMME"
  | "SKIP_NO_TEAMUP_ID"
  | "SKIP_UNRESOLVED_LIVE_READ";

export type Email6Plan = {
  decision: Email6Decision;
  /** Accumulator to persist after this run (only when programme is non-null). */
  activeDays: number;
  countedOn: string | null;
  anchorMembershipId: string | null;
  incremented: boolean;
  anchorReset: boolean;
  /** True when the stored count was impossible and was cut back to elapsed days. */
  clamped: boolean;
  midpointDays: number | null;
  ceilingDays: number | null;
};

/** Add whole days to a YMD date, returning YMD. UTC math avoids DST drift. */
export function addDaysYmd(ymd: string, days: number): string {
  const ms = Date.parse(`${ymd}T00:00:00Z`);
  return new Date(ms + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Whether the member will leave before reaching the midpoint, so a "you're
 * halfway" email would be wrong. True if the programme is already cancelled or
 * completed (defensive; selection normally excludes those), or it is set to
 * cancel and its effective end falls before the member could reach the midpoint.
 * A natural term-end far beyond the midpoint does NOT count, so this never kills
 * the feature for a fixed-term membership modelled as scheduled-to-cancel.
 */
export function isEarlyDeparture(
  p: ProgrammeMembership,
  todayYmd: string,
  midpointDays: number,
  activeDays: number,
): boolean {
  const status = (p.status ?? "").toLowerCase();
  if (status === "cancelled" || status === "completed") return true;
  if (!p.isSetForCancellation) return false;
  const effectiveEnd = p.expiresAt ?? p.renewalDate;
  if (!effectiveEnd) return false;
  const daysToMidpoint = Math.max(0, midpointDays - activeDays);
  const needBy = addDaysYmd(todayYmd, daysToMidpoint);
  return effectiveEnd < needBy;
}

export function planEmail6(
  member: OnboardingMember,
  programme: ProgrammeMembership | null,
  todayYmd: string,
  programmeCutoff: string,
  dripStartDate: string,
): Email6Plan {
  const base: Omit<Email6Plan, "decision"> = {
    activeDays: member.programmeActiveDays,
    countedOn: member.activeDaysCountedOn,
    anchorMembershipId: member.anchorMembershipId,
    incremented: false,
    anchorReset: false,
    clamped: false,
    midpointDays: null,
    ceilingDays: null,
  };

  if (member.teamupId == null) return { ...base, decision: "SKIP_NO_TEAMUP_ID" };
  if (!programme) return { ...base, decision: "SKIP_NO_PROGRAMME" };

  // Phase B: accumulator. A new programme instance (different membership id)
  // resets the counter; a non-paused day the counter has not yet seen advances it.
  const anchorReset = member.anchorMembershipId !== programme.membershipId;

  // A stored count only resets when the anchor membership id CHANGES, which
  // silently trusts the number attached to an unchanged id. That is not safe:
  // the id can be corrected by hand while the count is left behind. Melanie
  // Beard, 25 Aug 2026, carried 8 active days against membership 10842573 whose
  // start_date is 26 Aug, accrued days earlier against a pre-start anchor and
  // left in place when the 22 Aug run fixed the id. Unclamped she would have
  // reached the 21-day midpoint on ~8 Sep, 13 days into a 42-day programme, and
  // been told she was halfway through it.
  //
  // An ACTIVE day is a day the programme was running, so the count can never
  // exceed the calendar days since it started; paused days only make it smaller.
  // Anything above that ceiling is impossible rather than merely surprising, so
  // cut it back rather than carrying it. Self-healing beats catching it by hand:
  // the counter is invisible until the wrong email lands.
  const elapsedDays = Math.max(0, daysBetweenYmd(programme.startDate, todayYmd) + 1);
  const storedDays = anchorReset ? 0 : member.programmeActiveDays;
  const clamped = storedDays > elapsedDays;
  let activeDays = clamped ? elapsedDays : storedDays;
  let countedOn = anchorReset || clamped ? null : member.activeDaysCountedOn;
  let incremented = false;
  if (!programme.isPaused && countedOn !== todayYmd) {
    activeDays += 1;
    countedOn = todayYmd;
    incremented = true;
  }

  const midpointDays = midpointActiveDays(programme.lengthDays);
  const ceilingDays = ceilingActiveDays(programme.lengthDays);
  const acc = {
    activeDays,
    countedOn,
    anchorMembershipId: programme.membershipId,
    incremented,
    anchorReset,
    clamped,
    midpointDays,
    ceilingDays,
  };

  // Phase C: ordered gates. First failing gate wins.
  let decision: Email6Decision;
  if (programme.startDate < programmeCutoff) {
    decision = "SKIP_BEFORE_PROGRAMME_CUTOFF";
  } else if (
    member.email6SentMembershipIds.includes(programme.membershipId) ||
    member.email6SkippedMembershipIds.includes(programme.membershipId)
  ) {
    decision = "SKIP_ALREADY_HANDLED";
  } else if (!((member.joined && member.joined < dripStartDate) || member.sent[0])) {
    // Ordering floor: an upgrader (joined before the enrolment cutoff, so never in
    // emails 1-5) passes via the first clause; a genuine new member must have had
    // their welcome (sent[0]) before the mid-programme email can precede it.
    decision = "SKIP_ORDERING";
  } else if (programme.isPaused) {
    decision = "SKIP_PAUSED";
  } else if (isEarlyDeparture(programme, todayYmd, midpointDays, activeDays)) {
    decision = "SKIP_EARLY_DEPARTURE";
  } else if (activeDays < midpointDays) {
    decision = "SKIP_NOT_YET";
  } else if (activeDays > ceilingDays) {
    decision = "SKIP_PAST_CEILING";
  } else if (!attendedSince(member, programme.startDate)) {
    // Never tell someone they are halfway through training they have not done.
    // Deliberately ordered AFTER the ceiling so this holds rather than blocks: a
    // member who starts late still gets the check-in once they train, and one who
    // never trains is closed out by SKIP_PAST_CEILING, which records the skip
    // against the membership instead of re-deciding it every morning forever.
    decision = "SKIP_NO_ATTENDANCE";
  } else {
    decision = "SEND";
  }

  return { ...acc, decision };
}
