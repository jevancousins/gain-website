import {
  ensureOnboardingProperties,
  loadOnboardingMembers,
  recordEmail6Sent,
  recordEmail6Skipped,
  setOnboardingFlag,
  setProgrammeCounter,
  type OnboardingMember,
} from "@/lib/notion-members";
import {
  fetchMembershipSummaryByCustomer,
  type ProgrammeMembership,
} from "@/lib/teamup-memberships";
import { DRIP_TEMPLATE_ALIAS, MID_PROGRAMME_EMAIL_INDEX } from "@/lib/onboarding-emails";
import { planEmail6, type Email6Plan } from "@/lib/mid-programme-checkin";

/**
 * Daily member-onboarding: two passes.
 *
 * 1. ENROLMENT (emails 1-5). The welcome -> induction-prep -> mobility -> week-1 ->
 *    nutrition sequence lives in the Resend Automation "Member onboarding drip".
 *    This cron fires ONE `member.joined` event per new member and Resend runs the
 *    fixed-delay sequence. Marked once by "Onboarding Email 1 Sent".
 *
 * 2. MID-PROGRAMME CHECK-IN (email 6). NOT a step in that automation: a fixed
 *    delay from enrolment cannot reflect the true midpoint, a pause, an early
 *    cancellation, or which programme the member is on. Instead this cron sends it
 *    directly, timed to the member's TRUE halfway point counted in ACTIVE-training
 *    days (21 for a 6-week programme, 42 for a 12-week), anchored to the TeamUp
 *    membership start, paused when the membership is on hold. Live membership facts
 *    come from TeamUp each run; the active-day counter and per-membership dedup are
 *    persisted in Notion. `planEmail6` holds the decision logic. (The old day-21
 *    mid-programme step has been removed from the Resend Automation, so no double-send.)
 *
 * Runs at 07:00 UTC, after teamup-members-sync (06:00) and resend-contacts-sync
 * (06:30). Timezone Europe/London; day math is YMD compares.
 *
 * Manual check: GET /api/cron/onboarding-drip?key=<CRON_SECRET>&dryRun=true
 */

const TZ = "Europe/London";

// The trigger event of the Resend "Member onboarding drip" automation.
const ENROLL_EVENT = "member.joined";

// Enrolment cutoff for emails 1-5. Only members who joined on/after this enter the
// drip, so the first run never enrols the back-catalogue. Override with
// ONBOARDING_DRIP_START_DATE (YYYY-MM-DD). Far-future value = no-enrol kill switch.
const DRIP_START_DATE = process.env.ONBOARDING_DRIP_START_DATE ?? "2026-06-21";

// The mid-programme check-in needs NO go-live date. It self-scopes: a programme is
// tracked from the first run that sees it, and one already well underway on first
// sight is skipped (see FIRST_TRACK_GRACE_DAYS). So the programmes can be sold the
// moment this deploys, and every sale from then on is timed correctly.

const MID_PROGRAMME_TEMPLATE = DRIP_TEMPLATE_ALIAS[MID_PROGRAMME_EMAIL_INDEX];

function gate(request: Request): boolean {
  const expected = [process.env.CRON_SECRET, process.env.TEAMUP_DIAG_KEY].filter(
    (v): v is string => Boolean(v),
  );
  if (expected.length === 0) return false;
  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  return expected.includes(provided);
}

/** YYYY-MM-DD for an instant, in a given IANA timezone. */
function ymdInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

type EnrolPlan = { email: string; firstName: string; pageId: string };

type Email6Record = {
  email: string;
  firstName: string;
  pageId: string;
  teamupId: number | null;
  programmeName: string | null;
  startDate: string | null;
  status: string | null;
  isPaused: boolean;
  activeDaysBefore: number;
  plan: Email6Plan;
};

