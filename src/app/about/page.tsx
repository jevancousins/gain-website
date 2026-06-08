import type { Metadata } from "next";
import { Section, H2, FinalCTA, Lede, CTAButton } from "@/components/ui";
import { Photo } from "@/components/photo";
import { Folio, Kicker, Rule, PullQuote } from "@/components/editorial";
import { PersonSchema } from "@/components/structured-data";
import { IMAGES, TEAM } from "@/lib/utils";

const HALLUM = TEAM[0];
import { GraduationCap, Trophy, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Hallum Cousins: MSc Sport Physiology, founder of Gain Strength Therapy in Eastbourne. Small-group strength programmes in a gym and studio, for adults who want to stay strong for life.",
};

export default function AboutPage() {
  return (
    <>
      <PersonSchema />
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
          <div>
            <Kicker>The gym for people who don&rsquo;t like gyms</Kicker>
            <h1 className="display mt-6 text-[clamp(2rem,4.2vw,3.75rem)] text-paper">
              Built for the people<br />
              <span className="display-italic font-medium text-flame">traditional gyms leave behind.</span>
            </h1>
            <Lede className="mt-10 max-w-none">
              From our 40s onwards we steadily lose muscle and bone, and the
              research is clear that resistance training is the most effective
              way to slow and reverse it: rebuilding strength, protecting your
              bones, and keeping you independent for longer. Gain makes that
              accessible to complete beginners, anyone recovering from injury,
              and people managing a health condition, in a calm, judgement-free
              space where you start from zero at your own pace.
            </Lede>
          </div>
        </div>
      </section>

      {/* ——— Image mosaic ——— */}
      <section className="bg-ink pb-16 md:pb-24">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-12 gap-4 md:gap-6 items-start">
            <div className="col-span-12 md:col-span-6">
              <Photo src={IMAGES.gymStretching} alt="Hallum coaching a member through a warm-up stretch" aspect="aspect-[4/5] md:aspect-square" tone="warm" />
            </div>
            <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4 md:gap-6">
              <Photo src={IMAGES.gymLunges} alt="Members doing lunges in the gym" aspect="aspect-square" />
              <Photo src={IMAGES.gymMemberDumbbellLunge} alt="Senior female member performing a dumbbell lunge" aspect="aspect-square" />
              <Photo src={IMAGES.gymBoxCoaching} alt="Box step-up coaching" aspect="aspect-square" tone="warm" />
              <Photo src={IMAGES.gymGroupClass} alt="Hallum coaching a small-group class in the gym" aspect="aspect-square" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Meet Hallum ——— */}
      <Section tone="ink-mid">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <Folio number="02" label="Meet Hallum" />
            <H2 className="mt-6">The story <span className="display-italic font-medium text-flame">behind Gain.</span></H2>
            <div className="mt-8">
              <Photo
                src={HALLUM.photo}
                alt="Hallum Cousins, founder of Gain Strength Therapy"
                aspect="aspect-[4/5]"
                tone="warm"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
            </div>
            <div className="mt-4 md:mt-6">
              <Photo
                src={IMAGES.hallumHospital}
                alt="Hallum in hospital in 2020, recovering from surgery on his ruptured ACL and meniscus"
                aspect="aspect-[4/5]"
                tone="cool"
                caption="2020 — days after surgery on a ruptured ACL and meniscus, a month before lockdown closed every gym."
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
                the hardest times of my life, going from being very active to
                not being able to walk, in loads of pain, on top of the
                isolation we all went through during lockdown.
              </p>
              <p>
                I was in the middle of my sport science degree, so I knew how
                to research the best methods for recovery. With no equipment
                available, I had to get creative to make sure I was progressing
                each week. This year-long journey saw me regain my leg strength,
                confidence and balance, and helped me appreciate the importance
                of physical strength for our mental health. Strength training
                every week means I can keep doing the things I love, and that is
                now my motivator.
              </p>
              <p>
                That experience taught me something crucial: getting stronger
                isn&rsquo;t just about looking good in the mirror; it&rsquo;s
                about being able to do what you love, for as long as you can.
              </p>
            </div>

            <Rule tone="paper" className="my-10" />

            <div className="space-y-6 text-[1.05rem] text-paper/80 leading-[1.72] prose-body">
              <p>
                During my master&rsquo;s degree, I worked as a personal trainer
                in a commercial gym. I saw how many people were struggling with
                injuries, pain, or health conditions, and how lost they felt
                trying to manage them. Most just needed to get stronger, move
                better, and learn to exercise in a way that worked for their
                body. That became my focus.
              </p>
              <p>
                When I got the opportunity to open a small gym studio, I
                couldn&rsquo;t turn it down. I wanted to create a space for
                people who found big gyms intimidating. Somewhere I could use my
                expertise to help improve their health in a safe,
                non-judgmental environment.
              </p>
              <p>
                That&rsquo;s what Gain is. A place where someone actually cares
                whether you get better. Where the approach is gradual,
                personalised, and pressure-free.
              </p>
            </div>

          </div>
        </div>

        {/* Credentials — full width across the section */}
        <div className="mt-12 md:mt-16 grid sm:grid-cols-3 gap-5">
          <div className="border border-ink-line bg-ink-soft p-5">
            <div className="flex items-center gap-3 text-flame mb-3">
              <GraduationCap size={18} />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">Education</span>
            </div>
            <p className="text-paper text-[1.0625rem] leading-relaxed">
              <strong className="font-semibold">MSc Sport Physiology</strong>,
              University of Brighton
            </p>
            <p className="mt-1 text-paper/65 text-base leading-relaxed">
              BSc Sports Science, University of Bath
            </p>
          </div>

          <div className="border border-ink-line bg-ink-soft p-5">
            <div className="flex items-center gap-3 text-flame mb-3">
              <Trophy size={18} />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">Experience</span>
            </div>
            <p className="text-paper text-[1.0625rem] leading-relaxed">
              <strong className="font-semibold">5 years of coaching experience</strong>
            </p>
          </div>

          <div className="border border-ink-line bg-ink-soft p-5">
            <div className="flex items-center gap-3 text-flame mb-3">
              <Stethoscope size={18} />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">Coaching</span>
            </div>
            <p className="text-paper text-[1.0625rem] leading-relaxed">
              Qualified personal trainer. Specialist focus on
              post-rehabilitation progression, chronic conditions, and
              strength for life after 40.
            </p>
          </div>
        </div>
      </Section>

      {/* ——— Pull quote ——— */}
      <Section tone="flame" containerClass="!py-28 md:!py-36">
        <div className="max-w-4xl">
          <PullQuote
            quote="Getting stronger isn't just about looking good in the mirror; it's about being able to do what you love, for as long as you can."
            attribution="Hallum Cousins, Founder"
            tone="ink"
          />
        </div>
      </Section>

      {/* ——— Facilities ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4">
            <Folio number="03" label="Facilities" />
            <H2 className="mt-6">The gym &amp; <span className="display-italic font-medium text-flame">the studio.</span></H2>
            <p className="mt-6 text-paper/70 text-[1.0625rem] leading-relaxed">
              Two spaces under one roof in Eastbourne: a fully-equipped
              strength gym, and a softer studio for the quieter work.
            </p>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
            <div>
              <Photo src={IMAGES.gymWide} alt="The Gain gym floor and equipment" aspect="aspect-[4/5]" sizes="(min-width: 1024px) 30vw, 100vw" />
              <h3 className="display-tight text-xl text-paper mt-4">The gym</h3>
              <p className="mt-2 text-paper/65 text-base leading-relaxed">
                Small-group personal training, never more than six per session.
                Power racks, free weights, cables and more.
              </p>
            </div>
            <div>
              <Photo src={IMAGES.studioYoga} alt="The Gain studio set up for yoga and mobility work" aspect="aspect-[4/5]" tone="warm" sizes="(min-width: 1024px) 30vw, 100vw" />
              <h3 className="display-tight text-xl text-paper mt-4">The studio</h3>
              <p className="mt-2 text-paper/65 text-base leading-relaxed">
                A softer room with natural light, available to hire for yoga,
                mobility and recovery work.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Programmes ——— */}
      <Section tone="ink">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4">
            <Folio number="04" label="Programmes" />
            <H2 className="mt-6">Two ways to <span className="display-italic font-medium text-flame">start training.</span></H2>
            <p className="mt-6 text-paper/70 text-[1.0625rem] leading-relaxed">
              Every member starts with a structured strength programme, run as
              small-group personal training with never more than six in the room.
            </p>
            <div className="mt-8">
              <CTAButton href="/contact" variant="primary">
                Book a consultation
              </CTAButton>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="border border-ink-line bg-ink-soft p-7 transition-all duration-300 hover:border-flame/50 hover:bg-ink-mid">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame">Start here</span>
                <h3 className="display-tight text-2xl text-paper mt-3">6-week start</h3>
                <p className="mt-3 text-paper/70 text-base leading-relaxed">
                  A focused block to learn the lifts, build the habit, and feel
                  real strength gains. The easiest way to test how we work.
                </p>
              </div>
              <div className="border border-ink-line bg-ink-soft p-7 transition-all duration-300 hover:border-flame/50 hover:bg-ink-mid">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-flame">Full transformation</span>
                <h3 className="display-tight text-2xl text-paper mt-3">12-week transformation</h3>
                <p className="mt-3 text-paper/70 text-base leading-relaxed">
                  Three phases that take you from learning the lifts to
                  consolidating real, measurable strength. The deepest change
                  and best value per session.
                </p>
              </div>
            </div>
            <p className="mt-5 border-l-2 border-flame/60 pl-4 text-paper/65 text-base leading-relaxed">
              When your programme ends, you can keep training on a rolling
              monthly membership: same sessions, no fixed contract, cancel
              anytime.
            </p>
          </div>
        </div>
      </Section>

      <FinalCTA
        body="If you haven't found a gym that you feel comfortable enough to keep going, book a consultation with us. We'll talk through your situation, show you the space and work out whether Gain is right for you."
      />
    </>
  );
}
