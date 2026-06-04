import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  PhoneCall,
  Star,
  ExternalLink,
} from "lucide-react";
import { Section, H2, CTAButton, Lede, Testimonial } from "@/components/ui";
import { Folio, Rule } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { LeadForm } from "@/components/lead-form";
import { IMAGES, REVIEWS, SITE } from "@/lib/utils";
import { getGoogleRating } from "@/lib/google-rating";

export const metadata: Metadata = {
  title: "6-Week Strength Programme | Gain Strength Therapy, Eastbourne",
  description:
    "Small-group strength training for adults in Eastbourne. Post-rehab, beginners, over-40s. Max six per session, MSc-qualified coaching. Book a free consultation call.",
  robots: { index: false, follow: false },
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
    body: "Six people maximum per session. A private studio, not a gym floor. No mirrors, no music, no audience.",
  },
  {
    headline: "\"I’ve been discharged from physio but I’m not strong yet.\"",
    body: "We pick up where your physio left off. Every programme starts with what they said you can and can’t do.",
  },
];

const PILLARS = [
  {
    number: "01",
    title: "Six people, one coach",
    body: "Small enough to coach every rep individually. Same exercises, your weight, your pace.",
  },
  {
    number: "02",
    title: "MSc-qualified coaching",
    body: "Led by Hallum Cousins, MSc Sport Physiology. Specialist focus on post-rehab and life after 40.",
  },
  {
    number: "03",
    title: "Measurable progress",
    body: "We track one key lift from day one and re-test at week six. You see the numbers change.",
  },
  {
    number: "04",
    title: "No contract afterwards",
    body: "The 6-week is the 6-week. Monthly membership available after, but only if it is working for you.",
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
    q: "I haven’t trained in 20 years — will I keep up?",
    a: "Yes. Everyone follows the same programme structure but at their own weight and speed. Most of our members started exactly where you are. There is nothing to keep up with.",
  },
  {
    q: "What if I have an injury or a health condition?",
    a: "We work with members managing chronic pain, post-surgical recovery, osteoarthritis, osteoporosis, type 2 diabetes, and long COVID. Tell us on the consultation call and we will be honest about whether we are the right fit.",
  },
  {
    q: "What happens on the consultation call?",
    a: "A 30-minute phone call. We ask about your goals, any injury or medical history, and what you have tried before. We explain how the programme works and answer your questions. If we are not the right fit, we will tell you and point you somewhere better.",
  },
  {
    q: "How much does it cost?",
    a: "We cover pricing, frequency, and payment options on the consultation call. No hidden fees. You can pay in full or in instalments.",
  },
  {
    q: "What happens after the six weeks?",
    a: "Monthly rolling membership if you want it. No auto-enrolment, no contract. We talk options at your final session.",
  },
];

