import { SITE, GOOGLE_RATING, IMAGES } from "@/lib/utils";

/**
 * Stable @id for the business node so other schema (Service, Person)
 * can reference the same entity rather than re-describing it.
 */
const BUSINESS_ID = `${SITE.url}/#business`;

/**
 * Renders a JSON-LD <script>. Following the Next.js guidance, we escape
 * "<" to its unicode form to avoid any XSS via stringified content.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function LocalBusinessSchema({
  rating = GOOGLE_RATING,
}: {
  /** Live Google rating; falls back to the static value in SITE config. */
  rating?: { stars: number; count: number };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HealthClub", "SportsActivityLocation"],
    "@id": BUSINESS_ID,
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}/opengraph-image`,
    logo: `${SITE.url}${IMAGES.logo}`,
    description: SITE.description,
    slogan: SITE.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postcode,
      addressCountry: "GB",
    },
    areaServed: [
      { "@type": "City", name: "Eastbourne" },
      { "@type": "AdministrativeArea", name: "East Sussex" },
    ],
    // Include every day — closed days as equal 00:00 entries — so the schema
    // is cleanly complete rather than selectively omitting Sunday.
    openingHoursSpecification: SITE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: h.open ?? "00:00",
      closes: h.close ?? "00:00",
    })),
    telephone: SITE.phone,
    founder: { "@type": "Person", name: "Hallum Cousins" },
    knowsAbout: [
      "Strength training",
      "Post-rehabilitation exercise",
      "Strength training for older adults",
      "Exercise for chronic conditions",
      "Small-group personal training",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating.stars,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.googleReviews,
    ],
  };

  return <JsonLd data={schema} />;
}

/**
 * FAQPage markup — the single highest-leverage schema for AI answer
 * engines, which match conversational queries directly against Q&A pairs.
 */
export function FaqSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return <JsonLd data={schema} />;
}

/** Service offering, linked back to the business node. */
export function ServiceSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: "Strength and conditioning coaching",
    provider: { "@id": BUSINESS_ID, name: SITE.name },
    areaServed: { "@type": "City", name: "Eastbourne" },
    url,
  };

  return <JsonLd data={schema} />;
}

/**
 * Person markup for the founder — an authority signal AI engines weigh
 * heavily for expert-led, health-adjacent businesses.
 */
export function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Hallum Cousins",
    jobTitle: "Founder & Head Coach",
    worksFor: { "@id": BUSINESS_ID, name: SITE.name },
    url: `${SITE.url}/about`,
    image: `${SITE.url}${IMAGES.hallum}`,
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "University of Brighton" },
      { "@type": "CollegeOrUniversity", name: "University of Bath" },
    ],
    knowsAbout: [
      "Sport physiology",
      "Strength training",
      "Post-rehabilitation progression",
      "Injury prevention",
      "Strength for adults over 40",
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: "MSc Sport Physiology",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: "BSc Sports Science",
      },
    ],
  };

  return <JsonLd data={schema} />;
}
