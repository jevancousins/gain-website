import {
  Section,
  H2,
  CTAButton,
  FeatureCard,
  FinalCTA,
  Stat,
} from "@/components/ui";
import { Folio, Rule } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { HeroVideo } from "@/components/hero-video";
import { IMAGES, REVIEWS } from "@/lib/utils";
import { getGoogleRating } from "@/lib/google-rating";
import { Users, HeartPulse, FlaskConical, ArrowDown, ExternalLink } from "lucide-react";

export default async function HomePage() {
  const GOOGLE_RATING = await getGoogleRating();
  return (
    <>
      {/* ——— HERO: Full-bleed video ——— */}
      <section className="relative overflow-hidden bg-ink text-paper min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-6.5rem)] flex flex-col">
        <HeroVideo />

        <div className="relative z-10 border-b border-paper/15">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Eastbourne · BN22" />
            <span className="hidden md:inline-block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/60">
              Private strength training
            </span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-end">
          <div className="w-full mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-20 pb-14 md:pb-20">
            <div className="grid lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-9">
                <span className="inline-block text-[0.6rem] md:text-[0.68rem] font-bold uppercase tracking-[0.12em] md:tracking-[0.28em] text-flame anim-rise d-0">
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
        <div>
          <Folio number="02" label="Who we help" />
          <H2 className="mt-6">
            Built for people most gyms<br />
            <span className="display-italic font-medium text-flame">were not built for.</span>
          </H2>
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
              <p className="col-span-12 md:col-span-8 mt-3 md:mt-0 text-paper/70 text-[1.0625rem] leading-relaxed">
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

      {/* ——— Visual break: inside Gain ——— */}
      <Section tone="flame" containerClass="!py-14 md:!py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Photo src={IMAGES.gymInteriorWide} alt="Wide view of the Gain gym floor with members training" aspect="aspect-[4/3]" sizes="(min-width: 640px) 30vw, 100vw" />
          <Photo src={IMAGES.gymGroupClass} alt="Hallum coaching a small group through a warm-up" aspect="aspect-[4/3]" sizes="(min-width: 640px) 30vw, 100vw" />
          <Photo src={IMAGES.gainSignGroup} alt="Hallum and four members posing together in front of the GAIN sign" aspect="aspect-[4/3]" sizes="(min-width: 640px) 30vw, 100vw" />
        </div>
      </Section>

      {/* ——— 03 · HOW WE HELP ——— */}
      <Section tone="ink">
        <div className="mb-14">
          <Folio number="03" label="How we help" />
          <H2 className="mt-6">
            Expert-led training in a space<br />
            <em className="display-italic font-medium text-flame">that actually works for you.</em>
          </H2>
        </div>

        <Rule tone="paper" />
        <div className="grid md:grid-cols-3 border-l border-r border-b border-ink-line">
          <FeatureCard n="01" icon={<Users size={18} />} title="Personal attention, group energy">
            Groups of up to six mean your coach always sees you. More
            affordable than 1-to-1, personalised to your ability, and the
            camaraderie carries you through the hard days.
          </FeatureCard>
          <FeatureCard n="02" icon={<FlaskConical size={18} />} title="A science-backed approach">
            Your training is grounded in the latest strength and conditioning
            research, led by Hallum, our head coach and founder, who holds
            a master&rsquo;s degree in sport physiology. No fads, no guesswork,
            no one-size plans.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 min-w-0">
            <Folio number="04" label="Members" />
            <H2 className="mt-6">Real members. Real progress.</H2>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-8">
              <Stat value={GOOGLE_RATING.stars.toFixed(1)} label="★ Google" />
              <div className="hidden sm:block h-10 w-px bg-ink-line" />
              <Stat value={String(GOOGLE_RATING.count)} label="Reviews" />
              <div className="hidden sm:block h-10 w-px bg-ink-line" />
              <Stat value="6" label="Max per group" />
            </div>
          </div>

          {/* Member celebration photos */}
          <div className="lg:col-span-7 -mx-6 md:mx-0 min-w-0">
            <div className="flex md:grid md:grid-cols-2 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-6 md:scroll-pl-0 px-6 md:px-0 pb-4 md:pb-0 scrollbar-hide">
              <div className="snap-start shrink-0 w-[70vw] md:w-auto md:mt-8">
                <Photo src={IMAGES.gainSignTwoMembers} alt="Two members posing at GAIN sign" aspect="aspect-[3/4]" sizes="(min-width: 768px) 29vw, 70vw" />
              </div>
              <div className="snap-start shrink-0 w-[70vw] md:w-auto">
                <Photo src={IMAGES.gainSignTwoFemaleMembers} alt="Two members hugging at GAIN sign" aspect="aspect-[3/4]" sizes="(min-width: 768px) 29vw, 70vw" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-14">
          {REVIEWS.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      </Section>

      {/* ——— 05 · HOW TO START ——— */}
      <Section tone="ink" id="start">
        <div className="mb-14">
          <Folio number="05" label="How to start" />
          <h2 className="display mt-6 text-[clamp(2rem,4.2vw,3.4rem)] text-paper leading-[1.02]">
            Three simple steps<span className="text-flame">.</span><br />
            <span className="display-italic font-medium text-flame">No commitment until you are ready.</span>
          </h2>
        </div>

        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connector line linking the steps (desktop) */}
          <span
            aria-hidden
            className="hidden md:block absolute left-[16.666%] right-[16.666%] top-8 h-0.5 bg-flame/30"
          />
          {[
            { t: "Book a free chat", d: "Pick a time for a 30-minute phone call or in-person visit. We learn your goals, you ask your questions." },
            { t: "Choose a programme", d: "If it is a good fit, pick a programme that suits your needs and budget, and get started." },
            { t: "Start with your 1-to-1 induction", d: "A short one-to-one session to set your baseline and ease you in, then straight into coached group training." },
          ].map((s, i) => (
            <li key={s.t} className="relative flex items-start gap-5 md:block md:text-center">
              {/* Numbered node — sits on top of the connector line */}
              <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-flame bg-ink md:mx-auto">
                <span className="display-tight text-xl text-flame tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <div className="md:mt-6">
                <h3 className="display-tight text-xl text-paper mt-2">{s.t}</h3>
                <p className="mt-2 text-paper/65 text-base leading-relaxed md:mx-auto md:max-w-xs">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <CTAButton href="/contact" variant="primary">Get started</CTAButton>
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
