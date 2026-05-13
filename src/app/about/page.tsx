import type { Metadata } from "next";
import { Section, H2, FinalCTA, Lede } from "@/components/ui";
import { Photo } from "@/components/photo";
import { Folio, Kicker, Rule, PullQuote } from "@/components/editorial";
import { IMAGES, TEAM } from "@/lib/utils";

const HALLUM = TEAM[0];
import { GraduationCap, Trophy, Stethoscope } from "lucide-react";

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
              <Kicker>The gym for people who don&rsquo;t like gyms</Kicker>
              <h1 className="display mt-6 text-[clamp(2rem,4.2vw,3.75rem)] text-paper max-w-[20ch]">
                Built for the people
                <span className="display-italic font-medium text-flame"> traditional gyms leave behind.</span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <Lede>
                Gain exists because traditional gyms fail complete beginners,
                people recovering from injury, and anyone managing a health
                condition.
              </Lede>
              <p className="mt-5 text-paper/60 text-sm leading-relaxed max-w-md">
                If you&rsquo;ve never trained before, walking into a commercial
                gym is overwhelming. Rows of equipment you don&rsquo;t
                understand, nobody to help, and the constant feeling you
                don&rsquo;t belong. Gain changes that. This is a safe space
                where you can start from zero, build strength at your own pace,
                and actually feel comfortable doing it.
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
              <Photo src={IMAGES.gymMemberDumbbellLunge} alt="Senior female member performing a dumbbell lunge" aspect="aspect-square" />
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
            <H2 className="mt-6">The story behind Gain.</H2>
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
                In 2020, I ruptured my ACL and meniscus playing football. I got
                surgery one month before the first lockdown, but with no gyms
                open, I had to rehabilitate completely on my own. It was one of
                the hardest times of my life &mdash; going from a sporty
                20-year-old to not being able to walk, in loads of pain, on top
                of the isolation we all went through during lockdown.
              </p>
              <p>
                I had two choices: accept my fate and hope my leg strength
                would return naturally, or take control of the rehab process
                myself. I chose the latter.
              </p>
              <p>
                I was in the middle of my sport science degree, so I knew how
                to research the best methods for recovery. With no equipment
                available, I had to get creative to make sure I was progressing
                each week. On average, it takes someone a year to get back to
                where they were. Some people never return to playing sport. I
                was back running within a year. Six years on, I&rsquo;m still
                playing football with no knee issues.
              </p>
              <p>
                That experience taught me something crucial: most people
                don&rsquo;t need fancy equipment or complicated programmes.
                They need someone who understands their body, cares whether
                they improve, and guides them through the process safely.
              </p>
            </div>

            <Rule tone="paper" className="my-10" />

            <div className="space-y-6 text-[1.05rem] text-paper/80 leading-[1.72] prose-body">
              <p>
                During my master&rsquo;s degree, I worked at a commercial gym
                as a personal trainer. It became clear how many people were
                struggling with injuries, pain, or health conditions they
                didn&rsquo;t know how to manage during exercise. From my own
                experience, my education, and analysing research, I was able to
                help hundreds of people get out of pain, build strength, and
                actually enjoy exercise again. The majority just needed to get
                stronger, more mobile, and learn how to modify exercises in
                ways that would help them.
              </p>
              <p>
                When I got the opportunity to open a small gym studio, I
                couldn&rsquo;t turn it down. I wanted to create a space for
                people who found big gyms intimidating. Somewhere they could
                improve their health in a safe, non-judgmental environment.
              </p>
              <p>
                That&rsquo;s what Gain is. A place where someone actually cares
                whether you get better. Where the approach is gradual,
                personalised, and pressure-free.
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
                  <strong className="font-semibold">5 years of coaching experience</strong>
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
            quote="Most people don't need fancy equipment or complicated programmes. They need someone who understands their body, cares whether they improve, and guides them through the process safely."
            attribution="Hallum Cousins, Founder"
            tone="ink"
          />
        </div>
      </Section>

      <FinalCTA
        body="If you haven't found a gym that you feel comfortable enough to keep going, book a consultation with us. We'll talk through your situation, show you the space and work out whether Gain is right for you."
      />
    </>
  );
}
