import type { Metadata } from "next";
import { Section, H2, CTAButton, Lede } from "@/components/ui";
import { Folio, Kicker, Rule } from "@/components/editorial";
import { Photo } from "@/components/photo";
import { cn, IMAGES, SITE, REVIEWS } from "@/lib/utils";
import {
  Download,
  BookOpen,
  Dumbbell,
  Moon,
  Utensils,
  Lock,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Members Portal",
  description:
    "Exclusive resources, programme notes, and content for Gain Strength Therapy members.",
  robots: { index: false, follow: false },
};

/* ——— Data ——— */

const RESOURCES = [
  {
    title: "At-home mobility guide",
    description:
      "A guided sequence for rest days or at home. Hip flexors, thoracic rotation, and hamstring work — around 15 minutes.",
    href: "/media/at-home-mobility-guide.pdf",
    available: true,
    icon: <Download size={18} />,
  },
  {
    title: "Nutrition guide",
    description:
      "Eating to support strength training in your 40s and beyond. Protein targets, meal timing, and what actually matters.",
    href: null,
    available: false,
    icon: <Utensils size={18} />,
  },
  {
    title: "Progress tracker",
    description:
      "A simple template for logging your lifts and tracking how you are moving forward each month.",
    href: null,
    available: false,
    icon: <BookOpen size={18} />,
  },
];

const MOVEMENTS = [
  {
    label: "Hip hinge",
    photo: IMAGES.gymMemberHipHinge,
    photoAlt: "Member performing a Romanian deadlift with correct form",
    cues: [
      "Push your hips back — not down. Keep a soft bend in your knees throughout.",
      "The bar or weight stays close to your legs. If it drifts forward, your back does the work.",
      "You should feel a stretch in the back of your thighs, not a strain in your lower back.",
      "Drive your hips forward to stand. Squeeze at the top before the next rep.",
    ],
  },
  {
    label: "Squat",
    photo: IMAGES.gymMemberDumbbellLunge,
    photoAlt: "Member performing a dumbbell lower body exercise with good form",
    cues: [
      "Feet roughly shoulder-width. Toes can point out slightly — find what feels natural.",
      "Sit between your heels, not back onto them. Your weight should stay through your whole foot.",
      "Chest stays up throughout. If it drops, the weight is too heavy or your thoracic is tight.",
      "Drive the floor away from you as you stand. Think 'push the ground down'.",
    ],
  },
  {
    label: "Push",
    photo: IMAGES.gymMemberFloorPushup,
    photoAlt: "Members performing press-ups at different levels of difficulty",
    cues: [
      "Hands just wider than shoulder-width. Fingers point forward or slightly out.",
      "Elbows track at roughly 45 degrees — not flared wide, not tucked tight.",
      "Lower for 2–3 seconds. Press back in one controlled motion.",
      "Your body makes a plank from head to heel the whole time. Don't let your hips sag.",
    ],
  },
  {
    label: "Pull",
    photo: IMAGES.gymMemberCable,
    photoAlt: "Member performing a cable pull exercise",
    cues: [
      "Start with arms fully extended before each rep. Don't shortchange the range.",
      "Row by driving your elbows back — don't shrug your shoulders up.",
      "Shoulder blades come together at the end of the movement.",
      "Control the return. The eccentric (lowering) phase is where a lot of the work happens.",
    ],
  },
];

const RECOVERY = [
  {
    icon: <Moon size={18} />,
    title: "Sleep",
    body: "Strength adaptations happen during sleep, not during the session. Seven to nine hours is where the research consistently sits. If that is not realistic most nights, prioritise consistency in training over chasing volume.",
  },
  {
    icon: <Utensils size={18} />,
    title: "Protein",
    body: "Aim for roughly 1.6 to 2.0 grams of protein per kilogram of bodyweight each day — the higher end if you are in your 50s or 60s, where muscle protein synthesis needs more stimulus. Spread it across meals rather than front-loading into one.",
  },
  {
    icon: <Dumbbell size={18} />,
    title: "Rest days",
    body: "Rest days are part of the programme, not gaps in it. Light walking, the mobility guide, or simply doing nothing are all correct choices. You do not need to compensate for a missed session with extra effort the next day.",
  },
  {
    icon: <AlertCircle size={18} />,
    title: "Soreness",
    body: "Delayed onset muscle soreness peaks around 24–48 hours after training. Light movement helps it clear faster than staying still. If something feels sharp, is asymmetrical, or has not improved by day three — message Hallum before the next session.",
  },
];

