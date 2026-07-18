import {
  ensureOnboardingProperties,
  loadOnboardingMembers,
  setOnboardingFlag,
} from "@/lib/notion-members";

/**
 * Daily member-onboarding ENROLMENT.
 *
 * The onboarding emails now live in the Resend Automation "Member onboarding
 * drip" (built in Resend, so the whole sequence and each member's progress are
 * visible in the Resend dashboard). This cron no longer sends the emails itself:
 * it fires ONE `member.joined` event per new member, and Resend runs the timed
 * sequence (welcome → induction prep → mobility → week-1 → mid-programme; the
 * nutrition step is added back once the guide is hosted).
 *
 * Idempotent: each member is enrolled at most once, marked by the existing
 * "Onboarding Email 1 Sent" checkbox — email 1 is sent by the automation the
 * instant the event fires, so that flag stays a faithful "has been onboarded"
 * marker and a re-run never re-enrols. Members who joined before DRIP_START_DATE
 * are excluded so the back-catalogue is never enrolled.
 *
 * Runs at 07:00 UTC, after teamup-members-sync (06:00) and resend-contacts-sync
 * (06:30), so a new member exists in Notion and their Resend contact (whose
 * first_name the automation reads as contact.first_name) is provisioned before
 * we enrol them.
 *
 * Manual check: GET /api/cron/onboarding-drip?key=<CRON_SECRET>&dryRun=true
 */

const TZ = "Europe/London";

// The trigger event of the Resend "Member onboarding drip" automation.
const ENROLL_EVENT = "member.joined";

// Enrolment cutoff. Only members who joined on or after this date are enrolled,
// so the first run never enrols the whole existing membership. Override with
// ONBOARDING_DRIP_START_DATE (YYYY-MM-DD). String compare is chronological for
// ISO dates. Setting it far in the future (e.g. 2999-01-01) is the no-deploy
// kill switch: the cron runs but enrols nobody.
const DRIP_START_DATE = process.env.ONBOARDING_DRIP_START_DATE ?? "2026-06-21";

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

export async function GET(request: Request) {
  if (!gate(request)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const resendKey = process.env.RESEND_API_KEY;

  const startedAt = Date.now();
  const todayYmd = ymdInTz(new Date(), TZ);

  try {
    if (!dryRun) await ensureOnboardingProperties();
    const members = await loadOnboardingMembers();

    // Enrol each eligible member exactly once: joined on/after the cutoff and
    // not yet marked (sent[0] = "Onboarding Email 1 Sent" = already enrolled).
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

    if (dryRun) {
      return Response.json({
        ok: true,
        dryRun: true,
        durationMs: Date.now() - startedAt,
        todayYmd,
        dripStartDate: DRIP_START_DATE,
        totalMembers: members.length,
        noJoinDate,
        preStart,
        toEnrol: plans.length,
        enrol: plans.map((p) => p.email),
      });
    }

    if (!resendKey) {
      return Response.json(
        { ok: false, error: "RESEND_API_KEY not set", toEnrol: plans.length },
        { status: 500 },
      );
    }

    const enrolled: string[] = [];
    const errors: Array<{ email: string; reason: string }> = [];

    // Sequential to stay well within Resend + Notion rate limits; volume is a
    // handful of new members per day at most.
    for (const p of plans) {
      try {
        await enrolMember(p, resendKey);
        // Only mark enrolled once the event was accepted, so a failure leaves
        // the flag false and the member is retried on the next run.
        await setOnboardingFlag(p.pageId, 1);
        enrolled.push(p.email);
      } catch (err) {
        errors.push({ email: p.email, reason: (err as Error).message });
      }
    }

    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      todayYmd,
      dripStartDate: DRIP_START_DATE,
      totalMembers: members.length,
      noJoinDate,
      preStart,
      toEnrol: plans.length,
      enrolledCount: enrolled.length,
      enrolled,
      errors,
    });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}

/**
 * Enrol one member into the Resend "Member onboarding drip" automation by firing
 * its trigger event. The automation reads the member's first name from their
 * Resend contact (contact.first_name); the payload name is a redundant backup.
 */
async function enrolMember(
  plan: Pick<EnrolPlan, "email" | "firstName">,
  apiKey: string,
): Promise<void> {
  const name = (plan.firstName || "").trim() || "there";
  const res = await fetch("https://api.resend.com/events/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: ENROLL_EVENT,
      email: plan.email,
      payload: { MEMBER_FIRST_NAME: name },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend enrol ${res.status}: ${body.slice(0, 200)}`);
  }
}
