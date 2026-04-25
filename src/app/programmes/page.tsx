import type { Metadata } from "next";
import Link from "next/link";
import { Section, H2, CTAButton, FinalCTA, Lede, Pill } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { Photo } from "@/components/photo";
import { Folio, Kicker, Rule, Caption } from "@/components/editorial";
import { IMAGES } from "@/lib/utils";
import {
  PhoneCall,
  ClipboardCheck,
  MessageCircle,
  Users,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Two structured strength programmes for adults in Eastbourne. The 6-week is a focused start; the 12-week is a full transformation. Small groups of six, expert coaching, post-rehab specialists.",
};

type Tier = { freq: string; price: string; perSession: string };

type ProgrammeCard = {
  weeks: 6 | 12;
  eyebrow: string;
  title: string;
  italic: string;
  blurb: string;
  bestFor: string;
  outcomes: string;
  phases: { label: string; weeks: string; focus: string }[];
  tiers: Tier[];
  ctaLabel: string;
  source: string;
};

const PROGRAMMES: ProgrammeCard[] = [
  {
    weeks: 6,
    eyebrow: "Start here",
    title: "The 6-Week Transformation",
    italic: "A focused start.",
    blurb:
      "A short, structured block to learn the lifts, build a habit, and feel real strength gains. Most members start here to test the waters before committing to the full transformation.",
    bestFor:
      "First-timers, people apprehensive about a longer commitment, and anyone with a busy schedule who wants a clear short-term goal.",
    outcomes: "Typical strength gains of 20 to 50 percent in the tracked lift.",
    phases: [
      {
        label: "Phase 01",
        weeks: "Weeks 1 to 3",
        focus:
          "Foundation. Learn the fundamental movement patterns, set your baseline, build the habit of consistent training.",
      },
      {
        label: "Phase 02",
        weeks: "Weeks 4 to 6",
        focus:
          "Progressive strength. Increase load and complexity carefully, refine technique under weight, finish with a final assessment.",
      },
    ],
    tiers: [
      { freq: "1 session / week", price: "£119", perSession: "£14.83 / session" },
      { freq: "2 sessions / week", price: "£199", perSession: "£14.08 / session" },
      { freq: "3 sessions / week", price: "£269", perSession: "£13.28 / session" },
    ],
    ctaLabel: "Enquire about the 6-week",
    source: "programmes-6-week",
  },
  {
    weeks: 12,
    eyebrow: "Full transformation",
    title: "The 12-Week Transformation",
    italic: "If you are ready to commit.",
    blurb:
      "Three phases that take you from learning the lifts to consolidating real, measurable strength. Best value per session, the deepest changes, and the clearest path into ongoing membership.",
    bestFor:
      "Members who want the biggest physical and confidence shift, post-rehab clients ready for sustained progression, and anyone who values a longer-term plan over a short test.",
    outcomes: "Typical strength gains of 30 to 100 percent in the tracked lift.",
    phases: [
      {
        label: "Phase 01",
        weeks: "Weeks 1 to 4",
        focus:
          "Foundation. Movement patterns, technique, baseline, and the habit of training. No rush to load.",
      },
      {
        label: "Phase 02",
        weeks: "Weeks 5 to 8",
        focus:
          "Progressive strength. Loads climb week on week. Mid-programme phone check-in to review and adjust.",
      },
      {
        label: "Phase 03",
        weeks: "Weeks 9 to 12",
        focus:
          "Consolidation. Higher intensity, peak performance in your tracked lift, and a smooth handover into ongoing training if you want it.",
      },
    ],
    tiers: [
      { freq: "1 session / week", price: "£209", perSession: "£14.92 / session" },
      { freq: "2 sessions / week", price: "£359", perSession: "£13.71 / session" },
      { freq: "3 sessions / week", price: "£479", perSession: "£12.47 / session" },
    ],
    ctaLabel: "Enquire about the 12-week",
    source: "programmes-12-week",
  },
];

const MEMBERSHIP_TIERS: Tier[] = [
  { freq: "1 session / week", price: "£60 / month", perSession: "£15.00 / session" },
  { freq: "2 sessions / week", price: "£110 / month", perSession: "£13.75 / session" },
  { freq: "3 sessions / week", price: "£155 / month", perSession: "£12.92 / session" },
];