const WINS = [
  {
    photo: IMAGES.gainSignTwoFemaleMembers,
    alt: "Two members celebrating together at the GAIN sign",
    caption: "Six months in.",
  },
  {
    photo: IMAGES.gainSignMemberPose,
    alt: "Senior male member posing proudly at the GAIN sign",
    caption: "First deadlift at 68.",
  },
  {
    photo: IMAGES.gymHallumMemberProgress,
    alt: "Hallum and a member holding a progress sign",
    caption: "From back pain to pain-free.",
  },
  {
    photo: IMAGES.gainSignGroup,
    alt: "Hallum and four members together at the GAIN sign",
    caption: "The Tuesday 18:00 crew.",
  },
];

/* ——— Page ——— */

export default function MembersPage() {
  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Members portal" />
            <span className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/45">
              <Lock size={10} />
              Members only
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <Kicker>Welcome back</Kicker>
              <h1 className="display mt-6 text-[clamp(2.75rem,8vw,7.5rem)] text-paper leading-[1.0]">
                Your space<span className="text-flame">.</span>
              </h1>
              <Lede className="mt-8">
                Your guides, programme notes, and resources — all in one place.
                Updated each month.
              </Lede>

              {/* Quick-nav */}
              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { href: "#resources", label: "Resources" },
                  { href: "#programme", label: "Programme" },
                  { href: "#exercises", label: "Exercises" },
                  { href: "#recovery", label: "Recovery" },
                  { href: "#wins", label: "Member wins" },
                  { href: "#contact", label: "Ask Hallum" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center rounded-full border border-paper/15 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-paper/65 hover:border-flame/40 hover:text-flame transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <Photo
                src={IMAGES.gymGroupSession}
                alt="Members training together at Gain"
                aspect="aspect-[4/3]"
                sizes="(min-width: 1024px) 35vw, 0px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ——— 01 · YOUR RESOURCES ——— */}
      <Section tone="ink-soft" id="resources">
        <Folio number="01" label="Your resources" />
        <H2 className="mt-6">
          Download and keep<span className="text-flame">.</span>
        </H2>
        <p className="mt-6 text-paper/70 text-[1.0625rem] leading-relaxed max-w-2xl">
          Produced specifically for Gain members. More guides are added as they
          are ready — check back each month.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {RESOURCES.map((r) => (
            <article
              key={r.title}
              className={cn(
                "flex flex-col gap-6 border p-7 md:p-8 h-full",
                r.available
                  ? "bg-ink border-ink-line hover:border-flame/50 transition-colors"
                  : "bg-ink-soft/50 border-ink-line opacity-55"
              )}
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center border border-paper/15 text-flame">
                  {r.icon}
                </span>
                {!r.available && (
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-paper/40 border border-paper/15 px-2.5 py-1">
                    Coming soon
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="display-tight text-[1.3rem] text-paper leading-[1.2]">
                  {r.title}
                </h3>
                <p className="mt-3 text-paper/60 text-[0.95rem] leading-relaxed">
                  {r.description}
                </p>
              </div>
              {r.available && r.href && (
                <a
                  href={r.href}
                  download
                  className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-flame hover:text-paper transition-colors"
                >
                  <Download size={13} />
                  Download PDF
                </a>
              )}
            </article>
          ))}
        </div>
      </Section>

      {/* ——— 02 · THIS MONTH'S PROGRAMME ——— */}
      <Section tone="ink" id="programme">
        <Folio number="02" label="This month" />
        <H2 className="mt-6">
          June
          <span className="text-flame"> — </span>
          <span className="display-italic font-medium">
            Hip hinge &amp; progressive loading.
          </span>
        </H2>

        <div className="mt-14 grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: programme notes */}
          <div className="lg:col-span-7 space-y-10">
            <div>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame mb-5">
                This month&rsquo;s focus
              </h3>
              <p className="text-paper/80 text-[1.0625rem] leading-relaxed">
                June is built around hip hinge patterns — Romanian deadlifts,
                hip thrusts, and single-leg work. If you have been coming
                consistently over the past month, you will notice we are
                progressing the load on movements your body has already learned.
                If you are newer, the first two weeks are about building the
                pattern before we add weight.
              </p>
              <p className="mt-5 text-paper/80 text-[1.0625rem] leading-relaxed">
                The other thread running through June is asymmetry. Lunges and
                split squats appear in most sessions. The difference you notice
                between your left and right side is normal and is exactly what
                we are working on — do not compensate by leaning or rushing the
                weaker side.
              </p>
            </div>

            <Rule tone="paper" />

            <div>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame mb-7">
                Key exercises this month
              </h3>
              <ul className="divide-y divide-ink-line">
                {[
                  [
                    "Romanian Deadlift",
                    "Primary hip hinge. Building posterior chain strength and length.",
                  ],
                  [
                    "Hip Thrust",
                    "Glute development and pelvis stability. Heavy by week three.",
                  ],
                  [
                    "Split Squat / Lunge",
                    "Single-leg strength and balance. Left-right symmetry work.",
                  ],
                  [
                    "Kettlebell Swing",
                    "Power endurance finisher. Introduced in weeks three and four.",
                  ],
                ].map(([exercise, desc]) => (
                  <li
                    key={exercise}
                    className="flex items-start gap-5 py-5 first:pt-0 last:border-0"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-flame shrink-0 mt-[0.6rem]" />
                    <div>
                      <span className="display-tight text-[1.1rem] text-paper leading-none">
                        {exercise}
                      </span>
                      <span className="block text-paper/50 text-sm mt-1.5 leading-relaxed">
                        {desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: schedule + photo */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-ink-line p-6 md:p-8">
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame mb-7">
                Session schedule
              </h3>
              <dl className="divide-y divide-ink-line">
                {[
                  ["Monday", "09:15 · 18:00"],
                  ["Tuesday", "18:00"],
                  ["Wednesday", "18:00"],
                  ["Thursday", "18:00"],
                  ["Friday", "18:00"],
                  ["Saturday", "09:15"],
                  ["Sunday", "Closed"],
                ].map(([day, time]) => (
                  <div
                    key={day}
                    className="flex justify-between items-baseline py-3 first:pt-0 last:border-0"
                  >
                    <dt className="text-paper/60 text-sm">{day}</dt>
                    <dd
                      className={cn(
                        "text-sm tabular-nums",
                        time === "Closed" ? "text-paper/30" : "text-paper"
                      )}
                    >
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-paper/40 text-xs leading-relaxed border-t border-ink-line pt-5">
                Plus early morning slots on selected weekdays. Book and manage
                your sessions through TeamUp.
              </p>
            </div>

            <Photo
              src={IMAGES.gymHallumBoxStepup}
              alt="Hallum coaching a member through a box step-up"
              aspect="aspect-[4/3]"
              sizes="(min-width: 1024px) 30vw, 85vw"
            />
          </div>
        </div>
      </Section>

      {/* ——— 03 · EXERCISE LIBRARY ——— */}
      <Section tone="ink-soft" id="exercises">
        <Folio number="03" label="Exercise library" />
        <H2 className="mt-6">
          Four movement patterns<span className="text-flame">.</span>
        </H2>
        <p className="mt-6 text-paper/70 text-[1.0625rem] leading-relaxed max-w-2xl">
          Almost every exercise in a Gain session is a variation of one of these
          four patterns. Get these cues into your body and the rest follows.
        </p>

        <div className="mt-14 divide-y divide-ink-line border-t border-ink-line">
          {MOVEMENTS.map((m, i) => (
            <div
              key={m.label}
              className="py-12 grid md:grid-cols-12 gap-8 items-start"
            >
              {/* Index + label */}
              <div className="md:col-span-3">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame">
                  0{i + 1}
                </span>
                <h3 className="display text-3xl md:text-4xl text-paper mt-3 leading-[1.02]">
                  {m.label}
                </h3>
              </div>

              {/* Cues */}
              <div className="md:col-span-5 space-y-4">
                {m.cues.map((cue, j) => (
                  <div key={j} className="flex gap-4 items-start">
                    <span className="text-flame text-xs font-bold tabular-nums shrink-0 mt-[3px]">
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <p className="text-paper/75 text-[1rem] leading-relaxed">
                      {cue}
                    </p>
                  </div>
                ))}
              </div>

              {/* Photo */}
              <div className="md:col-span-4">
                <Photo
                  src={m.photo}
                  alt={m.photoAlt}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 768px) 25vw, 85vw"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ——— 04 · BETWEEN SESSIONS ——— */}
      <Section tone="ink" id="recovery">
        <Folio number="04" label="Between sessions" />
        <H2 className="mt-6">
          What happens away from
          <br />
          <span className="display-italic font-medium text-flame">
            the gym matters too.
          </span>
        </H2>
        <p className="mt-6 text-paper/70 text-[1.0625rem] leading-relaxed max-w-2xl">
          The session creates the stimulus. Sleep, protein, and how you move on
          rest days is where the adaptation actually happens.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {RECOVERY.map((r) => (
            <div
              key={r.title}
              className="bg-ink-soft border border-ink-line p-7 md:p-8"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center border border-paper/15 text-flame mb-6">
                {r.icon}
              </span>
              <h3 className="display-tight text-xl text-paper">{r.title}</h3>
              <p className="mt-4 text-paper/65 text-[1.0rem] leading-relaxed">
                {r.body}
              </p>
            </div>
          ))}
        </div>

        {/* Mobility CTA */}
        <div className="mt-10 border border-flame/20 bg-flame/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex-1">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame">
              Rest day recommendation
            </span>
            <p className="mt-2 text-paper/80 text-[1.0rem] leading-relaxed">
              The at-home mobility guide takes about 15 minutes and targets the
              areas that get tight between sessions — hip flexors, thoracic
              spine, and hamstrings.
            </p>
          </div>
          <a
            href="/media/at-home-mobility-guide.pdf"
            download
            className="inline-flex items-center gap-3 rounded-sm bg-flame text-ink px-6 py-4 text-[0.78rem] font-bold uppercase tracking-[0.2em] hover:bg-flame-deep transition-colors shrink-0"
          >
            <Download size={14} />
            Get the guide
          </a>
        </div>
      </Section>

      {/* ——— 05 · MEMBER WINS ——— */}
      <Section tone="flame" containerClass="!py-16 md:!py-24" id="wins">
        <div className="mb-12">
          <Folio number="05" label="Member wins" tone="ink" />
          <H2
            className="mt-6 !text-ink"
            as="h2"
          >
            Your progress<span className="text-ink/60"> is the point.</span>
          </H2>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {WINS.map((w) => (
            <figure key={w.caption}>
              <Photo
                src={w.photo}
                alt={w.alt}
                aspect="aspect-[3/4]"
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 45vw"
              />
              <figcaption className="mt-3 text-sm font-medium text-ink/65">
                {w.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Reviews on flame */}
        <div className="h-px bg-ink/15 my-14" />

        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.slice(0, 3).map((r) => (
            <figure
              key={r.author}
              className="bg-ink/8 border border-ink/10 p-6 flex flex-col"
            >
              <blockquote className="display-tight text-[1.15rem] md:text-[1.25rem] text-ink leading-[1.3] flex-1">
                &ldquo;{r.text}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between border-t border-ink/15 pt-5">
                <span className="text-sm font-semibold text-ink">
                  {r.author}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-ink/55">
                  Google
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* ——— 06 · ASK HALLUM ——— */}
      <Section tone="ink-soft" id="contact">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 lg:col-span-5">
            <Folio number="06" label="Ask Hallum" />
            <H2 className="mt-6">
              Something on
              <br />
              your mind<span className="text-flame">?</span>
            </H2>
            <p className="mt-6 text-paper/70 text-[1.0625rem] leading-relaxed">
              Pain in a session, unsure about your form, want to change your
              schedule — just ask. There is no threshold for what is worth
              mentioning.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <CTAButton
                href={`tel:${SITE.phoneHref}`}
                variant="primary"
                icon="none"
              >
                Call or text
              </CTAButton>
              <CTAButton
                href="/contact"
                variant="ghost"
              >
                Send a message
              </CTAButton>
            </div>
          </div>

          <div className="hidden md:block md:col-span-6 lg:col-span-6 lg:col-start-7">
            <Photo
              src={IMAGES.gymStretching}
              alt="Hallum and a senior member stretching and talking together in the gym"
              aspect="aspect-[4/3]"
              sizes="(min-width: 768px) 40vw, 0px"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
