import { createHash } from "node:crypto";

/**
 * Meta Conversions API: report the Lead from the SERVER, not the browser.
 *
 * WHY THIS EXISTS. The browser pixel is the only thing that has ever told Meta a
 * lead happened, and on 28 Aug 2026 Events Manager had received exactly one
 * event type for this dataset, PageView, with no Lead on record at all. The
 * browser call is provably made on a real submission, so the loss is somewhere
 * between fbq and Meta: an ad blocker, a tracking-prevention default, a content
 * blocker on a phone, or a beacon that never leaves an unloading page. None of
 * those are fixable from here, and every one of them is invisible: the site
 * looks healthy, the enquiry lands in Notion, and the ad account learns nothing.
 *
 * A server-side event has none of those failure modes. It leaves Vercel, so no
 * client-side blocking can touch it, and it carries hashed contact details,
 * which is also the fix for the dataset's 6.1/10 event match quality.
 *
 * BOTH events are kept, deliberately. They share an event_id, which is Meta's
 * documented deduplication key: whichever arrives first is counted and the other
 * is discarded, so the conversion is never double-counted and never lost when
 * one path fails. Removing the browser event would throw away the fbp/fbc click
 * attribution it carries; removing this one puts us back where we started.
 *
 * Inert until META_CAPI_TOKEN is set, exactly like the pixel is inert without an
 * id, so this ships and deploys safely before the token exists.
 */

const GRAPH_API = "https://graph.facebook.com/v21.0";

/**
 * The dataset to report to. This is the SAME id the browser pixel uses: the
 * pixel and the Conversions API are two feeds into one dataset, and sending the
 * server events to a different id would split the history, break deduplication
 * and orphan every audience built from it.
 */
function datasetId() {
  return process.env.META_DATASET_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
}

export type MetaCapiLead = {
  /** Shared with the browser's fbq eventID. The deduplication key. */
  eventId: string;
  email: string;
  /** Whatever the enquirer typed; normalised here. */
  phone: string;
  firstName: string;
  /** ISO timestamp the lead was received. */
  createdAt: string;
  /** The form's source slug, e.g. "6-week-general". */
  source: string;
  /** The page the enquiry was sent from, for attribution. */
  sourceUrl: string;
  clientIp: string;
  userAgent: string;
  /** Meta's browser cookies, when the visitor had them. */
  fbp: string;
  fbc: string;
};

/** Meta wants lower-case, trimmed, punctuation-free values, then SHA-256. */
function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * UK numbers arrive as "07810 620097" far more often than as +447810620097, and
 * Meta matches on country-coded digits with no punctuation and no leading plus.
 * Same rule as the browser side in meta-pixel.ts, and it has to stay the same
 * rule: a number normalised two different ways hashes to two different people.
 */
function normalisePhone(raw: string): string | undefined {
  const digits = raw.replace(/[^0-9+]/g, "");
  const plain = digits.replace(/^\+/, "");
  if (plain.length < 7) return undefined;
  if (digits.startsWith("+")) return plain;
  if (plain.startsWith("0")) return `44${plain.slice(1)}`;
  return plain;
}

/**
 * An empty string is not "no data" to Meta: it hashes to a real digest that
 * matches nobody and drags match quality DOWN. Only send fields we have.
 */
function userData(lead: MetaCapiLead) {
  const data: Record<string, string[] | string> = {};
  const em = lead.email.trim().toLowerCase();
  const fn = lead.firstName.trim().toLowerCase();
  const ph = normalisePhone(lead.phone);
  if (em) data.em = [hash(em)];
  if (fn) data.fn = [hash(fn)];
  if (ph) data.ph = [hash(ph)];
  // These two are NOT hashed: Meta reads them raw and they are what ties the
  // conversion back to the click that paid for it.
  if (lead.clientIp) data.client_ip_address = lead.clientIp;
  if (lead.userAgent) data.client_user_agent = lead.userAgent;
  if (lead.fbp) data.fbp = lead.fbp;
  if (lead.fbc) data.fbc = lead.fbc;
  return data;
}

/** True when a token is configured, i.e. when there is any point trying. */
export function metaCapiConfigured() {
  return Boolean(process.env.META_CAPI_TOKEN && datasetId());
}

/**
 * Send one Lead. Throws on a non-2xx so the caller logs it; the caller must
 * never let that failure reach the enquirer, because a lost analytics event is
 * not a lost lead.
 */
export async function sendMetaCapiLead(lead: MetaCapiLead): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  const dataset = datasetId();
  if (!token || !dataset) return;

  const event: Record<string, unknown> = {
    event_name: "Lead",
    // Seconds, not milliseconds, and Meta rejects anything over 7 days old.
    event_time: Math.floor(new Date(lead.createdAt).getTime() / 1000),
    event_id: lead.eventId,
    action_source: "website",
    user_data: userData(lead),
    custom_data: { content_name: lead.source },
  };
  if (lead.sourceUrl) event.event_source_url = lead.sourceUrl;

  const payload: Record<string, unknown> = { data: [event] };
  // Set only while verifying in Events Manager > Test events. Events carrying a
  // test code are shown there and excluded from reporting, so this must never be
  // left set in production or real conversions stop counting.
  const testCode = process.env.META_CAPI_TEST_CODE;
  if (testCode) payload.test_event_code = testCode;

  const res = await fetch(`${GRAPH_API}/${dataset}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Meta CAPI ${res.status}: ${body}`);
  }
}
