import type { OnboardingMember } from "@/lib/notion-members";
import type { MembershipSummary } from "@/lib/teamup-memberships";
import {
  DRIP_MAX_LATE_DAYS,
  DRIP_MAX_SENDABLE_INDEX,
  DRIP_MIN_SENDABLE_INDEX,
  DRIP_SCHEDULE_DAYS,
} from "@/lib/onboarding-emails";

/**
 * Which sequence email (1-5) is due for a member, and what to do with it.
 *
 * Lives here rather than in the cron route so it can be exercised directly:
 * the interesting cases are dated (a member whose training starts a week after
 * their billing does) and cannot be reached by calling the endpoint today. The
 * mid-programme planner `planEmail6` already sits in @/lib for the same reason.
 */

/** Whole days from a YYYY-MM-DD to another, both read as calendar dates (UTC noon). */
export function daysBetweenYmd(from: string, to: string): number {
  const a = Date.parse(`${from}T12:00:00Z`);
  const b = Date.parse(`${to}T12:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * The one drip email due for a member on this run, or null.
 *
 * At most ONE email per member per run, always the lowest unsent index that is
 * due. A member recovering from a gap therefore catches up at one email a day
 * rather than receiving the whole sequence in a single burst.
 *
 * `action` is "send" normally, "mark_unattended" when the step requires the
 * member to have trained and they still have not DRIP_MAX_LATE_DAYS after it came
 * due (before that the step simply waits and no plan is returned at all, so a
 * member whose training start lags their membership start keeps the email rather
 * than losing it), "mark_stale" when the email is more
 * than DRIP_MAX_LATE_DAYS past due, or "mark_retired" for a step below
 * DRIP_MIN_SENDABLE_INDEX that another system now owns (email 1, the welcome,
 * which TeamUp sends at purchase). In both mark_* cases the flag is ticked
 * without sending, so the member moves on through the sequence instead of
 * getting stale or duplicate mail, and the index is also recorded in
 * ONBOARDING_SKIPPED_EMAILS, so "we sent this" and "we deliberately did not"
 * never look the same in Notion afterwards.
 */
export type DripPlan = {
  email: string;
  firstName: string;
  pageId: string;
  emailIndex: number;
  dueDay: number;
  /** What the schedule is measured from, and why. */
  anchorDate: string;
  anchorSource:
    | "programme_start"
    | "upcoming_programme_start"
    | "membership_start"
    | "joined";
  daysSinceAnchor: number;
  action: "send" | "mark_stale" | "mark_retired" | "mark_unattended";
};

/**
 * Emails whose copy asserts the member has already trained, and which must
 * therefore be checked against attendance rather than sent on a date alone.
 *
 * Email 4 asks "How's the first week going?". Sent on day 7 regardless, it
 * asks that of someone who may never have walked in, which is both wrong and
 * aimed at exactly the member you least want to misjudge. Found 12 Aug 2026 in
 * the trigger audit that followed the induction-prep fault, which was the same
 * mistake in a worse form: an email describing an event the system had not
 * checked had happened.
 *
 * The test is attendance ON OR AFTER the drip anchor, not merely "has ever
 * attended", so a returning member's history from a previous programme cannot
 * satisfy it. `lastSession` comes from the Members DB, written by
 * teamup-members-sync at 06:00 from TeamUp attendance, an hour before this cron.
 *
 * Email 3 (the mobility guide) was excluded from this set on 12 Aug 2026 on the
 * grounds that it "offers a resource and claims nothing". That was wrong, and
 * nobody checked it against the live copy, which opens "Now that you have had
 * your induction and your first session", says "Try it on a rest day this week",
 * and closes "I can tweak the routine based on what we found at your induction".
 * Three unverified assertions, so by the rule below it always belonged here. It
 * went out on 15 Aug 2026 to Melanie Beard, five days into a membership she had
 * not started training on, telling her to use it between sessions she had not had.
 *
 * The rule to keep: a date trigger is only wrong when the copy asserts a fact the
 * system has not verified, and whether it does is settled by READING THE TEMPLATE
 * rather than by recalling what the email is for. The copy lives in
 * "AI for SMBs/onboarding-flow/onboarding-emails.md".
 */
export const REQUIRES_ATTENDANCE = new Set([3, 4]);

/**
 * The date the sequence is measured from: the member's programme start where they
 * have one (including a programme that has not begun yet), then the start of any
 * other membership they hold, and only then the Notion Joined date.
 *
 * Joined records the day they BOUGHT, which is not the day they START. Karen
 * Marshall bought on 26 Jul 2026 to start on 10 Aug; anchored to the purchase she
 * would have been asked how her first week went a fortnight before her first
 * session.
 *
 * The `membership_start` step exists because the two programme fields above are
 * gated on programmeLengthDays(), which only recognises "6 week" and "12 week".
 * Every other membership fell straight through to Joined and inherited exactly the
 * purchase-vs-start bug the programme anchor was added to fix: Lisa Gillette bought
 * the 30-Day Strength Programme on 19 Jul 2026 to start on 4 Aug, and on day 5 of
 * her programme the sequence read as 21 days old, so emails 1-3 were past
 * DRIP_MAX_LATE_DAYS and were skipped without ever being sent.
 *
 * Only members with no membership row at all now fall back to Joined.
 *
 * NOTE: every anchor here is a BILLING date. None of them is the day the member
 * first trains, which is what the attendance-gated steps actually care about.
 */
export function dripAnchor(
  m: OnboardingMember,
  summary: MembershipSummary | null,
): { date: string; source: DripPlan["anchorSource"] } | null {
  if (summary?.programme?.startDate) {
    return { date: summary.programme.startDate, source: "programme_start" };
  }
  if (summary?.upcomingProgrammeStart) {
    return { date: summary.upcomingProgrammeStart, source: "upcoming_programme_start" };
  }
  if (summary?.membershipStart) {
    return { date: summary.membershipStart, source: "membership_start" };
  }
  return m.joined ? { date: m.joined, source: "joined" } : null;
}

/**
 * Has the member trained on or after the date the sequence is measured from?
 * A null Last Session means they have never attended anything, which counts as
 * no. A session recorded before the anchor belongs to an earlier membership and
 * does not count either.
 */
export function attendedSince(m: OnboardingMember, anchorDate: string): boolean {
  return m.lastSession != null && m.lastSession >= anchorDate;
}

export function planDripEmail(
  m: OnboardingMember,
  summary: MembershipSummary | null,
  todayYmd: string,
  dripStartDate: string,
): DripPlan | null {
  if (!m.joined || m.joined < dripStartDate) return null;
  const anchor = dripAnchor(m, summary);
  if (!anchor) return null;
  const daysSinceAnchor = daysBetweenYmd(anchor.date, todayYmd);
  if (daysSinceAnchor < 0) return null; // programme has not started; nothing due yet

  for (let i = 1; i <= DRIP_MAX_SENDABLE_INDEX; i += 1) {
    if (m.sent[i - 1]) continue;
    const dueDay = DRIP_SCHEDULE_DAYS[i];
    if (dueDay == null || daysSinceAnchor < dueDay) return null; // not due; later ones cannot be either

    // An attendance-gated step WAITS for the member to train rather than being
    // written off the moment it comes due. Nothing is sent meanwhile and the
    // member is reconsidered every morning until DRIP_MAX_LATE_DAYS runs out.
    //
    // This used to allow a single day of slack, enough to cover the sync lag (a
    // session on the due day itself only reaches the Members DB at the next
    // morning's 06:00 sync, an hour before this cron), and then gave up. That
    // silently consumed the step for anyone whose training start lagged their
    // membership start by more than a day, which is common: every anchor above is
    // a BILLING fact while this gate tests attendance, a TRAINING fact. Melanie
    // Beard's 6-week programme starts 10 Aug 2026 on that billing basis but she
    // trains from w/c 17 Aug, so on 18 Aug the old rule would have ticked her
    // week-1 check-in unsent and she would never have received it, with Notion
    // recording the step as handled.
    //
    // Deferring holds the rest of the sequence too, since the loop sends at most
    // one email per member per run and returns on the lowest unsent due index.
    // That is intended: emails 4 and 5 both read as mid-programme and must not
    // overtake a step still waiting on a first session.
    //
    // NOTE: this makes onboarding depend on attendance actually being registered
    // in TeamUp. Melanie's induction was run but never recorded, leaving no
    // attendance row at all, and an unrecorded session is indistinguishable here
    // from a member who never came. The failure is now a held email rather than a
    // false one, which is the safer direction, but it is still a failure.
    if (
      REQUIRES_ATTENDANCE.has(i) &&
      !attendedSince(m, anchor.date) &&
      daysSinceAnchor - dueDay <= DRIP_MAX_LATE_DAYS
    ) {
      return null;
    }

    return {
      email: m.email,
      firstName: m.firstName,
      pageId: m.pageId,
      emailIndex: i,
      dueDay,
      anchorDate: anchor.date,
      anchorSource: anchor.source,
      daysSinceAnchor,
      // "mark_unattended" is tested BEFORE "mark_stale". Past the deferral above,
      // an unattended gated step is always also past DRIP_MAX_LATE_DAYS, and
      // "never trained" is the true reason it was not sent, where "stale" would
      // imply the send was merely too late to be useful.
      action:
        i < DRIP_MIN_SENDABLE_INDEX
          ? "mark_retired"
          : REQUIRES_ATTENDANCE.has(i) && !attendedSince(m, anchor.date)
            ? "mark_unattended"
            : daysSinceAnchor - dueDay > DRIP_MAX_LATE_DAYS
              ? "mark_stale"
              : "send",
    };
  }
  return null;
}
