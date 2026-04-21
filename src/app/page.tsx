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
import { Folio, Rule, PullQuote, Caption } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { HeroVideo } from "@/components/hero-video";
import { SITE, IMAGES, GOOGLE_RATING, REVIEWS } from "@/lib/utils";
import { Dumbbell, Users, HeartPulse, Compass, Star, ArrowDown, PhoneCall, MapPin, Handshake, ExternalLink } from "lucide-react";

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
                  Move better · train smarter · build lasting strength
                </span>
                <h1 className="display mt-6 text-[clamp(2.75rem,9vw,8.5rem)] text-paper">
                  <span className="block anim-rise d-1">Get stronger<span className="text-flame">.</span></span>
                  <span className="block anim-rise d-2 display-italic font-medium text-paper/95">Move better<span className="text-flame">.</span></span>
                  <span className="block anim-rise d-3">Feel like yourself<span className="text-flame"> again.</span></span>
                </h1>
              </div>

              <div className="lg:col-span-3 anim-rise d-5">
                <div className="h-px w-10 bg-paper/40 mb-5" />
                <p className="lede text-base md:text-[1.05rem] text-paper/85 leading-relaxed">
                  A small, friendly strength studio in Eastbourne &mdash; for
                  adults who want to feel strong, capable and in control of
                  their health, whatever their starting point.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <CTAButton href="/contact" variant="primary" className="!justify-between !w-full">
                    Enquire now
                  </CTAButton>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-between gap-2 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-paper/85 hover:text-paper border border-paper/25 hover:border-paper/60 px-5 py-3.5 rounded-sm transition-colors"
                  >
                    <span>How we train</span>
                    <span>→</span>
                  </Link>
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
              ["Small groups", "of 4 to 6"],
              ["Built for", "the long game"],
              ["No contract", "month to month"],
            ].map(([top, bot], i) => (
              <div key={i} className="px-5 md:px-8 py-7">
                <dt className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">{top}</dt>
                <dd className="display-tight text-paper mt-2 text-lg md:text-xl">{bot}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ——— 02 · METHOD ——— */}
      <Section tone="ink">
        <div className="mb-14 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <Folio number="02" label="Our approach" />
            <H2 className="mt-6">
              Empowering adults to unlock their strength&nbsp;
              <em className="display-italic font-medium text-flame">and take control of their health.</em>
            </H2>
          </div>
          <div className="md:col-span-5">
            <p className="prose-body text-paper/75 text-[1.05rem]">
              Three pillars run through everything we do: expert guidance,
              personalised coaching, and a private &amp; supportive space.
              Every session is led by a qualified Personal Trainer &mdash; no
              exceptions.
            </p>
          </div>
        </div>

        <Rule tone="paper" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 border-l border-r border-b border-ink-line">
          <FeatureCard n="01" icon={<Users size={18} />} title="Personal attention, group energy">
            Groups of four to six mean your coach always sees you. Cheaper than
            1-to-1, personalised to your ability, and the camaraderie carries
            you through the hard days.
          </FeatureCard>
          <FeatureCard n="02" icon={<HeartPulse size={18} />} title="Built around how you actually move">
            Before we load a barbell, we learn how you move. Old injuries,
            stiff hips, niggles &mdash; we work around them, and usually clear
            them up on the way.
          </FeatureCard>
          <FeatureCard n="03" icon={<Dumbbell size={18} />} title="Qualified coaches only">
            Every session is led by a Personal Trainer with advanced
            qualifications and a university degree. No wander-around
            inductions, no one-size plans.
          </FeatureCard>
          <FeatureCard n="04" icon={<Compass size={18} />} title="A programme, not a pick-and-mix">
            You&rsquo;ll know exactly what you&rsquo;re doing each week and
            why. Progress measured in real things: heavier shopping, pain-free
            stairs, better sleep.
          </FeatureCard>
          <FeatureCard n="05" icon={<Users size={18} />} title="A private, welcoming space">
            Free from the crowds and distractions of a commercial gym.
            You&rsquo;ll recognise faces. You&rsquo;ll be asked how your
            weekend was.
          </FeatureCard>
          <FeatureCard n="06" icon={<Star size={18} />} title="Flexible by design">
            Month-to-month memberships. Pause when you&rsquo;re on holiday.
            No contracts, no lock-ins, no guilt if life gets in the way.
          </FeatureCard>
        </div>
      </Section>

      {/* ——— 03 · HOW IT WORKS — the real funnel ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Folio number="03" label="How to start" />
            <H2 className="mt-6">Three simple steps.</H2>
            <Lede className="mt-6">
              No pushy forms, no 20-minute speed-date. Leave your details
              and Hallum will call you.
            </Lede>
            <div className="mt-10">
              <CTAButton href="/contact" variant="primary">Enquire now</CTAButton>
            </div>

            <div className="mt-14 hidden lg:block">
              <Photo
                src={IMAGES.gymStretching}
                alt="A coach warming up with a member in the gym"
                aspect="aspect-[4/5]"
                tone="warm"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <Caption>Warm-up in the gym at Dursley Road.</Caption>
            </div>
          </div>

          <ol className="lg:col-span-7 border-t border-ink-line">
            {[
              { n: "01", icon: <PhoneCall size={16} />, t: "Leave your details", d: "Use the enquiry form. Hallum will call you back for a short, no-pressure chat to understand your goals and any injury history." },
              { n: "02", icon: <MapPin size={16} />, t: "In-person consultation", d: "If it sounds like a fit, you'll be invited to the studio to meet Hallum, see the space, and talk through how training would look for you." },
              { n: "03", icon: <Handshake size={16} />, t: "Join if you want to", d: "We talk membership at the consultation. No contracts, no pressure — just an honest path forward if it's right." },
            ].map((s) => (
              <li key={s.n} className="border-b border-ink-line py-10 grid grid-cols-12 gap-x-8 gap-y-3 items-start">
                <div className="col-span-12 md:col-span-2">
                  <span className="display text-4xl md:text-5xl text-flame font-black tabular-nums leading-none">
                    {s.n}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-10">
                  <div className="flex items-center gap-3 text-flame mb-2">
                    {s.icon}
                  </div>
                  <h3 className="display-tight text-2xl md:text-[1.8rem] text-paper">{s.t}</h3>
                  <p className="mt-3 text-paper/70 text-[0.98rem] leading-relaxed max-w-lg">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ——— 04 · SOCIAL PROOF ——— */}
      <Section tone="ink">
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
              <Stat value="4–6" label="Per group" />
            </div>
            <p className="mt-8 text-paper/65 text-[0.98rem] leading-relaxed max-w-md">
              Plenty of our members walked in having never trained before. If
              that&rsquo;s you, you&rsquo;re in good company.
            </p>
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
                      <span className="text-xs uppercase tracking-[0.18em] text-paper/40">Google</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              /* Empty state — honest, doesn't fake quotes. Encourages users to read the real thing on Google. */
              <a
                href={GOOGLE_RATING.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-ink-soft border border-ink-line hover:border-flame transition-colors p-10 md:p-14 h-full"
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
                  they&rsquo;ve written &mdash; in their own words, on
                  Google.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[0.82rem] font-bold uppercase tracking-[0.22em] text-flame group-hover:text-paper transition-colors">
                  Read the reviews <ExternalLink size={14} />
                </span>
              </a>
            )}
          </div>
        </div>
      </Section>

      {/* ——— 05 · FACILITIES SNAPSHOT ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <Photo src={IMAGES.gymWide} alt="The gym floor at Gain" aspect="aspect-[4/5]" sizes="40vw" />
              <div className="pt-12 space-y-4">
                <Photo src={IMAGES.gymGroupClass} alt="A small-group class in the gym" aspect="aspect-square" sizes="40vw" />
                <Photo src={IMAGES.gymCoachMember} alt="A coach with a member at the cable machine" aspect="aspect-[4/5]" sizes="40vw" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <Folio number="05" label="The Gym" />
            <H2 className="mt-6">A small, fully-equipped gym &mdash; where the classes happen.</H2>
            <Lede className="mt-6">
              The gym is the heart of Gain. Classes run as small-group
              personal training &mdash; an instructor leads the room with up
              to six members training together. Everything you need, nothing
              you won&rsquo;t use.
            </Lede>

            <div className="mt-8 flex flex-wrap gap-2">
              <Pill tone="paper">Small-group PT</Pill>
              <Pill tone="paper">Up to six per class</Pill>
              <Pill tone="paper">Led by your coach</Pill>
              <Pill tone="paper">Free weights &amp; racks</Pill>
            </div>

            <div className="mt-10">
              <Link
                href="/facilities"
                className="text-sm font-bold uppercase tracking-[0.22em] text-paper link-editorial"
              >
                Take the full tour →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— 06 · PROGRAMME CALLOUT — the 30-day Strength Boost ——— */}
      <Section tone="ink">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <Folio number="06" label="For new members" />
            <h2 className="display mt-6 text-[clamp(2.5rem,6vw,5rem)] text-paper leading-[0.95]">
              Increase your strength,<br />
              <span className="display-italic font-medium text-flame">energy and confidence</span><br />
              in 30 days.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-paper/75 lede text-lg md:text-xl">
              Our 30-Day Strength Boost is how most new members start. Twelve
              sessions over 30 days &mdash; £149 &mdash; with a full refund if
              you don&rsquo;t feel stronger.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/programme" variant="primary">See the programme</CTAButton>
              <CTAButton href="/contact" variant="ghost">Enquire now</CTAButton>
            </div>
          </div>
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