const PT_TIERS: Tier[] = [
  { freq: "Single session", price: "£50", perSession: "Pay as you go" },
  { freq: "4 session pack", price: "£180", perSession: "£45 / session" },
  { freq: "8 session pack", price: "£320", perSession: "£40 / session" },
];

const FAQS = [
  {
    q: "Which programme should I start with?",
    a: "Most people start with the 6-week. It is the easiest way to test how we work and to feel real progress before committing to a longer block. If you already know you want a full transformation, the 12-week is better value per session and goes deeper.",
  },
  {
    q: "How often should I train?",
    a: "Two sessions a week is the sweet spot for most members and the frequency we recommend by default. One session a week works well for absolute beginners or busy schedules. Three is ideal for people with some training history or those moving on from physio.",
  },
  {
    q: "What if I have an injury or a medical condition?",
    a: "We work regularly with members managing post-surgical recovery, chronic back pain, type 2 diabetes, osteoarthritis, osteoporosis, and long COVID, among other conditions. Tell us about it on the consultation call and we will be honest about whether we are the right fit.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes. Pay in full upfront for simplicity, or split it into instalments. We confirm payment options on the consultation call before you book.",
  },
  {
    q: "What happens after my programme ends?",
    a: "You can step into ongoing monthly membership at the same sessions, on a rolling monthly contract with monthly check-ins. Members who finish the 6-week often roll into the 12-week instead. There is no auto-enrolment; we talk options at your final session.",
  },
  {
    q: "Do you do 1-to-1 personal training?",
    a: "Yes. Single sessions are £50, with packs at £180 for 4 and £320 for 8. Most members get better results from small-group sessions at a fraction of the cost, but 1-to-1 is available for specific goals or if a private setting suits you better.",
  },
  {
    q: "What is the consultation call?",
    a: "A 30 minute phone call before you enrol. We learn your goals, talk through any injury history or medical context, explain how the programme works, and answer your questions. No pressure, no sales script.",
  },
  {
    q: "What is the induction session?",
    a: "Your first 20 to 30 minutes at the studio, before you join your first group session. We assess your movement, choose one tracking exercise to measure your progress, set your baseline on the whiteboard, and walk you through the weekly structure.",
  },
];

