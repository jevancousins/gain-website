import type { Metadata } from "next";
import Image from "next/image";
import { PhoneCall } from "lucide-react";
import { Section, H2, CTAButton, ScrollLink, Lede, Testimonial } from "@/components/ui";
import { Folio, Rule } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { IMAGES, REVIEWS, SITE } from "@/lib/utils";
import { ServiceSchema, FaqSchema } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "6-Week Strength Programme | Gain Strength Therapy, Eastbourne",
  description:
    "Small-group strength training for adults in Eastbourne. Post-rehab, beginners, over-40s. Max six per session, MSc-qualified coaching. Request your free consultation.",
  alternates: { canonical: `${SITE.url}/6-week` },
};

const FEARS = [
  {
    headline: "\"I haven’t exercised in years.\"",
    body: "Most of our members hadn’t either. We start with the basics and build from there. No fitness test on day one.",
  },
  {
    headline: "\"I’m not sure my body can handle it.\"",
    body: "We work with post-surgical recovery, chronic pain, osteoarthritis, osteoporosis, type 2 diabetes, and long COVID. Your history shapes your programme, not the other way around.",
  },
  {
    headline: "\"I don’t want a big gym.\"",
    body: "Six people maximum per session, in a calm private studio rather than a crowded gym floor. No queues for equipment, no rushing, and a coach with you every step.",
  },
  {
    headline: "\"I’ve been discharged from physio but I’m not strong yet.\"",
    body: "We pick up where your physio left off. Every programme starts with what they said you can and can’t do.",
  },
];

const TESTIMONIALS = [
  REVIEWS.find((r) => r.author === "Alistair W.")!,
  REVIEWS.find((r) => r.author === "Alan B.")!,
  REVIEWS.find((r) => r.author === "L T")!,
  REVIEWS.find((r) => r.author === "Felicity W.")!,
];

const FAQS = [
  {
    q: "I haven’t trained in 20 years. Will I keep up?",
    a: "Yes. Everyone follows the same programme structure but at their own weight and speed. Most of our members started exactly where you are. There is nothing to keep up with.",
  },
  {
    q: "What if I have an injury or a health condition?",
    a: "We work with members managing chronic pain, post-surgical recovery, osteoarthritis, osteoporosis, type 2 diabetes, and long COVID. Tell us in your consultation and we will be honest about whether we are the right fit.",
  },
  {
    q: "What happens in your consultation?",
    a: "No more than 30 minutes, by phone or in person if you'd like to see the gym first. We ask about your goals, any injury or medical history, and what you have tried before. We explain how the programme works and answer your questions. If we are not the right fit, we will tell you and point you somewhere better.",
  },
  {
    q: "How much does it cost?",
    a: "We cover pricing, frequency, and payment options in your consultation. No hidden fees. You can pay in full or in instalments.",
  },
  {
    q: "What happens after the six weeks?",
    a: "Monthly rolling membership if you want it. No auto-enrolment, no contract. We talk options at your final session.",
  },
];

