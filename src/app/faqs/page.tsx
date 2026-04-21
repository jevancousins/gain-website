import type { Metadata } from "next";
import { Section, H2, Lede, FinalCTA } from "@/components/ui";
import { Folio, Kicker, Rule } from "@/components/editorial";

export const metadata: Metadata = { title: "FAQs" };

const FAQS = [
  { q: "What happens after I fill in the form?", a: "Hallum will call you for a short, no-pressure conversation. If it sounds like a fit, you'll be invited into the studio for an in-person consultation." },
  { q: "I haven't trained in years. Will I cope?", a: "Yes. Most people walk in feeling exactly the same. We start where you are, not where we wish you were." },
  { q: "How many people are in a session?", a: "Four to six. Enough for atmosphere, few enough that your coach sees every rep." },
  { q: "Will I be the oldest person there?", a: "Almost certainly not. Our members span a wide age range — most are somewhere in their 30s to 60s, a mix of still-working and retired, and plenty walked in having never set foot in a gym before." },
  { q: "I have an injury. Can I still train?", a: "Usually yes, and often training helps. Tell us about it on the call — if we're not the right place for you, we'll say so honestly." },
  { q: "How long until I see results?", a: "Most members feel stronger within 2–3 weeks and see visible change over the first couple of months. The bigger shifts — confidence, posture, being pain-free — tend to land between months 3 and 6." },
  { q: "Do you do 1-to-1 sessions?", a: "We do, but most people get better results from small-group sessions at a fraction of the cost. We'll talk you through what makes sense." },
  { q: "Is there a contract?", a: "No. Memberships are month-to-month with no lock-in." },
  { q: "What should I wear?", a: "Whatever you'd wear for a walk. Trainers, something comfortable. No special kit needed." },
  { q: "Is there parking at the studio?", a: "No — the studio is near Eastbourne town centre and there is no on-site parking. On-street parking is available on surrounding roads but can fill up, so arrive a few minutes early." },
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
