import Link from "next/link";
import {
  Section,
  H2,
  CTAButton,
  FeatureCard,
  FinalCTA,
  Stat,
  Lede,
  Pill,
} from "@/components/ui";
import { Folio, Rule } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { HeroVideo } from "@/components/hero-video";
import { SITE, IMAGES, GOOGLE_RATING, REVIEWS } from "@/lib/utils";
import { Users, HeartPulse, Dumbbell, ArrowDown, PhoneCall, Handshake, ClipboardCheck, ExternalLink } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ——— HERO: Full-bleed video ——— */}
      <section className="relative overflow-hidden bg-ink text-paper min-h-[88vh] md:min-h-[86vh] flex flex-col">
        <HeroVideo />

        <div className="relative z-10 border-b border-paper/15">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Eastbourne · BN22" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/60">
              Private strength training
            </span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-end">
          <div className="w-full mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-20 pb-14 md:pb-20">
            <div className="grid lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-9">
                <span className="inline-block text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame anim-rise d-0">
                  Beginners · Post-rehab · Older adults
                </span>
                <h1 className="display mt-6 text-[clamp(2.75rem,9vw,8.5rem)] text-paper">
                  <span className="block anim-rise d-1">The gym<span className="text-flame">.</span></span>
                  <span className="block anim-rise d-2 display-italic font-medium text-paper/95">For people</span>
                  <span className="block anim-rise d-3">who don&rsquo;t like<span className="text-flame"> gyms.</span></span>
                </h1>
              </div>

              <div className="lg:col-span-3 anim-rise d-5">
                <div className="h-px w-10 bg-paper/40 mb-5" />
                <p className="lede text-base md:text-[1.05rem] text-paper/85 leading-relaxed">
                  Specialist small group strength training in Eastbourne for
                  adults who need expert guidance to build strength safely.
                </p>
                <div className="mt-6">
                  <CTAButton href="/contact" variant="primary">
                    Get started
                  </CTAButton>
                </div>
              </div>
            </div>

            <div className="hidden md:flex absolute right-10 lg:right-16 top-24 flex-col items-center justify-center h-28 w-28 rounded-full border border-paper/35 text-paper rotate-[-8deg] bg-ink/50 backdrop-blur-sm anim-rise d-6">
              <span className="display text-2xl leading-none">5.0</span>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.2em] mt-1">Google rated</span>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.2em]">by members</span>
            </div>

            <div className="mt-12 md:mt-16 flex items-center gap-3 text-paper/55 text-[0.68rem] font-bold uppercase tracking-[0.24em]">
              <ArrowDown size={14} className="animate-bounce" />
              <span>Keep reading</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meta rail */}
      <section className="bg-ink-soft border-y border-ink-line">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-line">
            {[
              ["Qualified", "coaches only"],
              ["Small groups", "up to six"],
              ["Beginners", "welcome"],
              ["Structured", "6 and 12-week paths"],
            ].map(([top, bot], i) => (
              <div key={i} className="px-5 md:px-8 py-7">
                <dt className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">{top}</dt>
                <dd className="display-tight text-paper mt-2 text-lg md:text-xl">{bot}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ——— 02 · WHO WE HELP ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Folio number="02" label="Who we help" />
            <H2 className="mt-6">
              Built for people most gyms
              <span className="display-italic font-medium text-flame">
                {" "}were not built for.
              </span>
            </H2>
          </div>
          <div className="lg:col-span-5 flex items-end">
            <Lede>
              Whether you are brand new to training, rebuilding after injury,
              or looking to stay strong and independent as you get older,
              this is the place.
            </Lede>
          </div>
        </div>

        <ul className="mt-14 border-t border-ink-line">
          {[
            {
              t: "Complete beginners",
              d: "We help people who have always wanted to get strong but have never found the right place. Our calm, no-pressure atmosphere is the perfect place for you to learn how to get strong safely.",
            },
            {
              t: "Older adults",
              d: "If you want to stay strong enough to keep doing what you love and maintain your independence, we will challenge you appropriately with proper strength training that works.",
            },
            {
              t: "Post-rehab clients",
              d: "If you have finished physio but still do not feel back to normal, we will help you build the strength you need to get fully confident again. We understand injuries and know how to progress safely.",
            },
          ].map((p) => (
            <li key={p.t} className="border-b border-ink-line py-8 grid grid-cols-12 gap-x-6 items-start">
              <div className="col-span-12 md:col-span-4">
                <h3 className="display-tight text-2xl md:text-3xl text-paper leading-[1.2]">
                  {p.t}
                </h3>
              </div>
              <p className="col-span-12 md:col-span-8 mt-3 md:mt-0 text-paper/70 text-[0.98rem] leading-relaxed line-clamp-2 md:line-clamp-none">
                {p.d}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <CTAButton href="#start" variant="primary">
            How to get started
          </CTAButton>
        </div>
      </Section>

      {/* ——— 03 · HOW WE HELP ——— */}
      <Section tone="ink">
        <div className="mb-14 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <Folio number="03" label="How we help" />
            <H2 className="mt-6">
              Expert-led training in a space
              <em className="display-italic font-medium text-flame"> that actually works for you.</em>
            </H2>
          </div>
          <div className="md:col-span-5">
            <p className="prose-body text-paper/75 text-[1.05rem]">
              Everything we do is built around three things: personal
              attention, qualified coaching, and a space where you feel
              comfortable.
            </p>
          </div>
        </div>

        <Rule tone="paper" />
        <div className="grid md:grid-cols-3 border-l border-r border-b border-ink-line">
          <FeatureCard n="01" icon={<Users size={18} />} title="Personal attention, group energy">
            Groups of up to six mean your coach always sees you. More
            affordable than 1-to-1, personalised to your ability, and the
            camaraderie carries you through the hard days.
          </FeatureCard>
          <FeatureCard n="02" icon={<Dumbbell size={18} />} title="Qualified coaches only">
            Every session is led by a personal trainer with advanced
            qualifications and a master&rsquo;s degree in sport physiology.
            No wander-around inductions, no one-size plans.
          </FeatureCard>
          <FeatureCard n="03" icon={<HeartPulse size={18} />} title="A private, welcoming space">
            Free from the crowds and distractions of a commercial gym.
            You&rsquo;ll recognise faces. You&rsquo;ll be asked how your
            weekend was.
          </FeatureCard>
        </div>
      </Section>

      {/* ——— 04 · SOCIAL PROOF ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <Folio number="04" label="Members" />
            <H2 className="mt-6">Real members. Real progress.</H2>
            <Lede className="mt-6">
              {`We're rated ${GOOGLE_RATING.stars.toFixed(1)} stars on Google across ${GOOGLE_RATING.count} reviews — read what members actually say about training here.`}
            </Lede>
            <div className="mt-8 flex items-center gap-8">
              <Stat value={GOOGLE_RATING.stars.toFixed(1)} label="★ Google" />
              <div className="h-10 w-px bg-ink-line" />
              <Stat value={String(GOOGLE_RATING.count)} label="Reviews" />
              <div className="h-10 w-px bg-ink-line" />
              <Stat value="6" label="Max per group" />
            </div>
          </div>

          <div className="lg:col-span-7">
            {REVIEWS.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {REVIEWS.map((r, i) => (
                  <figure key={i} className="flex flex-col gap-5 bg-ink-soft border border-ink-line p-7 h-full">
                    <div className="flex items-center gap-1 text-flame">
                      {Array.from({ length: r.rating ?? 5 }).map((_, k) => (
                        <svg key={k} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21.2l1.7-7L2 9.5l7.1-.6L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="display-tight text-lg md:text-xl text-paper leading-[1.3]">
                      &ldquo;{r.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-auto pt-5 border-t border-ink-line flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-paper">{r.author}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-paper/55">Google</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <a
                href={GOOGLE_RATING.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-ink-soft border border-paper/40 hover:border-flame transition-colors p-10 md:p-14 h-full"
              >
                <div className="flex items-center gap-2 text-flame">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <svg key={k} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21.2l1.7-7L2 9.5l7.1-.6L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="display mt-6 text-[clamp(1.75rem,3.5vw,3rem)] text-paper leading-[1.05]">
                  {GOOGLE_RATING.stars.toFixed(1)} stars · {GOOGLE_RATING.count} reviews
                </p>
                <p className="mt-4 text-paper/70 leading-relaxed max-w-lg">
                  Every one of our reviews is from a real member. Read what
                  they&rsquo;ve written, in their own words, on Google.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[0.82rem] font-bold uppercase tracking-[0.22em] text-flame group-hover:text-paper transition-colors">
                  Read the reviews <ExternalLink size={14} />
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Member celebration photos */}
        <div className="mt-14 -mx-6 md:mx-0">
          <div className="flex md:grid md:grid-cols-12 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-6 md:scroll-pl-0 px-6 md:px-0 pb-4 md:pb-0 scrollbar-hide">
            <div className="snap-start shrink-0 w-[70vw] md:w-auto md:col-span-3 md:mt-8">
              <Photo src={IMAGES.gainSignFemaleMember} alt="Member pointing at GAIN sign" aspect="aspect-[3/4]" sizes="(min-width: 768px) 25vw, 70vw" />
            </div>
            <div className="snap-start shrink-0 w-[70vw] md:w-auto md:col-span-3">
              <Photo src={IMAGES.gainSignTwoMembers} alt="Two members posing at GAIN sign" aspect="aspect-[3/4]" sizes="(min-width: 768px) 25vw, 70vw" />
            </div>
            <div className="snap-start shrink-0 w-[70vw] md:w-auto md:col-span-3 md:mt-8">
              <Photo src={IMAGES.gainSignMemberOrange} alt="Member with thumbs up at GAIN sign" aspect="aspect-[3/4]" sizes="(min-width: 768px) 25vw, 70vw" />
            </div>
            <div className="snap-start shrink-0 w-[70vw] md:w-auto md:col-span-3">
              <Photo src={IMAGES.gainSignTwoFemaleMembers} alt="Two members hugging at GAIN sign" aspect="aspect-[3/4]" sizes="(min-width: 768px) 25vw, 70vw" />
            </div>
          </div>
        </div>
      </Section>

      {/* ——— 05 · HOW TO START ——— */}
      <Section tone="ink" id="start">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end mb-14">
          <div className="lg:col-span-7">
            <Folio number="05" label="How to start" />
            <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5rem)] text-paper leading-[0.95]">
              Three simple steps<span className="text-flame">.</span><br />
              <span className="display-italic font-medium text-flame">No commitment until you are ready.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-paper/75 lede text-lg md:text-xl">
              Every new member starts with a short consultation. No
              pressure, no hard sell. Just an honest conversation about
              what you need.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <PhoneCall size={18} />, t: "Book a free chat", d: "Pick a time for a 30-minute phone call or in-person visit. We learn your goals, you ask your questions." },
            { icon: <Handshake size={18} />, t: "Choose a programme", d: "If it is a good fit, pick a programme that suits your needs and budget, and get started." },
            { icon: <ClipboardCheck size={18} />, t: "Start with your 1-to-1 induction", d: "A short one-to-one session to set your baseline and ease you in, then straight into coached group training." },
          ].map((s) => (
            <div key={s.t} className="flex gap-4">
              <span className="mt-1 text-flame shrink-0">{s.icon}</span>
              <div>
                <h3 className="display-tight text-lg text-paper">{s.t}</h3>
                <p className="mt-2 text-paper/65 text-sm leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <CTAButton href="/contact" variant="primary">Get started</CTAButton>
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
