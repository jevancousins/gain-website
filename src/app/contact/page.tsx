import type { Metadata } from "next";
import { Section, H2, Pill, Lede } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { Folio, Kicker, Rule } from "@/components/editorial";
import { MapPin, Phone, Clock } from "lucide-react";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Gain Strength Therapy in Eastbourne. Leave your details and we'll call you back — or pick up the phone.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Contact" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              We reply within one working day
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-10">
          <div className="max-w-3xl">
            <Kicker>Say hello</Kicker>
            <h1 className="display mt-6 text-[clamp(2.75rem,7vw,6rem)] text-paper">
              Leave your details.
              <span className="block display-italic font-medium text-flame"> We&rsquo;ll call you back.</span>
            </h1>
            <Lede className="mt-8">
              Every new member starts with a short, no-pressure phone call. No
              20-minute speed-date, no online calendar to wrestle with &mdash;
              just an honest conversation.
            </Lede>
          </div>
        </div>
      </section>

      <Section tone="ink">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-ink-line bg-ink-soft p-7">
              <Kicker>Visit us</Kicker>
              <address className="not-italic mt-5 text-paper text-lg leading-relaxed flex gap-3">
                <MapPin size={18} className="text-flame mt-1 shrink-0" />
                <span>
                  Gain Strength Therapy<br />
                  {SITE.address.line1}<br />
                  {SITE.address.city}, {SITE.address.postcode}
                </span>
              </address>
              <p className="mt-4 text-sm text-paper/60 leading-relaxed">
                Near Eastbourne town centre &mdash; about a 15-minute walk
                from the railway station. On-street parking only, so arrive
                a few minutes early.
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${SITE.address.line1}, ${SITE.address.city} ${SITE.address.postcode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-sm font-bold uppercase tracking-[0.22em] link-editorial text-paper"
              >
                Open in Google Maps →
              </a>
            </div>

            <div className="border border-ink-line bg-ink-soft p-7">
              <Kicker>Call us</Kicker>
              <a
                href={`tel:${SITE.phoneHref}`}
                className="mt-4 block display text-3xl md:text-4xl text-paper hover:text-flame transition-colors tabular-nums"
              >
                {SITE.phone}
              </a>
              <p className="mt-3 text-sm text-paper/65 leading-relaxed flex gap-2 items-start">
                <Phone size={14} className="text-flame mt-0.5 shrink-0" />
                <span>If we&rsquo;re coaching, leave a message or fill in the form &mdash; we&rsquo;ll come back within one working day.</span>
              </p>
            </div>

            <div className="border border-ink-line bg-ink-soft p-7">
              <Kicker>
                <Clock size={11} className="inline mr-1 align-middle" /> Opening hours
              </Kicker>
              <Rule tone="paper" className="mt-5" />
              <ul className="divide-y divide-ink-line">
                {SITE.hours.map((h) => (
                  <li key={h.day} className="flex justify-between py-3 text-sm">
                    <span className="text-paper font-semibold">{h.day}</span>
                    <span className={h.open ? "text-paper/70 tabular-nums" : "text-paper/55 italic"}>
                      {h.open ? `${h.open} – ${h.close}` : "Closed"}
                    </span>
                  </li>
                ))}
              </ul>
              <Rule tone="paper" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <H2>Leave your details.</H2>
              <Pill tone="paper">Reply &lt; 1 working day</Pill>
            </div>
            <LeadForm source="contact-page" />
          </div>
        </div>
      </Section>
    </>
  );
}