export async function GET(request: Request) {
  if (!gate(request)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.LEAD_FROM_EMAIL;

  const startedAt = Date.now();
  const todayYmd = ymdInTz(new Date(), TZ);

  try {
    if (!dryRun) await ensureOnboardingProperties();
    const members = await loadOnboardingMembers();

    // Live membership facts for the mid-programme pass. A failed read must not
    // suppress or mistime anyone: every member falls through to
    // SKIP_UNRESOLVED_LIVE_READ and retries next run.
    let membershipMap: Awaited<ReturnType<typeof fetchMembershipSummaryByCustomer>> | null;
    try {
      membershipMap = await fetchMembershipSummaryByCustomer();
    } catch {
      membershipMap = null;
    }

    // ---- Pass 1: enrolment (emails 1-5) ----
    const plans: EnrolPlan[] = [];
    let noJoinDate = 0;
    let preStart = 0;
    for (const m of members) {
      if (!m.joined) {
        noJoinDate += 1;
        continue;
      }
      if (m.joined < DRIP_START_DATE) {
        preStart += 1;
        continue;
      }
      if (m.sent[0]) continue; // already enrolled
      plans.push({ email: m.email, firstName: m.firstName, pageId: m.pageId });
    }

    // ---- Pass 2: mid-programme check-in (email 6) ----
    const midRecords: Email6Record[] = [];
    for (const m of members) {
      const programme =
        membershipMap && m.teamupId != null
          ? membershipMap.get(m.teamupId)?.programme ?? null
          : null;
      const plan =
        membershipMap == null && m.teamupId != null
          ? unresolvedPlan(m)
          : planEmail6(m, programme, todayYmd, DRIP_START_DATE);
      // Only members with something to report (a programme, or a diagnosable skip).
      if (
        plan.decision === "SKIP_NO_PROGRAMME" ||
        plan.decision === "SKIP_NO_TEAMUP_ID"
      ) {
        // Skip the quiet majority (no programme) from the record to keep output lean,
        // but still surface members who LOOK like programme members yet cannot resolve.
        if (plan.decision === "SKIP_NO_TEAMUP_ID") {
          midRecords.push(buildRecord(m, programme, plan));
        }
        continue;
      }
      midRecords.push(buildRecord(m, programme, plan));
    }

    if (dryRun) {
      return Response.json({
        ok: true,
        dryRun: true,
        durationMs: Date.now() - startedAt,
        todayYmd,
        dripStartDate: DRIP_START_DATE,
        totalMembers: members.length,
        liveMembershipRead: membershipMap != null,
        enrolment: { noJoinDate, preStart, toEnrol: plans.length, enrol: plans.map((p) => p.email) },
        midProgramme: {
          decisionCounts: countDecisions(midRecords),
          toSend: midRecords.filter((r) => r.plan.decision === "SEND").map((r) => r.email),
          records: midRecords,
        },
      });
    }

    if (!resendKey) {
      return Response.json(
        { ok: false, error: "RESEND_API_KEY not set", toEnrol: plans.length },
        { status: 500 },
      );
    }

    // ---- Execute pass 1: enrol ----
    const enrolled: string[] = [];
    const enrolErrors: Array<{ email: string; reason: string }> = [];
    for (const p of plans) {
      try {
        await enrolMember(p, resendKey);
        await setOnboardingFlag(p.pageId, 1);
        enrolled.push(p.email);
      } catch (err) {
        enrolErrors.push({ email: p.email, reason: (err as Error).message });
      }
    }

    // ---- Execute pass 2: persist counters, send due check-ins ----
    const sent6: string[] = [];
    const skipped6: string[] = [];
    const errors6: Array<{ email: string; reason: string }> = [];
    for (const r of midRecords) {
      const { plan } = r;
      // Persist the day's counter for any resolved programme (send or not). The
      // active day elapsed regardless of whether the email goes out today.
      if (plan.anchorMembershipId && (plan.anchorReset || plan.incremented)) {
        try {
          await setProgrammeCounter(r.pageId, {
            activeDays: plan.activeDays,
            countedOn: plan.countedOn,
            anchorMembershipId: plan.anchorMembershipId,
          });
        } catch (err) {
          errors6.push({ email: r.email, reason: `counter: ${(err as Error).message}` });
        }
      }

      if (plan.decision === "SEND") {
        if (!fromEmail) {
          errors6.push({ email: r.email, reason: "LEAD_FROM_EMAIL not set" });
          continue;
        }
        try {
          await sendMidProgrammeEmail(r, resendKey, fromEmail, plan.anchorMembershipId!);
          await recordEmail6Sent(r.pageId, membersById(members, r.pageId).email6SentMembershipIds, plan.anchorMembershipId!);
          sent6.push(r.email);
        } catch (err) {
          errors6.push({ email: r.email, reason: (err as Error).message });
        }
      } else if (
        (plan.decision === "SKIP_PAST_CEILING" ||
          plan.decision === "SKIP_PROGRAMME_PREDATES_TRACKING") &&
        plan.anchorMembershipId
      ) {
        // Permanently record so a deliberately-skipped programme is never revisited.
        try {
          await recordEmail6Skipped(
            r.pageId,
            membersById(members, r.pageId).email6SkippedMembershipIds,
            plan.anchorMembershipId,
          );
          skipped6.push(r.email);
        } catch (err) {
          errors6.push({ email: r.email, reason: `skip: ${(err as Error).message}` });
        }
      }
    }

    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      todayYmd,
      dripStartDate: DRIP_START_DATE,
      totalMembers: members.length,
      liveMembershipRead: membershipMap != null,
      enrolment: {
        noJoinDate,
        preStart,
        toEnrol: plans.length,
        enrolledCount: enrolled.length,
        enrolled,
        errors: enrolErrors,
      },
      midProgramme: {
        decisionCounts: countDecisions(midRecords),
        sentCount: sent6.length,
        sent: sent6,
        skipped: skipped6,
        errors: errors6,
      },
    });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}

