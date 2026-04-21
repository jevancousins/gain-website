import type { Metadata } from "next";
import { Section } from "@/components/ui";
import { Folio, Kicker, Rule } from "@/components/editorial";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Gain Strength Therapy collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <Section tone="ink">
      <div className="max-w-3xl">
        <Folio number="98" label="Legal" />
        <Kicker className="mt-6">Privacy policy</Kicker>
        <h1 className="display mt-4 text-4xl md:text-5xl text-paper">
          How we handle your information.
        </h1>
        <p className="mt-4 text-sm text-paper/55 italic">Last updated: 20/07/2024</p>
        <Rule tone="paper" className="mt-10 mb-10" />

        <div className="space-y-10 text-paper/80 leading-[1.75] prose-body">
          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">1. Information we collect</h2>
            <p>
              We may collect the following types of personal information:
            </p>
            <ul className="mt-4 space-y-2 list-disc pl-5 marker:text-flame">
              <li><strong>Personal identification information:</strong> name, email address, phone number, date of birth.</li>
              <li><strong>Health and fitness data:</strong> information you share so we can train you safely.</li>
              <li><strong>Payment information</strong> where relevant.</li>
              <li><strong>Usage data</strong> from your interactions with our website.</li>
              <li><strong>Cookies and tracking technologies</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">2. How we use your information</h2>
            <p>We use your data to:</p>
            <ul className="mt-4 space-y-2 list-disc pl-5 marker:text-flame">
              <li>provide and personalise our services,</li>
              <li>process transactions,</li>
              <li>communicate with you,</li>
              <li>improve our services, and</li>
              <li>comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">3. Legal basis for processing</h2>
            <p>
              We process your personal data under one or more of the following lawful bases: your consent, contractual necessity, legal obligation, or legitimate interests where the processing is necessary for our legitimate interests.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">4. Sharing your information</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your data with service providers that support our business, where legally required, or in the course of a business transfer.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">5. Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute protection.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">6. Your rights</h2>
            <p>
              Under UK GDPR and the Data Protection Act 2018 you have the right to: access, rectification, erasure, restriction of processing, data portability, objection, and consent withdrawal. To exercise these rights, contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">7. Cookies</h2>
            <p>
              Our website uses cookies and similar technologies. You can manage your preferences through your browser.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">8. Third-party links</h2>
            <p>
              Our website may contain links to third-party websites. Their privacy practices are their own &mdash; we recommend reviewing their policies separately.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">9. Children&rsquo;s privacy</h2>
            <p>
              Our services are not directed at children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">10. Updates to this policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be posted on this page.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-4">11. Contact &amp; complaints</h2>
            <p>
              Questions or complaints about our use of your personal information? Contact us:
            </p>
            <address className="not-italic mt-4 text-paper">
              Gain Strength Therapy<br />
              {SITE.address.line1}, {SITE.address.city} {SITE.address.postcode}<br />
              {SITE.phone}
            </address>
            <p className="mt-4">
              You also have the right to lodge a complaint with the UK&rsquo;s Information Commissioner&rsquo;s Office (ICO).
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
