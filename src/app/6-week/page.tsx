import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  PhoneCall,
  ClipboardCheck,
  Users,
  MessageCircle,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Star,
  ExternalLink,
} from "lucide-react";
import { Section, H2, CTAButton, Pill, Lede, Testimonial } from "@/components/ui";
import { Folio, Kicker, Rule, Caption } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { LeadForm } from "@/components/lead-form";
import { IMAGES, REVIEWS, SITE } from "@/lib/utils";
import { getGoogleRating } from "@/lib/google-rating";

export const metadata: Metadata = {
  title: "6-Week Strength Programme | Gain Strength Therapy, Eastbourne",
  description:
    "A 6-week small-group strength programme for adults in Eastbourne. Post-rehab, beginners, over-40s, and anyone rebuilding after illness. Max six per session, expert coaching, no jargon.",
  robots: { index: false, follow: false },
};

const PHASES = [
  {
    label: "Phase 01",
    weeks: "Weeks 1 to 3",
    focus:
      "Foundation. Learn the fundamental movement patterns, set your baseline, build the habit of consistent training. Loads stay deliberately conservative.",
  },
  {
    label: "Phase 02",
    weeks: "Weeks 4 to 6",
    focus:
      "Progressive strength. Increase load and complexity carefully, refine technique under weight, finish with a final assessment in your tracked lift.",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    icon: <PhoneCall size={16} />,
    t: "Free 30-minute consultation call",
    d: "We learn your goals, any injury or medical history, and what you have tried before. We explain how the 6-week works and answer your questions. If we are not the right fit, we will say so honestly.",
  },
  {
    n: "02",
    icon: <ClipboardCheck size={16} />,
    t: "Induction and baseline (week 1)",
    d: "A 20 to 30 minute one-to-one before your first group session. Movement assessment, choose one tracking exercise, set your baseline, walk through your weekly schedule.",
  },
  {
    n: "03",
    icon: <Users size={16} />,
    t: "Group sessions, individually coached",
    d: "Same exercises, different weights. You train at your level, alongside up to five other members, with a coach watching every rep.",
  },
  {
    n: "04",
    icon: <MessageCircle size={16} />,
    t: "Weekly check-ins, mid-programme call",
    d: "A short Sunday WhatsApp from your coach every week. A scheduled phone call at week 4 to review and adjust. A final reassessment at week 6.",
  },
];

const COMMITMENTS = [
  {
    icon: <HeartPulse size={18} />,
    t: "Personal attention in a small group",
    d: "Never more than six members per session. Your coach sees every rep and adjusts the work to you, not to the average.",
  },
  {
    icon: <ShieldCheck size={18} />,
    t: "Safe, progressive loading",
    d: "We work around injuries and conditions, not despite them. Loads climb when your technique earns them.",
  },
  {
    icon: <Sparkles size={18} />,
    t: "Expert coaching, properly qualified",
    d: "Sessions led by a personal trainer with an MSc in Sport Physiology. Specialist focus on post-rehab and life after 40.",
  },
];

