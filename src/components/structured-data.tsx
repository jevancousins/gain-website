import { SITE } from "@/lib/utils";

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HealthClub", "SportsActivityLocation"],
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}/opengraph-image`,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postcode,
      addressCountry: "GB",
    },
    // Include every day — closed days as equal 00:00 entries — so the schema
    // is cleanly complete rather than selectively omitting Sunday.
    openingHoursSpecification: SITE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: h.open ?? "00:00",
      closes: h.close ?? "00:00",
    })),
    telephone: SITE.phone,
    sameAs: [SITE.social.instagram, SITE.social.facebook],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