export default async function GeneralLandingPage() {
  const GOOGLE_RATING = await getGoogleRating();

  return (
    <>
      {/* ——— Slim header (logo + phone, no nav) ——— */}
      <header className="bg-ink border-b border-ink-line">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 h-16 md:h-[72px] flex items-center justify-between gap-6">
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
          <a
            href={`tel:${SITE.phoneHref}`}
            className="hidden sm:inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.22em] text-paper/80 hover:text-flame transition-colors"
          >
            <PhoneCall size={14} /> {SITE.phone}
          </a>
        </div>
      </header>

      {/* ——— HERO ——— */}
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="6-Week Programme" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              Eastbourne &middot; Max 6 per session
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 relative">
            <h1 className="display mt-6 text-[clamp(2.5rem,7.5vw,6.25rem)] text-paper leading-[1.02]">
              Not sure where to start with
              <span className="display-italic font-medium text-flame">
                {" "}strength training?
              </span>
            </h1>
            <Lede className="mt-10">
              You are not alone, and you do not need to figure it out by
              yourself. Most people in their 40s, 50s, and 60s know they should
              be doing something, but walk into a gym and feel completely lost.
              At Gain, your coach builds your programme around your body, your
              history, and your goals from day one.
            </Lede>

            <div className="mt-10">
              <CTAButton href="#enquire" variant="primary">
                Start with a free consultation
              </CTAButton>
            </div>

            <div className="mt-14">
              <Photo
                src={IMAGES.gymGroupSession}
                alt="A small-group strength training session at Gain, Eastbourne"
                aspect="aspect-[16/10]"
                tone="warm"
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority
              />
            </div>
          </div>

          <aside className="lg:col-span-5" id="enquire">
            <div className="lg:sticky lg:top-10">
              <LeadForm
                source="6-week-general"
                eyebrow="Step 01 &middot; No commitment"
                title="Book a free consultation call."
                body="Leave your details and we will ring you within two working days. 30 minutes, no pressure. If we are not the right fit, we will say so."
                submitLabel="Book a free call"
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
              <CTAButton href="#enquire" variant="primary">
                Tell us about you
              </CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Pillars ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-10">
          <div className="md:col-span-7">
            <Folio number="03" label="How Gain works" />
            <H2 className="mt-6">
              The opposite of a
              <span className="display-italic font-medium text-flame">
                {" "}big-box gym.
              </span>
            </H2>
          </div>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-line">
          {PILLARS.map((p) => (
            <div key={p.number} className="py-10 px-2 md:px-8 md:first:pl-0 md:last:pr-0">
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame tabular-nums">
                / {p.number}
              </span>
              <h3 className="mt-5 display-tight text-xl md:text-[1.4rem] text-paper leading-[1.15]">
                {p.title}
              </h3>
              <p className="mt-3 text-paper/70 text-[0.98rem] leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <Rule tone="paper" />
      </Section>

      {/* ——— Why six weeks ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4">
            <Folio number="04" label="Why six weeks" />
            <H2 className="mt-6">
              Long enough to change.
              <span className="display-italic font-medium text-flame">
                {" "}Short enough to commit.
              </span>
            </H2>
          </div>
          <div className="lg:col-span-8 space-y-5">
            <Rule tone="paper" />
            <p className="text-[1.05rem] text-paper/80 leading-[1.72] max-w-2xl">
              Six weeks to learn the lifts, build a training habit, and see
              measurable strength gains. We track a key lift from day one and
              re-test at week six, so you can see the numbers change.
            </p>
            <p className="text-[1.05rem] text-paper/80 leading-[1.72] max-w-2xl">
              No contract afterwards. If you want to keep training, monthly
              membership is available on a rolling basis. If not, you stop.
            </p>
          </div>
        </div>
      </Section>

      {/* ——— Testimonials ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Folio number="05" label="What members say" />
            <H2 className="mt-6">
              Real members,
              <span className="display-italic font-medium text-flame">
                {" "}real Eastbourne reviews.
              </span>
            </H2>
          </div>
        </div>

        <a
          href={GOOGLE_RATING.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 flex flex-wrap items-center gap-4 border border-ink-line bg-ink-soft px-5 py-4 hover:border-flame transition-colors"
        >
          <span className="flex items-center gap-1 text-flame" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
            ))}
          </span>
          <span className="text-sm font-semibold text-paper tabular-nums">
            {GOOGLE_RATING.stars.toFixed(1)} on Google
          </span>
          <span className="h-3 w-px bg-paper/20" aria-hidden />
          <span className="text-sm text-paper/70 tabular-nums">
            {GOOGLE_RATING.count} reviews
          </span>
          <span className="ml-auto inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-flame group-hover:text-paper transition-colors">
            Read on Google <ExternalLink size={13} />
          </span>
        </a>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {TESTIMONIALS.map((r) => (
            <Testimonial key={r.author} quote={r.text} name={r.author} />
          ))}
        </div>

        <div className="mt-10">
          <CTAButton href="#enquire" variant="primary">
            Book a free call
          </CTAButton>
        </div>
      </Section>

      {/* ——— FAQs ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Folio number="06" label="Questions we hear" />
            <H2 className="mt-6">Before you call.</H2>
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
              <CTAButton href="#enquire" variant="primary">
                Book a free call
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
              A 30-minute call. No pressure. If we are not the right fit,
              we will tell you and point you somewhere better.
            </p>
            <p className="mt-8 text-sm text-ink/75 leading-relaxed max-w-md">
              Prefer to talk now? Call{" "}
              <a
                href={`tel:${SITE.phoneHref}`}
                className="font-semibold underline underline-offset-4 hover:text-paper"
              >
                {SITE.phone}
              </a>
            </p>
          </div>
          <div className="lg:col-span-6">
            <LeadForm
              source="6-week-general"
              eyebrow="Step 01 &middot; No commitment"
              title="Book a free consultation call."
              body="Leave your details and we will ring you within two working days. 30 minutes, no pressure. If we are not the right fit, we will say so."
              submitLabel="Book a free call"
            />
          </div>
        </div>
      </section>

      {/* ——— Slim footer ——— */}
      <footer className="bg-ink-soft border-t border-ink-line text-paper/65">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.22em]">
          <div>
            <p>
              &copy; {new Date().getFullYear()} Gain Strength Therapy &middot; Dursley Rd,
              Eastbourne, BN22 8DJ
            </p>
            <p className="mt-2 normal-case tracking-normal text-[0.6rem] text-paper/40 leading-relaxed">
              Strength training is not a substitute for medical advice. If you have an
              existing condition, please consult your GP before starting a new exercise
              programme.
            </p>
          </div>
          <div className="flex gap-6">
            <a
              href={`tel:${SITE.phoneHref}`}
              className="hover:text-flame transition-colors"
            >
              {SITE.phone}
            </a>
            <Link href="/privacy" className="hover:text-paper transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-paper transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>

      {/* ——— Sticky mobile CTA ——— */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-ink/95 border-t border-ink-line backdrop-blur-sm p-3 lg:hidden">
        <a
          href="#enquire"
          className="block w-full text-center rounded-sm bg-flame text-ink px-5 py-3.5 text-[0.82rem] font-bold uppercase tracking-[0.22em]"
        >
          Book a free call
        </a>
      </div>
    </>
  );
}
