import type { Metadata } from "next";
import Link from "next/link";
import { Section, H2, CTAButton, FinalCTA, Lede } from "@/components/ui";
import { Photo } from "@/components/photo";
import { LoopVideo } from "@/components/loop-video";
import { Folio, Kicker, Rule, Caption } from "@/components/editorial";
import { IMAGES, VIDEOS, SITE } from "@/lib/utils";
import { MapPin, Train, Car } from "lucide-react";

export const metadata: Metadata = {
  title: "Facilities",
  description:
    "Inside the Gain Strength Therapy facility in Eastbourne — a fully-equipped gym that hosts small-group personal training, a studio for mobility and yoga, and an infrared sauna with cold plunge.",
};

export default function FacilitiesPage() {
  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Facilities" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              Dursley Road · Eastbourne
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <Kicker>Three spaces, one roof</Kicker>
              <h1 className="display mt-6 text-[clamp(3rem,8vw,7.5rem)] text-paper">
                Gym. Studio.
                <span className="block display-italic font-medium text-flame">Sauna.</span>
              </h1>
              <Lede className="mt-10">
                A small private facility near Eastbourne town centre. The gym
                is the heart of it &mdash; that&rsquo;s where small-group
                personal training classes run, led by an instructor with up
                to six members at a time. The studio and sauna sit alongside
                for everything else.
              </Lede>
              <div className="mt-8 flex flex-wrap gap-3">
                <CTAButton href="/contact" variant="primary">Enquire now</CTAButton>
                <CTAButton href="#gym" variant="ghost">Take the tour</CTAButton>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Photo
                src={IMAGES.gymStretching}
                alt="Hallum coaching a member through a warm-up stretch in the gym"
                aspect="aspect-[4/5]"
                priority
                tone="warm"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <Caption>Photographed in the gym, Dursley Road.</Caption>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Mosaic strip: one image per area + one video ——— */}
      <section className="bg-ink-soft py-8">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            <Photo src={IMAGES.gymWide} alt="The gym floor at Gain" aspect="aspect-[4/5]" />
            <LoopVideo
              src720={VIDEOS.facilityA.src720}
              src1080={VIDEOS.facilityA.src1080}
              poster={IMAGES.gymLunges}
              alt="Training footage from the gym"
              aspect="aspect-[4/5]"
            />
            <Photo src={IMAGES.studioYoga} alt="The studio set up for a mat session" aspect="aspect-[4/5]" />
            <Photo src={IMAGES.saunaPlungeWide} alt="The sauna and cold plunge room" aspect="aspect-[4/5]" />
          </div>
        </div>
      </section>

      {/* ——— 01 · THE GYM (primary — where small-group PT classes happen) ——— */}
      <Section tone="ink" id="gym">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3">
                <Photo
                  src={IMAGES.gymBoxCoaching}
                  alt="Hallum coaching a member on the box step-up in the gym"
                  aspect="aspect-[4/5]"
                  sizes="(min-width: 1024px) 30vw, 60vw"
                />
              </div>
              <div className="col-span-2 pt-16">
                <LoopVideo
                  src720={VIDEOS.facilityA.src720}
                  src1080={VIDEOS.facilityA.src1080}
                  poster={IMAGES.gymStretching}
                  alt="Training footage from the gym floor"
                  aspect="aspect-[4/6]"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-4">
              <div className="col-span-3">
                <Photo
                  src={IMAGES.gymGroupClass}
                  alt="A small-group personal training class in the gym"
                  aspect="aspect-[5/4]"
                  sizes="(min-width: 1024px) 30vw, 60vw"
                />
              </div>
              <div className="col-span-2">
                <Photo
                  src={IMAGES.gymLunges}
                  alt="Members doing lunges in the gym"
                  aspect="aspect-square"
                  sizes="(min-width: 1024px) 20vw, 40vw"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <Folio number="01" label="The Gym" />
            <H2 className="mt-6">Small-group personal training &mdash; the heart of Gain.</H2>
            <p className="mt-6 text-paper/75 leading-[1.72] text-[1.05rem]">
              The gym is where almost every session happens. Classes run as
              <strong className="text-paper font-semibold"> small-group personal training</strong>
              {" "}&mdash; an instructor leads the room, with up to six members
              training together. You get the eyes-on coaching of 1-to-1 work
              and the energy of training alongside other people. Cheaper than
              private sessions, more personal than a commercial gym class.
            </p>
            <Rule tone="paper" className="my-8 w-12" />
            <div className="mb-6 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-flame">
              What&rsquo;s on the floor
            </div>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-paper/75 text-[0.98rem]">
              {[
                "Power rack",
                "Adjustable bench",
                "Cable machine",
                "Dumbbells",
                "Kettlebells",
                "Box jumps",
                "Resistance bands",
                "Full free-weight set",
              ].map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="text-flame">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-paper/55 italic text-sm">
              A small space &mdash; deliberately. Six people, one coach,
              plenty of room to breathe.
            </p>
          </div>
        </div>
      </Section>

      {/* ——— 02 · THE STUDIO (secondary — softer space for yoga / mobility) ——— */}
      <Section tone="ink-soft" id="studio">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <Folio number="02" label="The Studio" />
            <H2 className="mt-6">A softer room, for the quieter work.</H2>
            <p className="mt-6 text-paper/75 leading-[1.72] text-[1.05rem]">
              A dedicated space next door to the gym, with a softer floor and
              natural light. We use it for yoga and mobility classes,
              recovery work, and the occasional 1-to-1 session that needs a
              quieter setting. Not where the strength work happens
              &mdash; that&rsquo;s the gym &mdash; but the perfect place for
              everything around it.
            </p>
            <Rule tone="paper" className="my-8 w-12" />
            <ul className="space-y-2.5 text-paper/75 text-[0.98rem]">
              {[
                "Yoga and mobility classes",
                "Recovery and breathwork sessions",
                "1-to-1 coaching in a quieter setting",
                "Softer floor, natural light",
              ].map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="text-flame">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3">
                <Photo
                  src={IMAGES.studioYoga}
                  alt="The studio set up with yoga mats and singing bowls"
                  aspect="aspect-[4/5]"
                  tone="warm"
                  sizes="(min-width: 1024px) 30vw, 60vw"
                />
              </div>
              <div className="col-span-2 pt-16">
                <LoopVideo
                  src720={VIDEOS.facilityB.src720}
                  src1080={VIDEOS.facilityB.src1080}
                  poster={IMAGES.studioYoga}
                  alt="Footage from the studio"
                  aspect="aspect-[4/6]"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ——— 03 · SAUNA & COLD PLUNGE ——— */}
      <Section tone="ink" id="sauna">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3">
                <Photo
                  src={IMAGES.saunaPlungeWide}
                  alt="The wooden cold plunge and infrared sauna with night-sky mural"
                  aspect="aspect-[4/5]"
                  sizes="(min-width: 1024px) 30vw, 60vw"
                />
              </div>
              <div className="col-span-2 pt-16">
                <Photo
                  src={IMAGES.saunaPlungeClose}
                  alt="Close-up of the cold plunge tub"
                  aspect="aspect-square"
                  sizes="(min-width: 1024px) 20vw, 40vw"
                />
              </div>
            </div>
            <div className="mt-4">
              <Photo
                src={IMAGES.saunaCabin}
                alt="The infrared sauna cabin"
                aspect="aspect-[16/10]"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <Folio number="03" label="Sauna & Cold Plunge" />
            <H2 className="mt-6">Contrast therapy, on demand.</H2>
            <p className="mt-6 text-paper/75 leading-[1.72] text-[1.05rem]">
              A dedicated recovery corner at the studio &mdash; an infrared
              sauna for gentle, deep heat, and a cold plunge for the part
              you dread but always feel better after.
            </p>
            <Rule tone="paper" className="my-8 w-12" />
            <ul className="space-y-2.5 text-paper/75 text-[0.98rem]">
              {[
                "Infrared sauna — lower, drier heat than traditional sauna",
                "Cold plunge — temperature-controlled recovery",
                "Separate from membership — ask on your consultation",
              ].map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="text-flame">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ——— 04 · Find us ——— */}
      <Section tone="ink-soft">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <Folio number="04" label="Find us" />
            <H2 className="mt-6">{SITE.address.line1}</H2>
            <p className="mt-3 text-paper/75 text-lg">
              {SITE.address.city}, {SITE.address.postcode}
            </p>
            <p className="mt-6 text-paper/60 text-sm">
              Opening hours live on the{" "}
              <Link href="/contact" className="link-editorial text-paper">
                contact page
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-7">
            <Rule tone="paper" className="mb-8" />
            <ul className="space-y-5 text-paper/80 text-[0.98rem] leading-relaxed">
              <li className="flex gap-4">
                <Train size={18} className="text-flame shrink-0 mt-1" />
                <span>
                  <strong className="font-semibold text-paper">Near Eastbourne town centre.</strong>{" "}
                  Roughly a 15-minute walk from Eastbourne railway station.
                </span>
              </li>
              <li className="flex gap-4">
                <Car size={18} className="text-flame shrink-0 mt-1" />
                <span>
                  <strong className="font-semibold text-paper">On-street parking only.</strong>{" "}
                  There is no on-site parking &mdash; spaces on surrounding roads can fill up, so arrive a few minutes early.
                </span>
              </li>
              <li className="flex gap-4">
                <MapPin size={18} className="text-flame shrink-0 mt-1" />
                <span>
                  <strong className="font-semibold text-paper">Private facility.</strong>{" "}
                  Follow the signs once you&rsquo;re on Dursley Road.
                </span>
              </li>
            </ul>

            <div className="mt-10">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${SITE.address.line1}, ${SITE.address.city} ${SITE.address.postcode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold uppercase tracking-[0.22em] text-paper link-editorial"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </Section>

      <FinalCTA
        title="Come see the facility for yourself."
        body="Leave your details and we'll call you. If it sounds like a fit, we'll invite you in to see the studio and meet your coach."
      />
    </>
  );
}