export default function ProgrammesPage() {
  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Programmes" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              Two structured paths into Gain
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 relative">
            <Kicker>For Eastbourne adults</Kicker>
            <h1 className="display mt-6 text-[clamp(2.75rem,8vw,7rem)] text-paper">
              Build real strength,
              <br />
              <span className="display-italic font-medium text-flame">
                in a structured way.
              </span>
            </h1>
            <Lede className="mt-10">
              Two transformation programmes, designed for adults who want
              expert guidance to get strong safely. Pick the entry point that
              fits your life. Both run as small group personal training, never
              more than six per session.
            </Lede>

            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton href="#six" variant="primary">
                See the 6-week
              </CTAButton>
              <CTAButton href="#twelve" variant="ghost">
                See the 12-week
              </CTAButton>
            </div>

            <div className="mt-14">
              <Photo
                src={IMAGES.gymBoxCoaching}
                alt="A coaching session on the box step-up in the gym"
                aspect="aspect-[16/10]"
                tone="warm"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
              <Caption>
                Programmes run in the gym at Dursley Road, Eastbourne.
              </Caption>
            </div>
          </div>

          <aside className="lg:col-span-5" id="enquire">
            <div className="lg:sticky lg:top-28">
              <LeadForm source="programmes-hero" />
            </div>
          </aside>
        </div>
      </section>

      {/* ——— Who this is for ——— */}
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
          </div>
          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <ul className="space-y-5 text-[1.02rem] text-paper/80 leading-relaxed">
              <li className="flex gap-4">
                <span className="text-flame mt-1.5 shrink-0">▸</span>
                <span>
                  <strong className="text-paper font-semibold">
                    Recently discharged from physio
                  </strong>
                  {" "}and pain-free, but not yet strong. You need
                  progressive loading without risking re-injury.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-flame mt-1.5 shrink-0">▸</span>
                <span>
                  <strong className="text-paper font-semibold">
                    Anxious about a typical gym
                  </strong>
                  {" "}and have never trained before. You want a small,
                  judgement-free room and someone who will actually coach you.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-flame mt-1.5 shrink-0">▸</span>
                <span>
                  <strong className="text-paper font-semibold">
                    Protecting bone density and independence
                  </strong>
                  {" "}as you get older. You want evidence-based loading,
                  not light dumbbells and a tea round.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-flame mt-1.5 shrink-0">▸</span>
                <span>
                  <strong className="text-paper font-semibold">
                    Rebuilding after illness
                  </strong>
                  {" "}or a long stretch of inactivity. You need a
                  programme that adapts to your energy on the day, not one
                  that punishes you for it.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-flame mt-1.5 shrink-0">▸</span>
                <span>
                  <strong className="text-paper font-semibold">
                    Managing a long-term condition
                  </strong>
                  {" "}such as type 2 diabetes, osteoarthritis or
                  osteoporosis. You want a coach who reads your history before
                  loading the bar.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ——— Programmes ——— */}
      {PROGRAMMES.map((p, idx) => (
        <Section
          key={p.weeks}
          tone={idx === 0 ? "ink" : "ink-soft"}
          id={p.weeks === 6 ? "six" : "twelve"}
        >
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Folio number={`0${3 + idx}`} label={p.eyebrow} />
              <h2 className="display mt-6 text-[clamp(2rem,5vw,3.75rem)] text-paper leading-[1.02]">
                {p.title}
                <span className="block display-italic font-medium text-flame mt-2">
                  {p.italic}
                </span>
              </h2>
              <p className="mt-8 text-paper/75 leading-[1.72] text-[1.02rem]">
                {p.blurb}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <Pill tone="paper">{p.weeks} weeks</Pill>
                <Pill tone="paper">Max 6 per session</Pill>
                <Pill tone="paper">Pay in full or instalments</Pill>
              </div>

              <div className="mt-10 space-y-5">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame">
                    Best for
                  </p>
                  <p className="mt-2 text-paper/75 text-[0.98rem] leading-relaxed">
                    {p.bestFor}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame">
                    What to expect
                  </p>
                  <p className="mt-2 text-paper/75 text-[0.98rem] leading-relaxed">
                    {p.outcomes}
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <CTAButton href="#enquire" variant="primary">
                  {p.ctaLabel}
                </CTAButton>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Rule tone="paper" className="mb-8" />

              <div className="mb-12">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame mb-5">
                  Programme structure
                </p>
                <ol className="space-y-6">
                  {p.phases.map((phase) => (
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

              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame mb-5">
                  Pricing
                </p>
                <div className="grid sm:grid-cols-3 border border-ink-line">
                  {p.tiers.map((t, i) => (
                    <div
                      key={t.freq}
                      className={`p-6 ${
                        i < p.tiers.length - 1
                          ? "border-b sm:border-b-0 sm:border-r border-ink-line"
                          : ""
                      }`}
                    >
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-paper/55">
                        {t.freq}
                      </p>
                      <p className="display mt-3 text-3xl text-paper tabular-nums">
                        {t.price}
                      </p>
                      <p className="mt-1 text-xs text-paper/55 tabular-nums">
                        {t.perSession}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs italic text-paper/55">
                  All packages include induction, weekly WhatsApp support, and
                  the mid-programme phone check-in.
                </p>
              </div>
            </div>
          </div>
        </Section>
      ))}

      {/* ——— Ongoing membership ——— */}
      <Section tone="ink" id="membership">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <Folio number="05" label="After your programme" />
            <H2 className="mt-6">
              Ongoing monthly membership.
            </H2>
            <Lede className="mt-6">
              When your programme ends, members who want to keep training step
              into ongoing membership. Same sessions, rolling monthly contract,
              monthly check-ins. Better per-session rate as a thank-you for
              staying.
            </Lede>
            <div className="mt-8 flex flex-wrap gap-2">
              <Pill tone="paper">Rolling monthly</Pill>
              <Pill tone="paper">Cancel anytime</Pill>
              <Pill tone="paper">Direct debit</Pill>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <div className="grid sm:grid-cols-3 border border-ink-line">
              {MEMBERSHIP_TIERS.map((t, i) => (
                <div
                  key={t.freq}
                  className={`p-6 ${
                    i < MEMBERSHIP_TIERS.length - 1
                      ? "border-b sm:border-b-0 sm:border-r border-ink-line"
                      : ""
                  }`}
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-paper/55">
                    {t.freq}
                  </p>
                  <p className="display mt-3 text-3xl text-paper tabular-nums">
                    {t.price}
                  </p>
                  <p className="mt-1 text-xs text-paper/55 tabular-nums">
                    {t.perSession}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs italic text-paper/55">
              Members who joined Gain before the new pricing keep their
              original rates. Loyalty is rewarded.
            </p>
          </div>
        </div>
      </Section>

      {/* ——— 1-to-1 PT ——— */}
      <Section tone="ink-soft" id="pt">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <Folio number="06" label="1-to-1 personal training" />
            <H2 className="mt-6">
              Private sessions,
              <span className="display-italic font-medium text-flame">
                {" "}
                when you want them.
              </span>
            </H2>
            <p className="mt-6 text-paper/75 leading-[1.72] text-[1.02rem]">
              Most members get more from small group training, but 1-to-1 is
              available for very specific goals, dedicated rehab work, or if a
              private setting suits you better. Bookable as single sessions or
              packs.
            </p>
          </div>

          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <div className="grid sm:grid-cols-3 border border-ink-line">
              {PT_TIERS.map((t, i) => (
                <div
                  key={t.freq}
                  className={`p-6 ${
                    i < PT_TIERS.length - 1
                      ? "border-b sm:border-b-0 sm:border-r border-ink-line"
                      : ""
                  }`}
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-paper/55">
                    {t.freq}
                  </p>
                  <p className="display mt-3 text-3xl text-paper tabular-nums">
                    {t.price}
                  </p>
                  <p className="mt-1 text-xs text-paper/55 tabular-nums">
                    {t.perSession}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ——— How it works ——— */}
      <Section tone="ink" id="how">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Folio number="07" label="How it works" />
            <H2 className="mt-6">From enquiry to first session.</H2>
            <Lede className="mt-6">
              The path is the same for both programmes. A short call, an
              induction, then weekly sessions with proper support around them.
            </Lede>
            <div className="mt-8">
              <CTAButton href="#enquire" variant="primary">
                Start with a free call
              </CTAButton>
            </div>
          </div>

          <ol className="md:col-span-7 border-t border-paper/20">
            {[
              {
                n: "01",
                icon: <PhoneCall size={16} />,
                t: "Free 30-minute consultation call",
                d: "We learn your goals, any injury history, and what you have tried before. We explain how the programme works and answer questions. If we are not the right fit, we will say so honestly.",
              },
              {
                n: "02",
                icon: <ClipboardCheck size={16} />,
                t: "Induction and baseline (week 1)",
                d: "A 20 to 30 minute one-to-one before your first group session. Movement assessment, choose one tracking exercise, set your baseline on the whiteboard, walk through your weekly schedule.",
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
                t: "Weekly check-ins and a mid-programme call",
                d: "A short Sunday WhatsApp from your coach every week. A scheduled phone call mid-programme (week 4 on the 6-week, weeks 6 and 10 on the 12-week) to review and adjust.",
              },
            ].map((s) => (
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

      {/* ——— What every member gets ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Folio number="08" label="What you get" />
            <H2 className="mt-6">Three things every member gets.</H2>
          </div>
          <p className="md:col-span-5 text-paper/70 text-[1.02rem] leading-relaxed">
            The three commitments that run through every Gain programme. We
            will not compromise on these.
          </p>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink-line">
          {[
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
              d: "Sessions led by a personal trainer with a Masters in Sport Physiology. Specialist focus on post-rehab and life after 40.",
            },
          ].map((f, i) => (
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

      {/* ——— FAQs ——— */}
      <Section tone="ink">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Folio number="09" label="Frequently asked" />
            <H2 className="mt-6">Questions we get most.</H2>
            <p className="mt-6 text-paper/65 max-w-sm text-[0.98rem] leading-relaxed">
              Something else on your mind? Ask on the consultation call.
              That is what it is for.
            </p>
            <div className="mt-8">
              <Link
                href="/faqs"
                className="text-sm font-bold uppercase tracking-[0.22em] text-paper link-editorial"
              >
                See all FAQs →
              </Link>
            </div>
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

      <FinalCTA
        title="Ready to start?"
        body="Leave your details and we will call you for a no-pressure chat about which programme fits."
      />
    </>
  );
}
