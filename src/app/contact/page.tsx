import type { Metadata } from "next";
import { Section, Lede } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { Folio, Kicker, Rule } from "@/components/editorial";
import { MapPin, Phone, Clock } from "lucide-react";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Gain Strength Therapy in Eastbourne. Fill in the form to book a free consultation by phone or in person, or call us directly.",
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

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <Kicker>Say hello</Kicker>
            <h1 className="display mt-6 text-[clamp(2.75rem,7vw,6rem)] text-paper">
              Leave your details.
              <span className="block display-italic font-medium text-flame"> Pick a time that suits.</span>
            </h1>
            <Lede className="mt-8">
              Fill in the form and we&rsquo;ll email you a link to book your
              free consultation, by phone, or in person if you&rsquo;d like to
              see the gym first. It takes no more than 30 minutes. Prefer a
              callback? We will ring you within two working days.
            </Lede>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-10">
              <LeadForm source="contact-page" />
            </div>
          </aside>
        </div>
      </section>

      <Section tone="ink-soft">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-ink-line bg-ink p-7">
            <Kicker>
              <MapPin size={11} className="inline mr-1 align-middle" /> Visit us
            </Kicker>
            <address className="not-italic mt-5 text-paper text-base leading-relaxed">
              Gain Strength Therapy<br />
              {SITE.address.line1}<br />
              {SITE.address.city}, {SITE.address.postcode}
            </address>
            <p className="mt-4 text-base text-paper/60 leading-relaxed">
              Near Eastbourne town centre: about a 15-minute walk from the
              railway station. On-street parking only.
            </p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${SITE.name}, ${SITE.address.line1}, ${SITE.address.city} ${SITE.address.postcode}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm font-bold uppercase tracking-[0.22em] link-editorial text-paper"
            >
              Open in Google Maps →
            </a>
          </div>

          <div className="border border-ink-line bg-ink p-7">
            <Kicker>
              <Phone size={11} className="inline mr-1 align-middle" /> Call us
            </Kicker>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="mt-4 block display text-3xl md:text-4xl text-paper hover:text-flame transition-colors tabular-nums"
            >
              {SITE.phone}
            </a>
            <p className="mt-3 text-base text-paper/65 leading-relaxed">
              If we&rsquo;re coaching, leave a message or fill in the form and we will get back to you within two working days.
            </p>
          </div>

          <div className="border border-ink-line bg-ink p-7">
            <Kicker>
              <Clock size={11} className="inline mr-1 align-middle" /> Opening hours
            </Kicker>
            <Rule tone="paper" className="mt-5" />
            <ul className="divide-y divide-ink-line">
              {SITE.hours.map((h) => (
                <li key={h.day} className="flex justify-between py-3 text-base">
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
      </Section>
    </>
  );
}
