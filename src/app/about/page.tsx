import type { Metadata } from "next";
import { Section, H2, CTAButton, FeatureCard, FinalCTA, Lede } from "@/components/ui";
import { Photo } from "@/components/photo";
import { Folio, Kicker, Rule, PullQuote } from "@/components/editorial";
import { IMAGES, TEAM } from "@/lib/utils";
import { Award, Compass, HeartPulse, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the team behind Gain Strength Therapy — qualified coaches empowering busy adults to unlock their strength and take control of their health.",
};

export default function AboutPage() {
  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="About" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              Our people &amp; approach
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <Kicker>Our story</Kicker>
              <h1 className="display mt-6 text-[clamp(2rem,4.2vw,3.75rem)] text-paper max-w-[20ch]">
                Empowering busy adults to unlock their strength
                <span className="display-italic font-medium text-flame"> and take control of their health.</span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <Lede>
                Gain Strength Therapy is a small, independent studio in
                Eastbourne. We specialise in strength training, recovery, and
                coaching for adults who want to feel capable in their bodies
                again.
              </Lede>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Image mosaic ——— */}
      <section className="bg-ink">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-6">
              <Photo src={IMAGES.gymCoachMember} alt="A coach working with a member in the gym" aspect="aspect-[4/5]" tone="warm" />
            </div>
            <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4 md:gap-6 md:pt-16">
              <Photo src={IMAGES.gymLunges} alt="Members doing lunges in the gym" aspect="aspect-square" />
              <Photo src={IMAGES.gymStretching} alt="Warm-up in the gym" aspect="aspect-square" />
              <Photo src={IMAGES.gymBoxCoaching} alt="Box step-up coaching" aspect="aspect-square" tone="warm" />
              <Photo src={IMAGES.teamPhoto} alt="The Gain coaching team" aspect="aspect-square" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Philosophy ——— */}
      <Section tone="ink">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Folio number="02" label="Our Approach" />
            <H2 className="mt-6">Strength is the best medicine we&rsquo;ve got.</H2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Rule tone="paper" className="mb-10" />
            <div className="space-y-6 text-[1.05rem] text-paper/75 leading-[1.72] prose-body">
              <p className="dropcap">
                Our trainers bring years of experience and expertise to help
                you reach your health and fitness goals, backed by advanced
                qualifications and university degrees. Every session at Gain
                is led by a Personal Trainer &mdash; we don&rsquo;t believe in
                anything less.
              </p>
              <p>
                We believe in tailored coaching that fits into your lifestyle.
                No two bodies arrive in the same shape. We read yours &mdash;
                injuries, mobility, confidence, energy &mdash; and build from
                there. You&rsquo;ll never be asked to do something you
                aren&rsquo;t ready for.
              </p>
              <p>
                Our gym is designed to offer a more private, welcoming
                environment, free from the crowds and distractions of
                commercial gyms. A place where you&rsquo;ll be known, greeted,
                and quietly pushed to do your best work.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Pull quote ——— */}
      <Section tone="flame" containerClass="!py-28 md:!py-36">
        <div className="max-w-4xl">
          <PullQuote
            quote="I created Gain to provide a personal and supportive space where anyone can build strength and confidence at their own pace."
            attribution="Hallum Cousins, Founder"
            tone="ink"
          />
        </div>
      </Section>

      {/* ——— Values ——— */}
      <Section tone="ink">
        <div className="mb-12">
          <Folio number="03" label="Our Standards" />
          <H2 className="mt-6 max-w-2xl">The standards we hold ourselves to.</H2>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-2 border-l border-r border-b border-ink-line">
          <FeatureCard n="01" icon={<HeartPulse size={18} />} title="Expert guidance">
            Advanced qualifications, university degrees, and years in the
            trenches. You&rsquo;re paying for real expertise &mdash; not
            someone reading off a clipboard.
          </FeatureCard>
          <FeatureCard n="02" icon={<Compass size={18} />} title="Personalised coaching">
            Every session is tailored to fit into your lifestyle and ability.
            We adjust as you adjust. Nothing is ever &ldquo;one-size-fits-all.&rdquo;
          </FeatureCard>
          <FeatureCard n="03" icon={<Award size={18} />} title="Private &amp; supportive">
            A welcoming environment without the crowds, the mirrors, or the
            posing. Quiet rooms, familiar faces, conversations that matter.
          </FeatureCard>
          <FeatureCard n="04" icon={<MessageCircle size={18} />} title="Direct, honest coaching">
            We&rsquo;ll tell you what&rsquo;s working and what isn&rsquo;t.
            When to rest, when to ease off, when to push. You&rsquo;re paying
            for judgement, not cheerleading.
          </FeatureCard>
        </div>
      </Section>

      {/* ——— Team ——— */}
      <Section tone="ink-soft">
        <div className="mb-14 flex items-end justify-between flex-wrap gap-6">
          <div>
            <Folio number="04" label="The Coaches" />
            <H2 className="mt-6">The people who&rsquo;ll be coaching you.</H2>
          </div>
          <p className="max-w-sm text-paper/70">
            A small team by design. You&rsquo;ll get to know everyone
            &mdash; and everyone will get to know you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {TEAM.map((m, i) => (
            <article key={m.name} className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-5">
                <Photo
                  src={m.photo}
                  alt={`${m.name}, ${m.role}`}
                  aspect="aspect-[4/5]"
                  tone={i % 2 === 0 ? "warm" : "neutral"}
                  sizes="(min-width: 768px) 25vw, 40vw"
                />
              </div>
              <div className="col-span-7 flex flex-col justify-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-flame">
                  Coach · {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="display-tight mt-3 text-[1.9rem] md:text-[2.1rem] text-paper leading-[1.05]">
                  {m.name}
                </h3>
                <p className="mt-2 text-paper/60 text-sm italic">{m.role}</p>
                <Rule tone="paper" className="my-5 w-12" />
                <p className="text-[0.98rem] text-paper/80 leading-relaxed">{m.bio}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {m.specialisms.map((s) => (
                    <li
                      key={s}
                      className="text-[0.68rem] font-bold uppercase tracking-[0.18em] border border-paper/25 px-2.5 py-1 text-paper/70"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <CTAButton href="/contact" variant="primary">Enquire now</CTAButton>
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
