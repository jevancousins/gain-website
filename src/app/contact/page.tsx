import type { Metadata } from "next";
import { Section, H2, Pill, Lede } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { CalEmbed } from "@/components/cal-embed";
import { Folio, Kicker, Rule } from "@/components/editorial";
import { MapPin, Phone, Clock, CalendarCheck } from "lucide-react";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free consultation with Gain Strength Therapy in Eastbourne. Pick a time for a phone call or in-person visit, or leave your details and we'll call you back.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Contact" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              Free · No obligation
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-10">
          <div className="max-w-3xl">
            <Kicker>Book a consultation</Kicker>
            <h1 className="display mt-6 text-[clamp(2.75rem,7vw,6rem)] text-paper">
              Pick a time.
              <span className="block display-italic font-medium text-flame"> We&rsquo;ll take it from there.</span>
            </h1>
            <Lede className="mt-8">
              Every new member starts with a free, no-pressure consultation.
              Choose a phone call or come in and see the studio in person.
            </Lede>
          </div>
        </div>
      </section>

      {/* ——— Booking embed (primary path) ——— */}
      <Section tone="ink" id="book">
        <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
          <div>
            <Kicker>
              <CalendarCheck size={11} className="inline mr-1 align-middle" /> Choose a slot
            </Kicker>
            <H2 className="mt-4">Book your free consultation.</H2>
            <p className="mt-3 text-paper/65 text-sm max-w-xl leading-relaxed">
              Pick between a phone call or an in-person visit at the studio.
              30 minutes, completely free, no obligation.
            </p>
          </div>
          <Pill tone="flame">Free · 30 min</Pill>
        </div>
        <CalEmbed link="gainstrengththerapy/consultation" />
      </Section>

      {/* ——— Callback form (alternative path) ——— */}
      <Section tone="ink-soft" id="callback">
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
                Near Eastbourne town centre: about a 15-minute walk
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
                <span>If we&rsquo;re coaching, leave a message or fill in the form: we&rsquo;ll come back within one working day.</span>
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
              <div>
                <H2>Prefer we call you?</H2>
                <p className="mt-2 text-paper/60 text-sm">
                  Leave your details and we&rsquo;ll get back to you within one working day.
                </p>
              </div>
              <Pill tone="paper">Reply &lt; 1 working day</Pill>
            </div>
            <LeadForm source="contact-page" />
          </div>
        </div>
      </Section>
    </>
  );
}
