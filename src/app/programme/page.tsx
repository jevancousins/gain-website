import type { Metadata } from "next";
import { Section, H2, CTAButton, FinalCTA, Lede } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { Photo } from "@/components/photo";
import { Folio, Kicker, Rule, Caption } from "@/components/editorial";
import { IMAGES } from "@/lib/utils";
import { Sparkles, HeartPulse, ShieldCheck, PhoneCall, Target, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "30-Day Strength Boost",
  description:
    "A 30-day beginner-friendly strength programme for adults in Eastbourne. 12 sessions over 30 days, expert coaching, full refund guarantee. Enquire today.",
};

const FAQS = [
  { q: "Is this suitable for beginners?", a: "Yes — it's built for them. Most people start feeling unsure. You'll always work at your own level, with a coach watching every rep." },
  { q: "What happens after I submit the form?", a: "Hallum will give you a quick call to chat, answer questions, and see if it's a good fit. No pressure to sign up — that's the whole point of the call." },
  { q: "What does it cost?", a: "£149 for 12 sessions over the 30 days." },
  { q: "What if I don't feel stronger at the end?", a: "Complete 10 of the 12 sessions and still don't feel stronger? 100% refund, no questions asked. We back ourselves on the work, and we make our side of the guarantee legible so you know exactly where you stand." },
  { q: "Do I need to be fit already?", a: "No. We meet you exactly where you are. If you can walk in the door, we can work with you." },
  { q: "What happens after the 30 days?", a: "If you'd like to continue, we'll talk through membership options at your next session. No auto-renewals, no contracts you can't leave." },
];