const WHO_WE_WORK_WITH = [
  {
    headline: "Recently discharged from physio",
    body: "Pain-free but not yet strong. You need progressive loading without risking re-injury, guided by someone who reads your history first.",
  },
  {
    headline: "Never trained before, or not for years",
    body: "You want a small, judgement-free room and a coach who will walk you through every movement. No figuring it out alone.",
  },
  {
    headline: "Protecting bone density and independence",
    body: "Evidence-based strength training for adults over 40 who want to stay capable, not just active. Proper loading, not light dumbbells.",
  },
  {
    headline: "Rebuilding after illness or a long break",
    body: "A programme that adapts to your energy on the day, not one that punishes you for a bad week. We work session-to-session.",
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
    q: "Do I need any gym experience?",
    a: "None at all. Most of our members had never trained before joining. Every session is coached from start to finish; there is nothing to figure out on your own.",
  },
  {
    q: "What if I have an injury or a medical condition?",
    a: "We work regularly with members managing post-surgical recovery, chronic back pain, type 2 diabetes, osteoarthritis, osteoporosis, and long COVID, among other conditions. Tell us about it on the consultation call and we will be honest about whether we are the right fit.",
  },
  {
    q: "How often should I train?",
    a: "Two sessions a week is the sweet spot for most members and the frequency we recommend by default. One session a week works well for absolute beginners or busy schedules. Three is ideal for people with some training history or those moving on from physio.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes. Pay in full upfront for simplicity, or split it into instalments. We confirm payment options on the consultation call before you book.",
  },
  {
    q: "What happens after the 6-week ends?",
    a: "You can step into ongoing monthly membership at the same sessions, on a rolling monthly contract. Members who finish the 6-week often roll into the 12-week instead. There is no auto-enrolment; we talk options at your final session.",
  },
  {
    q: "What is the consultation call?",
    a: "A 30 minute phone call before you enrol. We learn your goals, talk through any injury history or medical context, explain how the programme works, and answer your questions. No pressure, no sales script.",
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
              Eastbourne · Small groups · Expert coaching
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 relative">
            <Kicker>Strength training for adults who want it done properly</Kicker>
            <h1 className="display mt-6 text-[clamp(2.5rem,7.5vw,6.25rem)] text-paper leading-[1.02]">
              Get stronger in
              <br />
              <span className="display-italic font-medium text-flame">
                six weeks.
              </span>
            </h1>
            <Lede className="mt-10">
              A structured 6-week programme for adults in Eastbourne who want
              expert coaching in a small, private studio. Whether you are
              starting from scratch, rebuilding after injury, or looking for
              something better than a regular gym: this is where to begin.
            </Lede>

            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton href="#enquire" variant="primary">
                Arrange a free call
              </CTAButton>
              <CTAButton href="#how" variant="ghost">
                How it works
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
              <Caption>
                Six-week programmes run in the gym at Dursley Road, Eastbourne.
              </Caption>
            </div>
          </div>

          <aside className="lg:col-span-5" id="enquire">
            <div className="lg:sticky lg:top-10">
              <LeadForm
                source="6-week-general"
                eyebrow="Step 01 · Arrange a call"
                title="Start with a free call."
                body="Leave your details and we will call to learn about your goals. No pressure, and if we are a fit, we will invite you in for an in-person consultation."
                submitLabel="Get started"
              />
            </div>
          </aside>
        </div>
      </section>

      {/* ——— Who we work with ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Folio number="02" label="Who we work with" />
            <H2 className="mt-6">
              Built for people most gyms
              <span className="display-italic font-medium text-flame">
                {" "}
                were not built for.
              </span>
            </H2>
            <p className="mt-6 text-paper/75 text-[1.02rem] leading-[1.72] max-w-md">
              If you have ever felt out of place in a gym, or unsure where to
              start, you are exactly who this programme is for.
            </p>
          </div>
          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <ul className="space-y-7 text-[1.02rem] text-paper/80 leading-relaxed">
              {WHO_WE_WORK_WITH.map((item) => (
                <li key={item.headline} className="flex gap-4">
                  <span className="text-flame mt-1.5 shrink-0">&#9656;</span>
                  <span>
                    <strong className="block text-paper font-semibold">
                      {item.headline}
                    </strong>
                    <span className="mt-1.5 block text-paper/75">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ——— The Gain difference ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-10">
          <div className="md:col-span-7">
            <Folio number="03" label="The Gain difference" />
            <H2 className="mt-6">
              Not a class. Not a regular gym.
              <span className="display-italic font-medium text-flame">
                {" "}
                Something in between.
              </span>
            </H2>
          </div>
          <p className="md:col-span-5 text-paper/70 text-[1.02rem] leading-relaxed">
            Small groups of up to six, each doing the same exercises at their
            own weight and pace. A coach watches every rep and adjusts the work
            to you, not to the room.
          </p>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-line">
          {[
            {
              number: "01",
              title: "Max six per session",
              body: "Small enough to coach every person individually. Large enough to train alongside others who understand.",
            },
            {
              number: "02",
              title: "Same exercises, your weight",
              body: "Everyone follows the same programme structure, but loads, reps, and progressions are tailored to each member.",
            },
            {
              number: "03",
              title: "Post-rehab specialists",
              body: "We work regularly with members managing injuries, chronic conditions, and recovery from illness. Your history shapes your programme.",
            },
            {
              number: "04",
              title: "Measurable progress",
              body: "We track one key lift from day one and re-test at week six. You will see the numbers change.",
            },
          ].map((p) => (
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
              Six weeks is the
              <span className="display-italic font-medium text-flame">
                {" "}
                right size of commitment.
              </span>
            </H2>
          </div>
          <div className="lg:col-span-8 space-y-5">
            <Rule tone="paper" />
            <p className="text-[1.05rem] text-paper/80 leading-[1.72] max-w-2xl">
              Long enough to learn the lifts properly, build a training habit,
              and see measurable strength gains. Short enough that you are not
              signing up for something you cannot picture finishing.
            </p>
            <p className="text-[1.05rem] text-paper/80 leading-[1.72] max-w-2xl">
              Most members see a 20 to 50 percent strength increase in their
              tracked lift by week six. More importantly, they feel different:
              more confident in the gym, more capable outside it.
            </p>
            <p className="text-[1.05rem] text-paper/80 leading-[1.72] max-w-2xl">
              There is no contract afterwards. If you want to keep training,
              monthly membership is available on a rolling basis. If you want
              to stop, you stop. No pressure either way.
            </p>
          </div>
        </div>
      </Section>

      {/* ——— Programme structure + pricing ——— */}
      <Section tone="ink" id="how">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <Folio number="05" label="The 6-week programme" />
            <h2 className="display mt-6 text-[clamp(2rem,5vw,3.75rem)] text-paper leading-[1.02]">
              The structure.
              <span className="block display-italic font-medium text-flame mt-2">
                Two phases, six weeks.
              </span>
            </h2>
            <p className="mt-8 text-paper/75 leading-[1.72] text-[1.02rem]">
              Every member follows the same two-phase structure. We start
              conservative and build from there, so you finish stronger than
              you started with technique that will last.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <Pill tone="paper">6 weeks</Pill>
              <Pill tone="paper">Max 6 per session</Pill>
              <Pill tone="paper">Pay in full or instalments</Pill>
            </div>

            <ul className="mt-8 space-y-3 text-[0.98rem] text-paper/75">
              {[
                "Free 30-minute consultation call",
                "20 to 30 minute one-to-one induction",
                "Weekly small-group sessions, max six",
                "Weekly Sunday WhatsApp from your coach",
                "Mid-programme phone check-in at week 4",
                "Final reassessment at week 6",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <CheckCircle2 size={16} className="text-flame mt-1 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />

            <div className="mb-12">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame mb-5">
                Programme structure
              </p>
              <ol className="space-y-6">
                {PHASES.map((phase) => (
                  <li
                    key={phase.label}
                    className="grid grid-cols-12 gap-x-6 border-l border-ink-line pl-6"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-paper/55">
                        {phase.label}
                      </p>
                      <p className="display-tight text-lg text-paper mt-1">
                        {phase.weeks}
                      </p>
                    </div>
                    <p className="col-span-12 sm:col-span-9 text-paper/75 text-[0.98rem] leading-relaxed mt-2 sm:mt-0">
                      {phase.focus}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-flame/40 bg-ink-soft p-7">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame mb-4">
                Pricing
              </p>
              <p className="text-paper/80 text-[0.98rem] leading-relaxed">
                We talk through pricing, frequency, and payment options on the
                consultation call. No hidden fees, no pressure.
              </p>
              <div className="mt-5">
                <CTAButton href="#enquire" variant="primary">
                  Get started
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— What every member gets ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Folio number="06" label="What you get" />
            <H2 className="mt-6">Three things every member gets.</H2>
          </div>
          <p className="md:col-span-5 text-paper/70 text-[1.02rem] leading-relaxed">
            The three commitments that run through every Gain programme. We
            will not compromise on these.
          </p>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink-line">
          {COMMITMENTS.map((f, i) => (
            <div
              key={f.t}
              className="py-10 px-6 md:px-10 md:first:pl-0 md:last:pr-0"
            >
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame tabular-nums">
                / 0{i + 1}
              </span>
              <span className="mt-5 flex h-12 w-12 items-center justify-center border border-paper/20 text-flame mb-5">
                {f.icon}
              </span>
              <h3 className="display-tight text-xl md:text-2xl text-paper leading-[1.15]">
                {f.t}
              </h3>
              <p className="mt-3 text-paper/70 text-[0.98rem] leading-relaxed">
                {f.d}
              </p>
            </div>
          ))}
        </div>
        <Rule tone="paper" />
      </Section>

      {/* ——— Slim mid-page CTA strip ——— */}
      <section className="bg-flame text-ink">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="display-tight text-2xl md:text-[1.65rem] text-ink leading-[1.2] max-w-2xl">
            Six people per session, expert coaching, no jargon. Six weeks to
            see what proper strength training feels like.
          </p>
          <div className="flex flex-wrap gap-3 shrink-0">
            <CTAButton
              href="#book"
              variant="solid-black"
              className="hover:!bg-ink hover:!text-flame"
            >
              Get started
            </CTAButton>
            <CTAButton
              href="#enquire"
              variant="ghost"
              className="!text-ink !border-ink/80 hover:!bg-ink hover:!text-flame hover:!border-ink"
              icon="none"
            >
              Or leave your details
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ——— How it works ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Folio number="07" label="How it works" />
            <H2 className="mt-6">From enquiry to first session.</H2>
            <Lede className="mt-6">
              The path is the same for everyone. A short call, an induction,
              then weekly sessions with proper support around them.
            </Lede>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="#book" variant="primary">
                Get started
              </CTAButton>
              <CTAButton href="#enquire" variant="ghost">
                Arrange a free call
              </CTAButton>
            </div>
          </div>

          <ol className="md:col-span-7 border-t border-paper/20">
            {HOW_STEPS.map((s) => (
              <li
                key={s.n}
                className="border-b border-paper/20 py-10 grid grid-cols-12 gap-x-8 gap-y-3 items-start"
              >
                <div className="col-span-12 md:col-span-2">
                  <span className="display text-4xl md:text-5xl text-flame font-black tabular-nums leading-none">
                    {s.n}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-10">
                  <div className="flex items-center gap-3 text-flame mb-2">
                    {s.icon}
                  </div>
                  <h3 className="display-tight text-2xl md:text-[1.8rem] text-paper">
                    {s.t}
                  </h3>
                  <p className="mt-3 text-paper/70 text-[0.98rem] leading-relaxed max-w-lg">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ——— Testimonials ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Folio number="08" label="What members say" />
            <H2 className="mt-6">
              Real members,
              <span className="display-italic font-medium text-flame">
                {" "}
                real Eastbourne reviews.
              </span>
            </H2>
          </div>
          <p className="md:col-span-5 text-paper/70 text-[1.02rem] leading-relaxed">
            Verbatim five-star Google reviews from members on the programme
            today.
          </p>
        </div>

        <a
          href={GOOGLE_RATING.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 flex flex-wrap items-center gap-4 border border-ink-line bg-ink/40 px-5 py-4 hover:border-flame transition-colors"
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
      </Section>

      {/* ——— No contracts ——— */}
      <Section tone="ink" containerClass="!py-14 md:!py-16">
        <div className="border border-flame/40 bg-ink-soft p-7 md:p-10 grid md:grid-cols-12 gap-6 md:gap-10 items-start">
          <div className="md:col-span-3">
            <Kicker>No contracts</Kicker>
            <p className="mt-3 display-tight text-2xl md:text-[1.6rem] text-paper leading-[1.15]">
              The 6-week is the 6-week.
            </p>
          </div>
          <p className="md:col-span-9 text-paper/80 text-[1.02rem] leading-[1.72] max-w-3xl">
            No contracts. No auto-renewal. No tie-in beyond the programme you
            signed up for. After the 6-week, monthly rolling membership only
            if it is working for you. If it is not, we will tell you on the
            consultation call before you book.
          </p>
        </div>
      </Section>

      {/* ——— FAQs ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Folio number="09" label="Frequently asked" />
            <H2 className="mt-6">Questions we get most.</H2>
            <p className="mt-6 text-paper/65 max-w-sm text-[0.98rem] leading-relaxed">
              Something else on your mind? Ask on the consultation call. That
              is what it is for.
            </p>
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
          </div>
        </div>
      </Section>

      {/* ——— Final CTA with form ——— */}
      <section className="relative bg-flame text-ink" id="book">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-20 md:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <span className="inline-block text-[0.68rem] font-bold uppercase tracking-[0.28em] text-ink/75">
              Start here
            </span>
            <h2 className="display mt-6 text-[clamp(2.25rem,6vw,5.25rem)] text-ink leading-[1.02]">
              Ready to feel stronger?
            </h2>
            <p className="lede mt-8 text-lg md:text-xl text-ink/85 max-w-md">
              Leave your details and we will call you for a free, no-pressure
              conversation about whether the programme is right for you.
            </p>
            <p className="mt-8 text-sm text-ink/75 leading-relaxed max-w-md">
              Prefer to talk? Call us on{" "}
              <a
                href={`tel:${SITE.phoneHref}`}
                className="font-semibold underline underline-offset-4 hover:text-paper"
              >
                {SITE.phone}
              </a>
              . We answer in person, not via a switchboard.
            </p>
          </div>
          <div className="lg:col-span-6">
            <LeadForm
              source="6-week-general"
              eyebrow="Step 01 · Arrange a call"
              title="Start with a free call."
              body="Leave your details and we will call to learn about your goals. No pressure, and if we are a fit, we will invite you in for an in-person consultation."
              submitLabel="Get started"
            />
          </div>
        </div>
      </section>

      {/* ——— Slim footer (no exit links) ——— */}
      <footer className="bg-ink-soft border-t border-ink-line text-paper/65">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.22em]">
          <p>
            &copy; {new Date().getFullYear()} Gain Strength Therapy &middot; Dursley Rd,
            Eastbourne, BN22 8DJ
          </p>
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
    </>
  );
}
