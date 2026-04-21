import type { Metadata } from "next";
import { Section } from "@/components/ui";
import { Folio, Kicker, Rule } from "@/components/editorial";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "The terms that govern your use of the Gain Strength Therapy website and services.",
};

export default function TermsPage() {
  return (
    <Section tone="ink">
      <div className="max-w-3xl">
        <Folio number="99" label="Legal" />
        <Kicker className="mt-6">Terms &amp; conditions</Kicker>
        <h1 className="display mt-4 text-4xl md:text-5xl text-paper">The house rules.</h1>
        <p className="mt-4 text-sm text-paper/55 italic">Last updated: 20/07/2024</p>
        <Rule tone="paper" className="mt-10 mb-10" />

        <div className="space-y-8 text-paper/80 leading-[1.75] prose-body">
          <p>
            Welcome to Gain. These terms and conditions outline the rules and regulations for the use of Gain&rsquo;s website and services. By accessing this website, you accept these terms and conditions in full. Do not continue to use Gain&rsquo;s website if you do not accept all of the terms and conditions stated on this page.
          </p>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">1. Definitions</h2>
            <ul className="space-y-1 list-disc pl-5 marker:text-flame">
              <li>&ldquo;Website&rdquo; refers to www.gainstrengththerapy.com.</li>
              <li>&ldquo;We&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo; refers to Gain.</li>
              <li>&ldquo;You&rdquo;, &ldquo;user&rdquo; refers to the person accessing or using our website and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">2. Use of the website</h2>
            <p>
              By accessing our website, you warrant and represent that you are at least 18 years old or have the necessary consent from a parent or guardian if you are under 18. You agree to use the website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&rsquo;s use and enjoyment of the website.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">3. Services</h2>
            <p>
              Gain offers personal training services, including but not limited to fitness programmes, nutritional advice, and personal training sessions. All services are subject to availability, and we reserve the right to modify or discontinue services at any time.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">4. User accounts</h2>
            <p>
              To access certain features of our website, you may be required to create an account. You agree to provide accurate, current, and complete information during registration and to keep it up to date. You are responsible for safeguarding your password and for any activities under your account. Notify us immediately of any unauthorised use.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">5. Payment and subscription</h2>
            <p>
              Some of our services require payment. You agree to provide accurate payment information and authorise us to charge the applicable fees. All fees are non-refundable unless otherwise stated. We reserve the right to change our fees at any time.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">6. Cancellation and refunds</h2>
            <p>
              You may cancel your subscription at any time through your account settings or by contacting us. Upon cancellation, you will continue to have access to the services until the end of your billing period. We do not offer refunds for any remaining portion of your subscription term.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">7. Health disclaimer</h2>
            <p>
              Gain is not a medical organisation, and our trainers cannot give you medical advice or diagnosis. All information provided by Gain is for informational purposes only and is not intended to substitute for professional medical advice, diagnosis, or treatment. You are advised to seek the advice of your physician or other qualified health provider before starting any fitness programme.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">8. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, Gain shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your use or inability to use our services; (b) any unauthorised access to or use of our servers and/or any personal information stored therein; (c) any bugs, viruses, trojan horses, or the like transmitted to or through our services by any third party; or (d) any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content posted, emailed, transmitted, or otherwise made available through the services.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Gain, its directors, officers, employees, consultants, agents, and affiliates from any third-party claims, liability, damages, and/or costs (including but not limited to legal fees) arising from your use of our website or services, your violation of these Terms and Conditions, or your infringement of any intellectual property or other right of any person or entity.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">10. Intellectual property</h2>
            <p>
              All content on the Gain website, including but not limited to text, graphics, logos, images, and software, is the property of Gain or its content suppliers and is protected by UK and international copyright laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">11. Privacy policy</h2>
            <p>
              Your use of the website is also governed by our Privacy Policy, which is incorporated into these Terms and Conditions by reference.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">12. Changes to terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Any changes will be effective immediately upon posting on our website. Your continued use of the website and services after any such changes constitutes your acceptance of the new Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">13. Governing law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="display-tight text-2xl text-paper mb-3">14. Contact us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <address className="not-italic mt-4 text-paper">
              Gain Strength Therapy<br />
              {SITE.address.line1}<br />
              {SITE.address.city}<br />
              {SITE.address.postcode}<br />
              {SITE.phone}
            </address>
          </section>
        </div>
      </div>
    </Section>
  );
}
