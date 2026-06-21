import {
  ensureOnboardingProperties,
  loadOnboardingMembers,
  setOnboardingFlag,
} from "@/lib/notion-members";
import { buildDripEmailContent } from "@/lib/onboarding-emails";

/**
 * Daily onboarding drip: sends new-member lifecycle emails as they fall due,
 * keyed off each member's `Joined` date in the Notion Members DB.
 *
 * Idempotent by design. Each email is tracked by an "Onboarding Email N Sent"
 * checkbox on the member's row; the cron only sends where the flag is false and
 * the elapsed days since joining have reached the threshold, then sets the flag
 * on success. Re-running the cron (or a retry) therefore never double-sends.
 *
 * Member data arrives via the teamup-members-sync cron (06:00 UTC); this runs
 * at 07:00 UTC so a member who joined yesterday is picked up the next morning.
 *
 * Manual check: GET /api/cron/onboarding-drip?key=<CRON_SECRET>&dryRun=true
 */

const TZ = "Europe/London";

const DRIP_SEQUENCE = [
  { emailIndex: 1, daysAfterJoined: 0 },
  { emailIndex: 2, daysAfterJoined: 2 },
  { emailIndex: 3, daysAfterJoined: 5 },
  { emailIndex: 4, daysAfterJoined: 7 },
  { emailIndex: 5, daysAfterJoined: 14 },
  { emailIndex: 6, daysAfterJoined: 21 },
] as const;

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

/** Whole days from `joined` (YYYY-MM-DD) up to `todayYmd`. Negative if future. */
function daysSince(joinedYmd: string, todayYmd: string): number {
  const joined = Date.parse(`${joinedYmd}T00:00:00Z`);
  const today = Date.parse(`${todayYmd}T00:00:00Z`);
  if (Number.isNaN(joined) || Number.isNaN(today)) return NaN;
  return Math.floor((today - joined) / 86_400_000);
}

type DripPlan = { email: string; firstName: string; emailIndex: number; pageId: string };

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

    // Build the list of due-but-unsent emails across all members.
    const plans: DripPlan[] = [];
    let noJoinDate = 0;
    for (const m of members) {
      if (!m.joined) {
        noJoinDate += 1;
        continue;
      }
      const elapsed = daysSince(m.joined, todayYmd);
      if (Number.isNaN(elapsed)) continue;
      for (const step of DRIP_SEQUENCE) {
        const alreadySent = m.sent[step.emailIndex - 1];
        if (!alreadySent && elapsed >= step.daysAfterJoined) {
          plans.push({
            email: m.email,
            firstName: m.firstName,
            emailIndex: step.emailIndex,
            pageId: m.pageId,
          });
        }
      }
    }

    if (dryRun) {
      return Response.json({
        ok: true,
        dryRun: true,
        durationMs: Date.now() - startedAt,
        todayYmd,
        totalMembers: members.length,
        noJoinDate,
        dueCount: plans.length,
        due: plans.map((p) => ({ email: p.email, emailIndex: p.emailIndex })),
      });
    }

    if (!resendKey || !fromEmail) {
      return Response.json(
        { ok: false, error: "RESEND_API_KEY or LEAD_FROM_EMAIL not set", dueCount: plans.length },
        { status: 500 },
      );
    }

    const sent: Array<{ email: string; emailIndex: number }> = [];
    const errors: Array<{ email: string; emailIndex: number; reason: string }> = [];

    // Sequential to stay well within Resend + Notion rate limits; drip volume is
    // low (a handful of new members per day) so throughput is not a concern.
    for (const p of plans) {
      try {
        await sendDripEmail(p, resendKey, fromEmail);
        // Only flag as sent once the email actually went out, so a send failure
        // leaves the flag false and the email is retried on the next run.
        await setOnboardingFlag(p.pageId, p.emailIndex);
        sent.push({ email: p.email, emailIndex: p.emailIndex });
      } catch (err) {
        errors.push({ email: p.email, emailIndex: p.emailIndex, reason: (err as Error).message });
      }
    }

    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      todayYmd,
      totalMembers: members.length,
      noJoinDate,
      dueCount: plans.length,
      sentCount: sent.length,
      sent,
      errors,
    });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}

async function sendDripEmail(
  plan: Pick<DripPlan, "email" | "firstName" | "emailIndex">,
  apiKey: string,
  from: string,
): Promise<void> {
  const { subject, html, text } = buildDripEmailContent(plan.firstName, plan.emailIndex);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      reply_to: "hallum@gainstrengththerapy.com",
      to: [plan.email],
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend drip email ${plan.emailIndex}: ${res.status} ${body.slice(0, 200)}`);
  }
}
