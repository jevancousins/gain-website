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
 */
export function metaTrack(event: string, params?: FbqParams) {
  if (typeof window === "undefined") return;
  if (!META_PIXEL_ID) return;
  try {
    window.fbq?.("track", event, params);
  } catch {
    // tracking is best-effort; swallow any error
  }
}