/** The plan used when the live TeamUp read failed for a member with a TeamUp id. */
function unresolvedPlan(m: OnboardingMember): Email6Plan {
  return {
    decision: "SKIP_UNRESOLVED_LIVE_READ",
    activeDays: m.programmeActiveDays,
    countedOn: m.activeDaysCountedOn,
    anchorMembershipId: m.anchorMembershipId,
    incremented: false,
    anchorReset: false,
    midpointDays: null,
    ceilingDays: null,
  };
}

function buildRecord(
  m: OnboardingMember,
  programme: ProgrammeMembership | null,
  plan: Email6Plan,
): Email6Record {
  return {
    email: m.email,
    firstName: m.firstName,
    pageId: m.pageId,
    teamupId: m.teamupId,
    programmeName: programme?.name ?? null,
    startDate: programme?.startDate ?? null,
    status: programme?.status ?? null,
    isPaused: programme?.isPaused ?? false,
    activeDaysBefore: m.programmeActiveDays,
    plan,
  };
}

function membersById(members: OnboardingMember[], pageId: string): OnboardingMember {
  return members.find((m) => m.pageId === pageId)!;
}

function countDecisions(records: Email6Record[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of records) out[r.plan.decision] = (out[r.plan.decision] ?? 0) + 1;
  return out;
}

/** Enrol one member into the Resend "Member onboarding drip" (emails 1-5). */
async function enrolMember(
  plan: Pick<EnrolPlan, "email" | "firstName">,
  apiKey: string,
): Promise<void> {
  const name = (plan.firstName || "").trim() || "there";
  const res = await fetch("https://api.resend.com/events/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ event: ENROLL_EVENT, email: plan.email, payload: { MEMBER_FIRST_NAME: name } }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend enrol ${res.status}: ${body.slice(0, 200)}`);
  }
}

/** Send the mid-programme check-in (email 6), deduped per membership id. */
async function sendMidProgrammeEmail(
  r: Email6Record,
  apiKey: string,
  from: string,
  membershipId: string,
): Promise<void> {
  if (!MID_PROGRAMME_TEMPLATE) throw new Error("no template alias for email 6");
  const name = (r.firstName || "").trim() || "there";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Deduplicate same-run retries and any re-attempt within Resend's window.
      "Idempotency-Key": `email6-${membershipId}`,
    },
    body: JSON.stringify({
      from,
      reply_to: "hallum@gainstrengththerapy.com",
      to: [r.email],
      template: { id: MID_PROGRAMME_TEMPLATE, variables: { MEMBER_FIRST_NAME: name } },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend email6 ${res.status}: ${body.slice(0, 200)}`);
  }
}
