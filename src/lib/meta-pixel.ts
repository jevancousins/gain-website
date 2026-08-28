/**
 * Meta (Facebook) pixel: a thin, fail-safe wrapper around fbq.
 *
 * The pixel is OFF unless NEXT_PUBLIC_META_PIXEL_ID is set, so this ships inert
 * and switches on the moment the real dataset id is put in Vercel's env. That
 * matters here: the id must be the EXISTING dataset from Events Manager, never a
 * newly created one, or Gain silently loses its event history, its Website
 * Visitors custom audience and every lookalike built from it.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/**
 * Customer fields Meta matches a conversion back to an account with, in Meta's
 * own parameter names. Pass PLAIN values: fbq normalises and SHA-256s them in
 * the browser, and the raw values never leave it.
 */
export type MetaUserData = {
  /** Email address. */
  em?: string;
  /** Phone number, digits only including country code. */
  ph?: string;
  /** First name. */
  fn?: string;
};

/**
 * UK numbers are typed as "07810 620097" far more often than as +447810620097,
 * and Meta wants country-coded digits with no punctuation and no leading plus.
 * A national 0-prefixed number is therefore rewritten to 44, which is safe here
 * because Gain is a single-site gym in Eastbourne and its enquiries are UK ones.
 * Anything already carrying a country code is left alone.
 */
function normalisePhoneForMeta(raw: string): string | undefined {
  const digits = raw.replace(/[^0-9+]/g, "");
  const plain = digits.replace(/^\+/, "");
  if (plain.length < 7) return undefined;
  if (digits.startsWith("+")) return plain;
  if (plain.startsWith("0")) return `44${plain.slice(1)}`;
  return plain;
}

/**
 * Tell Meta who the conversion belongs to, immediately before reporting it.
 *
 * WHY THIS EXISTS. Without it the pixel offers Meta only a cookie and an IP, and
 * Events Manager scored the dataset 6.1/10 on event match quality on 26 Aug 2026.
 * That is the one measure on which the new site risked being WORSE than the Wix
 * site it replaced, because Wix offers automatic advanced matching and the
 * enquiry form here already collects exactly the fields Meta matches on.
 *
 * Re-calling fbq("init") with user data is Meta's documented way to attach it;
 * it updates the existing pixel rather than creating a second one, and the values
 * are hashed client-side before any request is made.
 *
 * Only non-empty fields are sent. An empty string is not "no data" to Meta, it is
 * a value that hashes to a real digest and matches nobody, which would drag the
 * score DOWN rather than leave it unchanged.
 */
export function metaIdentify(user: MetaUserData) {
  if (typeof window === "undefined") return;
  if (!META_PIXEL_ID) return;
  const data: Record<string, string> = {};
  const em = user.em?.trim().toLowerCase();
  const fn = user.fn?.trim().toLowerCase();
  const ph = user.ph ? normalisePhoneForMeta(user.ph) : undefined;
  if (em) data.em = em;
  if (fn) data.fn = fn;
  if (ph) data.ph = ph;
  if (Object.keys(data).length === 0) return;
  try {
    window.fbq?.("init", META_PIXEL_ID, data);
  } catch {
    // matching is best-effort; a failure here must never cost the conversion
  }
}

type FbqParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

/**
 * Fire a standard Meta event. Client-only and best-effort: it no-ops when the
 * pixel is not configured or the script has not loaded (ad blockers, offline),
 * and never throws, so a tracking failure can never break the UI.
 *
 * Pass `eventID` for anything the server also reports through the Conversions
 * API. It is Meta's deduplication key: the same conversion arriving twice with
 * one id is counted once, which is what lets both paths run without either
 * inflating the numbers. Send an event with no id from both sides and it counts
 * twice; send it from one side only and it is lost whenever that side fails.
 */
export function metaTrack(
  event: string,
  params?: FbqParams,
  options?: { eventID?: string },
) {
  if (typeof window === "undefined") return;
  if (!META_PIXEL_ID) return;
  try {
    if (options?.eventID) {
      window.fbq?.("track", event, params, { eventID: options.eventID });
    } else {
      window.fbq?.("track", event, params);
    }
  } catch {
    // tracking is best-effort; swallow any error
  }
}
