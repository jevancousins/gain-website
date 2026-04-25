import type { Metadata } from "next";
import { Section, H2, FeatureCard, FinalCTA, Lede } from "@/components/ui";
import { Photo } from "@/components/photo";
import { Folio, Kicker, Rule, PullQuote } from "@/components/editorial";
import { IMAGES, TEAM } from "@/lib/utils";

const HALLUM = TEAM[0];
import { Award, Compass, HeartPulse, MessageCircle, GraduationCap, Trophy, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Hallum Cousins — MSc Sport Physiology, founder of Gain Strength Therapy in Eastbourne. Strength training for adults who want to feel strong and capable for life.",
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
                Empowering adults to unlock their strength
                <span className="display-italic font-medium text-flame"> and take control of their health.</span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <Lede>
                Gain Strength Therapy is Eastbourne&rsquo;s specialist small
                group strength training studio. We bridge the gap between
                physio and the gym &mdash; for adults who need expert guidance
                to build strength safely.
              </Lede>
              <p className="mt-5 text-paper/60 text-sm leading-relaxed max-w-md">
                Post-rehab, returning after illness, managing a long-term
                condition, or starting from scratch. Plenty of our members
                walked in having never trained before. You will be in good
                company.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Image mosaic ——— */}
      <section className="bg-ink">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-6">
              <Photo src={IMAGES.gymStretching} alt="Hallum coaching a member through a warm-up stretch" aspect="aspect-[4/5]" tone="warm" />
            </div>
            <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4 md:gap-6 md:pt-16">
              <Photo src={IMAGES.gymLunges} alt="Members doing lunges in the gym" aspect="aspect-square" />
              <Photo src={IMAGES.gymStretching} alt="Warm-up in the gym" aspect="aspect-square" />
              <Photo src={IMAGES.gymBoxCoaching} alt="Box step-up coaching" aspect="aspect-square" tone="warm" />
              <Photo src={IMAGES.gymGroupClass} alt="Hallum coaching a small-group class in the gym" aspect="aspect-square" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Meet Hallum ——— */}
      <Section tone="ink">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <Folio number="02" label="Meet Hallum" />
            <H2 className="mt-6">Why I started Gain.</H2>
            <div className="mt-8">
              <Photo
                src={HALLUM.photo}
                alt="Hallum Cousins, founder of Gain Strength Therapy"
                aspect="aspect-[4/5]"
                tone="warm"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-10" />
            <div className="space-y-6 text-[1.05rem] text-paper/80 leading-[1.72] prose-body">
              <p className="dropcap">
                I grew up around sport, studied it at university, and spent
                time working with professional clubs as a sports scientist.
                What I saw along the way &mdash; and what eventually pulled
                me back to Eastbourne to start Gain &mdash; is that most of
                the best ideas about strength and longevity never make it out
                of the academy or the elite-sport bubble.
              </p>
              <p>
                There is also a gap on the other side. People finish physio
                and are sent away pain-free but nowhere near strong. Adults
                with osteoporosis, type 2 diabetes, post-surgical recovery,
                or long COVID are told to lift weights but rarely shown how.
                Commercial gyms were not built for them, and one-to-one
                training is out of reach.
              </p>
              <p>
                Gain is my answer to that gap: a small private studio, small
                groups, proper coaching, and the space to train without
                being watched, judged or rushed.
              </p>
            </div>

            <Rule tone="paper" className="my-10" />

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="border border-ink-line bg-ink-soft p-5">
                <div className="flex items-center gap-3 text-flame mb-3">
                  <GraduationCap size={18} />
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">Education</span>
                </div>
                <p className="text-paper text-[0.98rem] leading-relaxed">
                  <strong className="font-semibold">MSc Sport Physiology</strong>,
                  University of Brighton
                </p>
                <p className="mt-1 text-paper/65 text-sm leading-relaxed">
                  BSc Sports Science, University of Bath
                </p>
              </div>

              <div className="border border-ink-line bg-ink-soft p-5">
                <div className="flex items-center gap-3 text-flame mb-3">
                  <Trophy size={18} />
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">Experience</span>
                </div>
                <p className="text-paper text-[0.98rem] leading-relaxed">
                  <strong className="font-semibold">Sports scientist</strong>{" "}
                  at Fulham FC and Bath City FC
                </p>
              </div>

              <div className="border border-ink-line bg-ink-soft p-5 sm:col-span-2">
                <div className="flex items-center gap-3 text-flame mb-3">
                  <Stethoscope size={18} />
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">Coaching</span>
                </div>
                <p className="text-paper text-[0.98rem] leading-relaxed">
                  Qualified personal trainer. Specialist focus on
                  post-rehabilitation progression, chronic conditions, and
                  strength for life after 40.
                </p>
              </div>
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

      {/* ——— Philosophy / Approach ——— */}
      <Section tone="ink">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Folio number="03" label="Our Approach" />
            <H2 className="mt-6">Strength is the best medicine we&rsquo;ve got.</H2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Rule tone="paper" className="mb-10" />
            <div className="space-y-6 text-[1.05rem] text-paper/75 leading-[1.72] prose-body">
              <p className="dropcap">
                Every session at Gain is led by a qualified personal trainer,
                backed by advanced qualifications and university degrees.
                Your coach watches every rep, adjusts every session, and
                keeps you progressing week on week.
              </p>
              <p>
                We believe in tailored coaching that fits into your
                lifestyle. No two bodies arrive in the same shape, so we read
                yours &mdash; injuries, mobility, confidence, energy &mdash;
                and build from there. You&rsquo;ll never be asked to do
                something you aren&rsquo;t ready for.
              </p>
              <p>
                The studio is designed to feel like the opposite of a
                commercial gym: private, welcoming, free from crowds and
                distractions. A place where you&rsquo;ll be known, greeted,
                and quietly pushed to do your best work.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Values ——— */}
      <Section tone="ink-soft">
        <div className="mb-12">
          <Folio number="04" label="Our Standards" />
          <H2 className="mt-6 max-w-2xl">The standards we hold ourselves to.</H2>
        </div>
        <Rule tone="paper" />
        <div className="grid md:grid-cols-2 border-l border-r border-b border-ink-line">
          <FeatureCard n="01" icon={<HeartPulse size={18} />} title="Expert guidance">
            Advanced qualifications, university degrees, and hands-on
            coaching experience. You&rsquo;re paying for real expertise
            &mdash; not someone reading off a clipboard.
          </FeatureCard>
          <FeatureCard n="02" icon={<Compass size={18} />} title="Personalised coaching">
            Every session is tailored to fit your ability and lifestyle. We
            adjust as you adjust. Nothing is ever &ldquo;one-size-fits-all.&rdquo;
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

      <FinalCTA />
    </>
  );
}
