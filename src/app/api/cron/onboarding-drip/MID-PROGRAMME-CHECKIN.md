# Mid-programme check-in (onboarding email 6): the trigger

## What fires it, and when

Email 6 is **not** a step in the Resend "Member onboarding drip" automation. A fixed
delay from the join event cannot know a member's true midpoint, whether they paused,
or which programme they are on. The daily cron (`route.ts`, 07:00 UTC) sends it directly,
timed to the member's **true halfway point measured in active-training days**.

- 6-week programme: fires at **21 active days**. 12-week: **42 active days**.
- "Active days" are accumulated by the cron: **+1 for each day it sees the programme
  active, 0 for a day it is paused**. So the clock stops while a member is on hold and
  the email lands at their genuine midpoint, not a fixed calendar date.

## How the start date is defined

Anchored to the **TeamUp membership**, not the customer's join/record-creation date.
The cron reads each member's live `customer_memberships` from TeamUp every run and
selects their current 6/12-week programme row (`selectProgramme`): a row whose name
classifies as a 6/12-week programme, whose status is `active` or `hold`, and whose
`start_date` has passed. If several, the latest `start_date` wins (handles re-takes and
upgrades). The active-day counter is keyed to that row's membership id, so a new
programme instance resets the count cleanly.

## Why active-day counting, not a calendar/expiry formula

Whether TeamUp extends a fixed-term membership's `expiration_date` across a hold is
**unconfirmed**. Every expiry-derived midpoint is correct only if it does. The active-day
counter never reads expiry for timing, so it is correct under **both** behaviours: it
simply does not advance on paused days. The programmes are forward-looking (no members on
them yet), so the counter starts from day 0 at go-live and is exact with no backfill.

## The checks that keep a send valid (evaluated in order; first failure wins)

1. `SKIP_BEFORE_PROGRAMME_CUTOFF`: programme started before the go-live cutoff.
2. `SKIP_ALREADY_HANDLED`: this membership id is already in the sent or skipped set.
3. `SKIP_ORDERING`: a genuine new member has not had their welcome yet (upgraders, who
   never get emails 1 to 5, pass).
4. `SKIP_PAUSED`: membership is on hold now. Deferred, re-checked daily, sends on resume.
5. `SKIP_EARLY_DEPARTURE`: cancelled/completed, or set to cancel with an end date that
   falls before the member could reach the midpoint. A natural term-end far beyond the
   midpoint does not trip this.
6. `SKIP_NOT_YET`: fewer than the midpoint active days so far.
7. `SKIP_PAST_CEILING`: more than two-thirds through (28 active days for 6-week, 56 for
   12-week). Suppressed rather than sent stale, e.g. after a long cron outage; recorded
   in the skipped set so it is never revisited.

Otherwise: **SEND**. Then append the membership id to `Email 6 Sent Memberships` and tick
`Onboarding Email 6 Sent`. Send carries `Idempotency-Key: email6-<membershipId>`.

## Edge cases handled

- **Pause:** counter stops; email deferred to the true active midpoint (validated by test).
- **Cancels/completes before midpoint:** suppressed by gate 5 / status filter.
- **Upgrade 6 to 12 week or re-take:** dedup and counter are keyed to the membership id,
  so the new instance resets and is eligible again.
- **Family shared email:** joined strictly by TeamUp id, never by email; rows without a
  TeamUp id are skipped and surfaced in dryRun, not email-matched.
- **Sync lag / failed live read:** membership facts read live each run; on a failed read a
  member is skipped for the day (`SKIP_UNRESOLVED_LIVE_READ`) and retried, never mistimed.
- **Cron outage:** counter under-counts, so the email is at worst a few days late, never
  early; a very long outage past the ceiling deliberately suppresses it.

## State (Notion Members DB, auto-created by `ensureOnboardingProperties`)

`Programme Active Days` (number), `Programme Active Days Counted On` (date),
`Programme Anchor Membership ID` (text), `Email 6 Sent Memberships` (text),
`Email 6 Skipped Memberships` (text).

## Verify before it sends

`GET /api/cron/onboarding-drip?key=<CRON_SECRET>&dryRun=true` returns, per programme
member, the resolved programme, the counter before/after, the computed midpoint/ceiling,
and the decision. No writes, no sends.

## Before go-live (manual)

1. Remove **step 6** from the Resend "Member onboarding drip" automation, or programme
   members receive it twice (automation + cron).
2. Set `ONBOARDING_PROGRAMME_START_DATE` to the real programmes' go-live date.
3. Verify against a real 6/12-week membership that pause shows as status `hold` and note
   whether `expiration_date` extends on hold (the dryRun surfaces this telemetry). If it
   does, an expiry-based formula becomes an equivalent stateless option.
