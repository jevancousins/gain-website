import { GOOGLE_RATING as FALLBACK } from "./utils";

const PLACE_ID = "ChIJWfqQ101z30cRXriLigAKSNY";

export type GoogleRating = {
  stars: number;
  count: number;
  href: string;
};

export async function getGoogleRating(): Promise<GoogleRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return FALLBACK;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount",
        },
        cache: "force-cache",
        next: { revalidate: 86400, tags: ["google-rating"] },
      },
    );

    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as {
      rating?: number;
      userRatingCount?: number;
    };

    return {
      stars: data.rating ?? FALLBACK.stars,
      count: data.userRatingCount ?? FALLBACK.count,
      href: FALLBACK.href,
    };
  } catch {
    return FALLBACK;
  }
}
