import type { Metadata } from "next";
import { Section, H2, Lede, FinalCTA } from "@/components/ui";
import { Folio, Kicker, Rule } from "@/components/editorial";

export const metadata: Metadata = { title: "FAQs" };

const FAQS = [
  { q: "What happens after I fill in the form?", a: "We'll call you for a short, no-pressure conversation. If it sounds like a fit, you'll be invited into the studio for an in-person consultation." },
  { q: "Which programme should I start with?", a: "Most people start with the 6-Week Transformation. It is the easiest way to see how we work and to feel real progress before committing to a longer block. If you already know you want a full transformation, the 12-Week is better value per session and goes deeper. We talk it through on the call." },
  { q: "I haven't trained in years. Will I cope?", a: "Yes. Most people walk in feeling exactly the same. We start where you are, not where we wish you were." },
  { q: "How many people are in a session?", a: "Up to six. Enough for atmosphere, few enough that your coach sees every rep." },
  { q: "Will I be the oldest person there?", a: "Almost certainly not. Our members span a wide age range. Most are somewhere in their 30s to 60s, a mix of still-working and retired, and plenty walked in having never set foot in a gym before." },
  { q: "I have an injury or a medical condition. Can I still train?", a: "Usually yes, and often training helps. We work regularly with members managing post-surgical recovery, chronic back pain, type 2 diabetes, osteoarthritis, osteoporosis, and long COVID. Tell us about it on the call. If we are not the right place for you, we will say so honestly." },
  { q: "How long until I see results?", a: "Members on the 6-Week typically see strength gains of 20 to 50 percent in their tracked lift. On the 12-Week the range is 30 to 100 percent. Most people feel stronger within 2 to 3 weeks. The bigger shifts in confidence, posture, and being pain-free tend to land between months 3 and 6." },
  { q: "Do you do 1-to-1 personal training?", a: "Yes. Single sessions are £50, with packs at £180 for 4 sessions and £320 for 8. Most members get better results from small-group sessions at a fraction of the cost, but 1-to-1 is available if a private setting suits you better or you have very specific goals." },
  { q: "Is there a contract?", a: "Programmes are paid in full upfront, with the option to split into instalments. Ongoing membership after that is rolling monthly with no long lock-in." },
  { q: "What should I wear?", a: "Whatever you'd wear for a walk. Trainers, something comfortable. No special kit needed." },
  { q: "Is there parking at the studio?", a: "No. The studio is near Eastbourne town centre and there is no on-site parking. On-street parking is available on surrounding roads but can fill up, so arrive a few minutes early." },
];

export default function FaqsPage() {
  return (
    <>
      <section className="relative bg-ink">
        <div className="border-b border-paper/10">
          <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6 flex-wrap">
            <Folio number="01" label="Frequently asked" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/55">
              Before you book
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-16">
          <div className="max-w-3xl">
            <Kicker>Questions, answered</Kicker>
            <H2 as="h1" className="mt-6 text-[clamp(3rem,7vw,6rem)]">
              The things people ask
              <span className="display-italic font-medium text-flame"> before they come in.</span>
            </H2>
            <Lede className="mt-8">
              Can&rsquo;t find your question? Ask on the call or drop us an
              email &mdash; we&rsquo;d rather answer than leave you wondering.
            </Lede>
          </div>
        </div>
      </section>

      <Section tone="ink" containerClass="!pt-6">
        <div className="max-w-4xl mx-auto">
          <Rule tone="paper" />
          <div className="divide-y divide-ink-line">
            {FAQS.map((f, i) => (
              <details key={f.q} className="group py-7">
                <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                  <span className="flex items-start gap-5 flex-1">
                    <span className="display text-lg text-flame font-black tabular-nums pt-1.5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="display-tight text-xl md:text-2xl text-paper leading-[1.2]">{f.q}</span>
                  </span>
                  <span className="display text-flame text-3xl transition-transform group-open:rotate-45 shrink-0 leading-none">+</span>
                </summary>
                <p className="mt-5 ml-10 text-paper/70 leading-[1.7] max-w-2xl">{f.a}</p>
              </details>
            ))}
          </div>
          <Rule tone="paper" />
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