export default function GeneralLandingPage() {
  return (
    <>
      <ServiceSchema
        name="6-Week Strength Programme"
        description="A six-week small-group strength training programme for adults in Eastbourne, including beginners, over-40s, and people progressing from physio. Maximum six per session, led by an MSc-qualified coach."
        url={`${SITE.url}/6-week`}
      />
      <FaqSchema faqs={FAQS} />

      {/* ——— Slim header (logo left, CTA right) ——— */}
      <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur-sm border-b border-ink-line">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 h-16 md:h-[72px] flex items-center justify-between gap-4">
          <span className="flex items-center shrink-0" aria-label="Gain Strength Therapy">
            <span className="relative h-9 w-[5.6rem] md:h-10 md:w-[6.25rem]">
              <Image
                src={IMAGES.logo}
                alt="Gain Strength Therapy"
                fill
                priority
                sizes="(min-width: 768px) 100px, 90px"
                className="object-contain"
              />
            </span>
          </span>
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href={`tel:${SITE.phoneHref}`}
              className="hidden sm:inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.22em] text-paper/80 hover:text-flame transition-colors"
            >
              <PhoneCall size={14} /> {SITE.phone}
            </a>
            <ScrollLink
              href="#book"
              className="inline-flex items-center rounded-sm bg-flame text-ink px-4 sm:px-5 py-2.5 text-[0.72rem] sm:text-[0.78rem] font-bold uppercase tracking-[0.18em] hover:bg-flame-deep transition-colors"
            >
              Get Started
            </ScrollLink>
          </div>
        </div>
      </header>

      {/* ——— HERO ——— */}
      <section className="relative bg-ink overflow-hidden">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-16">
          {/* Background image — spans the folio strip and the copy (grid rows
              1–2), so it sits behind the folio like the home page hero video.
              On mobile the form is row 3, so the image stops above it; on
              desktop the form's opaque card sits over it. Bleeds to the
              container edges; the section's overflow-hidden clips it. */}
          <div
            className="relative z-0 row-start-1 row-end-3 col-span-full -mx-6 md:-mx-10 lg:-mx-16"
            aria-hidden="true"
          >
            <Image
              src={IMAGES.gymInteriorWide}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/70 to-ink" />
          </div>

          {/* Folio strip — grid row 1 */}
          <div className="relative z-10 row-start-1 col-span-full -mx-6 md:-mx-10 lg:-mx-16 border-b border-paper/10">
            <div className="px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
              <Folio number="01" label="6-Week Programme" />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
                Eastbourne &middot; Max 6 per session
              </span>
            </div>
          </div>

          {/* Copy + CTA — grid row 2, left columns */}
          <div className="relative z-10 row-start-2 col-span-full lg:col-span-7 lg:col-start-1 pt-14 md:pt-20 pb-14 md:pb-20">
            <h1 className="display mt-6 text-[clamp(2.5rem,7.5vw,6.25rem)] text-paper leading-[1.02]">
              Not sure where to start with
              <span className="display-italic font-medium text-flame">
                {" "}strength training?
              </span>
            </h1>
            <Lede className="mt-8">
              Most people in their 40s, 50s and 60s know they should be
              training but feel lost in a gym. Our 6-week programme gives you
              a coach who builds each session around your body, your history
              and your goals.
            </Lede>

            <div className="mt-10">
              {/* Hero CTA scrolls to the adjacent hero form, not the final one */}
              <CTAButton href="#enquire" variant="primary">
                Get started
              </CTAButton>
            </div>
          </div>

          {/* Inline image — before the form on mobile (grid row 3); on desktop
              it sits full-width below the copy/form row, taking the place of
              the old separate image band. */}
          <div className="row-start-3 col-span-full pb-12 lg:pb-24">
            <Photo
              src={IMAGES.gainSignGroup}
              alt="Hallum and four members smiling in front of the GAIN sign"
              aspect="aspect-[16/9] md:aspect-[21/9]"
              tone="warm"
              sizes="100vw"
            />
          </div>

          {/* Enquiry form — beside the copy on desktop (row 2), beneath the
              image on mobile (row 4, clear of the background image) */}
          <aside
            className="relative z-10 col-span-full lg:col-span-5 lg:col-start-8 row-start-4 lg:row-start-2 pb-14 md:pb-20 lg:pt-20"
            id="enquire"
          >
            <div className="lg:sticky lg:top-24">
              <LeadForm
                source="6-week-general"
                eyebrow="Step 01 &middot; No commitment"
                title="Request your free consultation."
                body="Leave your details and we'll email you a link to book your consultation, by phone or in person. No more than 30 minutes, no pressure. Prefer a callback? We'll ring you within two working days."
                submitLabel="Request your free consultation"
              />
            </div>
          </aside>
        </div>
      </section>

      {/* ——— Fears / "Sound familiar?" ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Folio number="02" label="Sound familiar?" />
            <H2 className="mt-6">
              Built for people most gyms
              <span className="display-italic font-medium text-flame">
                {" "}were not built for.
              </span>
            </H2>
            <div className="mt-8">
              <Photo
                src={IMAGES.gymStretching}
                alt="A coach guiding an older member through a warm-up stretch"
                aspect="aspect-[4/3]"
                tone="warm"
                sizes="(min-width: 1024px) 38vw, 100vw"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <ul className="space-y-7 text-[1.02rem] text-paper/80 leading-relaxed">
              {FEARS.map((f) => (
                <li key={f.headline} className="flex gap-4">
                  <span className="text-flame mt-1.5 shrink-0">&#9656;</span>
                  <span>
                    <strong className="block text-paper font-semibold">
                      {f.headline}
                    </strong>
                    <span className="mt-1.5 block text-paper/75">{f.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <CTAButton href="#book" variant="primary">
                Tell us about you
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Testimonials ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Folio number="03" label="What members say" />
            <H2 className="mt-6">
              Real members,
              <span className="display-italic font-medium text-flame">
                {" "}real Eastbourne reviews.
              </span>
            </H2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {TESTIMONIALS.map((r) => (
            <Testimonial key={r.author} quote={r.text} name={r.author} />
          ))}
        </div>

        <div className="mt-10">
          <CTAButton href="#book" variant="primary">
            Request your free consultation
          </CTAButton>
        </div>
      </Section>

      {/* ——— Visual break: inside Gain ——— */}
      <Section tone="flame" containerClass="!py-14 md:!py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Photo src={IMAGES.gymInteriorWide} alt="The Gain gym floor with members training" aspect="aspect-[4/3]" sizes="(min-width: 640px) 45vw, 100vw" />
          <Photo src={IMAGES.gainSignTwoFemaleMembers} alt="Two women smiling in front of the GAIN sign in the gym" aspect="aspect-[4/3]" sizes="(min-width: 640px) 45vw, 100vw" />
        </div>
      </Section>

      {/* ——— The programme ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-10 items-start mb-12 lg:mb-16">
          <div className="lg:col-span-5">
            <Folio number="04" label="The programme" />
            <H2 className="mt-6">
              Six weeks, built in
              <span className="display-italic font-medium text-flame">
                {" "}two clear phases.
              </span>
            </H2>
          </div>
          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <p className="text-[1.05rem] text-paper/80 leading-[1.72] max-w-2xl">
              Small-group strength training, never more than six per session,
              with your programme built around your body, your history, and your
              goals. Here is how the six weeks unfold, from your first
              consultation through to your final re-test.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {/* Connector line linking the stages (desktop) */}
          <span
            aria-hidden
            className="hidden md:block absolute left-[12.5%] right-[12.5%] top-7 h-0.5 bg-flame/30"
          />
          {[
            { tag: "Before you start", t: "Free consultation", d: "A 30-minute call or visit. We learn your goals, any injury or medical history, and what you want from the six weeks." },
            { tag: "Week 1", t: "Induction & baseline", d: "A 20 to 30 minute one-to-one: movement assessment, set your baseline lift, plus your nutrition-basics and at-home mobility guides." },
            { tag: "Weeks 1–3", t: "Foundation", d: "Learn the core lifts and groove the movement patterns. Loads stay steady while you build technique and the habit." },
            { tag: "Weeks 4–6", t: "Progressive strength", d: "Load climbs week on week, technique sharpens under weight, and we re-test your tracked lift to show the change." },
          ].map((s, i) => (
            <li key={s.t} className="relative flex items-start gap-5 md:block md:text-center">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-flame bg-ink-soft md:mx-auto">
                <span className="display-tight text-lg text-flame tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <div className="md:mt-6">
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-flame">{s.tag}</span>
                <h3 className="display-tight text-xl text-paper mt-1.5">{s.t}</h3>
                <p className="mt-2 text-paper/65 text-base leading-relaxed md:mx-auto md:max-w-[15rem]">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-12 max-w-2xl border-l-2 border-flame/60 pl-4 text-[1.0625rem] text-paper/70 leading-relaxed">
          No contract afterwards. If you want to keep training, ongoing
          membership is available on a rolling monthly basis.
        </p>
      </Section>

      {/* ——— FAQs ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Folio number="05" label="Questions we hear" />
            <H2 className="mt-6">Before you book.</H2>
          </div>
          <div className="md:col-span-8">
            <Rule tone="paper" />
            <div className="divide-y divide-ink-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                    <span className="display-tight text-xl md:text-2xl text-paper leading-[1.2]">
                      {f.q}
                    </span>
                    <span className="display text-flame text-2xl transition-transform group-open:rotate-45 shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-paper/70 leading-[1.7] max-w-2xl">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
            <Rule tone="paper" />
            <div className="mt-8">
              <CTAButton href="#book" variant="primary">
                Request your free consultation
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Final CTA with form ——— */}
      <section className="relative bg-flame text-ink" id="book">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-20 md:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <h2 className="display mt-6 text-[clamp(2.25rem,6vw,5.25rem)] text-ink leading-[1.02]">
              Ready to feel stronger?
            </h2>
            <p className="lede mt-8 text-lg md:text-xl text-ink/85 max-w-md">
              No more than 30 minutes, by phone or in person. No pressure. If
              we are not the right fit, we will tell you and point you
              somewhere better.
            </p>
          </div>
          <div className="lg:col-span-6">
            <LeadForm
              source="6-week-general"
              eyebrow="Step 01 &middot; No commitment"
              title="Request your free consultation."
              body="Leave your details and we'll email you a link to book your consultation, by phone or in person. No more than 30 minutes, no pressure. Prefer a callback? We'll ring you within two working days."
              submitLabel="Request your free consultation"
            />
          </div>
        </div>
      </section>

      {/* Footer mirrors the main site, minus links that navigate away */}
      <SiteFooter landing />
    </>
  );
}