export default function ProgrammePage() {
  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="30-Day Strength Boost" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              12 sessions · 30 days · £149
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 relative">
            <Kicker>For Eastbourne locals</Kicker>
            <h1 className="display mt-6 text-[clamp(2.75rem,8vw,7rem)] text-paper">
              Increase your strength, energy
              <br />
              <span className="display-italic font-medium text-flame">and confidence</span> in 30 days.
            </h1>
            <Lede className="mt-10">
              For Eastbourne locals ready to get stronger and more confident
              &mdash; without the overwhelm of a busy gym.
            </Lede>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <div className="border border-ink-line bg-ink-soft p-5">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame">Investment</p>
                <p className="display mt-2 text-3xl text-paper tabular-nums">£149</p>
                <p className="mt-1 text-xs text-paper/60">12 sessions over 30 days</p>
              </div>
              <div className="border border-ink-line bg-ink-soft p-5">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame">Guarantee</p>
                <p className="display mt-2 text-3xl text-paper tabular-nums">100%</p>
                <p className="mt-1 text-xs text-paper/60">Complete 10 of 12 sessions and still not stronger? Full refund.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton href="#enquire" variant="primary">Enquire now</CTAButton>
              <CTAButton href="#how" variant="ghost">How it works</CTAButton>
            </div>

            <div className="mt-14">
              <Photo
                src={IMAGES.gymBoxCoaching}
                alt="A coaching session on the box step-up in the gym"
                aspect="aspect-[16/10]"
                tone="warm"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
              <Caption>The 30-Day Strength Boost &mdash; photographed at the Dursley Road studio.</Caption>
            </div>
          </div>

          <aside className="lg:col-span-5" id="enquire">
            <div className="lg:sticky lg:top-28">
              <LeadForm source="30day-hero" />
            </div>
          </aside>
        </div>
      </section>

      {/* ——— The problem ——— */}
      <Section tone="ink-soft">
        <div className="max-w-4xl">
          <Folio number="02" label="Why people start" />
          <H2 className="mt-6">
            We know it can be difficult finding a gym where you feel
            <span className="display-italic font-medium text-flame"> supported enough to keep going.</span>
          </H2>
          <p className="mt-8 text-paper/75 text-[1.05rem] leading-relaxed max-w-2xl">
            Most people who come to us have tried a big gym before. They
            drifted. Not because they didn&rsquo;t want to get stronger, but
            because nothing about the place made them feel like they belonged
            there. The 30-Day Strength Boost is the easiest way in.
          </p>
        </div>
      </Section>

      {/* ——— How it works ——— */}
      <Section tone="ink" id="how">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Folio number="03" label="How it works" />
            <H2 className="mt-6">From enquiry to first session.</H2>
            <Lede className="mt-6">
              A free call, a plan, and you&rsquo;re under way. No speed-date,
              no sales-funnel wizardry.
            </Lede>
          </div>

          <ol className="md:col-span-7 border-t border-paper/20">
            {[
              { n: "01", icon: <PhoneCall size={16} />, t: "Book a free call", d: "Have a zero-pressure chat with Hallum to see if we'd be the right fit for you." },
              { n: "02", icon: <Target size={16} />, t: "Free in-person consultation", d: "If it's a fit, Hallum will invite you into the studio for a free in-person consultation — we map out exactly what you want to achieve so we can help you get there." },
              { n: "03", icon: <Rocket size={16} />, t: "Get started", d: "Begin to build your strength, confidence, and energy levels over 30 days." },
            ].map((s) => (
              <li key={s.n} className="border-b border-paper/20 py-10 grid grid-cols-12 gap-x-8 gap-y-3 items-start">
                <div className="col-span-12 md:col-span-2">
                  <span className="display text-4xl md:text-5xl text-flame font-black tabular-nums leading-none">{s.n}</span>
                </div>
                <div className="col-span-12 md:col-span-10">
                  <div className="flex items-center gap-3 text-flame mb-2">{s.icon}</div>
                  <h3 className="display-tight text-2xl md:text-[1.8rem] text-paper">{s.t}</h3>
                  <p className="mt-3 text-paper/70 text-[0.98rem] leading-relaxed max-w-lg">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ——— Key benefits ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Folio number="04" label="What you get" />
            <H2 className="mt-6">Three things every member gets.</H2>
          </div>
          <p className="md:col-span-5 text-paper/70 text-[1.02rem] leading-relaxed">
            The programme is built around the three things that reliably work
            for our members &mdash; and the three we won&rsquo;t compromise
            on.
          </p>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink-line">
          {[
            { icon: <HeartPulse size={18} />, t: "Personal attention & support", d: "We're dedicated to giving you the guidance and support you need in every session." },
            { icon: <ShieldCheck size={18} />, t: "Safe, steady progress", d: "We meet you where you are now — showing you what to do and how to do it safely." },
            { icon: <Sparkles size={18} />, t: "Expert guidance", d: "We specialise in helping adults build and maintain their strength as they get older." },
          ].map((f, i) => (
            <div key={f.t} className="py-10 px-6 md:px-10 md:first:pl-0 md:last:pr-0">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame tabular-nums">
                / 0{i + 1}
              </span>
              <span className="mt-5 inline-flex h-12 w-12 items-center justify-center border border-paper/20 text-flame mb-5">
                {f.icon}
              </span>
              <h3 className="display-tight text-xl md:text-2xl text-paper leading-[1.15]">{f.t}</h3>
              <p className="mt-3 text-paper/70 text-[0.98rem] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
        <Rule tone="paper" />
      </Section>

      {/* ——— Guarantee callout ——— */}
      <Section tone="flame" containerClass="!py-20">
        <div className="max-w-4xl">
          <Kicker tone="ink">Our promise</Kicker>
          <h2 className="display mt-6 text-[clamp(2rem,5vw,4rem)] text-ink">
            Complete 10 of the 12 sessions and still don&rsquo;t feel stronger?
            <span className="display-italic font-medium"> We refund you 100%.</span>
          </h2>
          <p className="mt-6 text-ink/80 text-[1.05rem] leading-relaxed max-w-2xl">
            No small print, no partial refunds, no subjective judgement
            calls. You turn up for 10 of the 12 sessions, and if it
            hasn&rsquo;t worked, we return every pound. We back ourselves on
            results.
          </p>
          <div className="mt-8">
            <CTAButton
              href="#enquire"
              variant="solid-black"
              className="hover:!bg-ink hover:!text-flame"
            >
              Enquire now
            </CTAButton>
          </div>
        </div>
      </Section>

      {/* ——— Mid-page CTA ——— */}
      <Section tone="ink" containerClass="!py-20">
        <div className="text-center max-w-3xl mx-auto">
          <Kicker>A second chance to decide</Kicker>
          <p className="display mt-6 text-[clamp(2rem,4vw,3.25rem)] text-paper leading-[1]">
            Ready to see how this works for you?
          </p>
          <div className="mt-8 flex justify-center">
            <CTAButton href="#enquire" variant="primary">Enquire now</CTAButton>
          </div>
        </div>
      </Section>

      {/* ——— FAQs ——— */}
      <Section tone="ink-soft">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Folio number="05" label="Frequently asked" />
            <H2 className="mt-6">Questions we get most.</H2>
            <p className="mt-6 text-paper/65 max-w-sm text-[0.98rem] leading-relaxed">
              Something else on your mind? Ask on the call &mdash; that&rsquo;s
              what it&rsquo;s for.
            </p>
          </div>
          <div className="md:col-span-8">
            <Rule tone="paper" />
            <div className="divide-y divide-ink-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                    <span className="display-tight text-xl md:text-2xl text-paper leading-[1.2]">{f.q}</span>
                    <span className="display text-flame text-2xl transition-transform group-open:rotate-45 shrink-0">+</span>
                  </summary>
                  <p className="mt-4 text-paper/70 leading-[1.7] max-w-2xl">{f.a}</p>
                </details>
              ))}
            </div>
            <Rule tone="paper" />
          </div>
        </div>
      </Section>

      <FinalCTA
        title="Start your 30 days."
        body="Twelve sessions, thirty days, £149. Leave your details and Hallum will call for a no-pressure chat."
      />
    </>
  );
}
