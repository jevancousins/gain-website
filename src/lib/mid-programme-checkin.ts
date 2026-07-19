import type { OnboardingMember } from "@/lib/notion-members";
import type { ProgrammeMembership } from "@/lib/teamup-memberships";
import { ceilingActiveDays, midpointActiveDays } from "@/lib/onboarding-emails";

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
 */

export type Email6Decision =
  | "SEND"
  | "SKIP_PAUSED"
  | "SKIP_NOT_YET"
  | "SKIP_PAST_CEILING"
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
    midpointDays: null,
    ceilingDays: null,
  };

  if (member.teamupId == null) return { ...base, decision: "SKIP_NO_TEAMUP_ID" };
  if (!programme) return { ...base, decision: "SKIP_NO_PROGRAMME" };

  // Phase B: accumulator. A new programme instance (different membership id)
  // resets the counter; a non-paused day the counter has not yet seen advances it.
  const anchorReset = member.anchorMembershipId !== programme.membershipId;
  let activeDays = anchorReset ? 0 : member.programmeActiveDays;
  let countedOn = anchorReset ? null : member.activeDaysCountedOn;
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
  } else {
    decision = "SEND";
  }

  return { ...acc, decision };
}
