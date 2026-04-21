import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { SITE, IMAGES } from "@/lib/utils";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink-soft text-paper/85 mt-0 border-t border-ink-line">
      <div className="border-b border-ink-line">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-10 md:py-12 flex items-center justify-between gap-6 flex-wrap">
          <p className="display text-[clamp(1.75rem,3.5vw,3rem)] text-paper leading-[1.05]">
            Move better. Train smarter.
            <span className="text-flame"> </span>
            <span className="display-italic">Build lasting strength.</span>
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-sm bg-flame text-ink px-5 py-3 text-[0.78rem] font-bold uppercase tracking-[0.2em] hover:bg-flame-deep transition-colors shrink-0"
          >
            Enquire now
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-16 md:py-20 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="relative h-10 w-10">
              <Image src={IMAGES.logo} alt="" fill sizes="40px" className="object-contain brightness-0 invert opacity-90" />
            </span>
            <span className="display text-3xl font-black text-paper tracking-[-0.03em]">GAIN</span>
            <span className="text-[0.62rem] uppercase tracking-[0.26em] text-paper/55 pl-3 border-l border-paper/15">
              Strength Therapy
            </span>
          </div>
          <p className="mt-6 max-w-sm text-paper/65 leading-relaxed">
            A friendly, uplifting environment where you&rsquo;ll move better,
            train smarter, and build lasting strength. Private strength
            coaching in Eastbourne.
          </p>
          <div className="mt-7 flex gap-2">
            <Link href={SITE.social.instagram} aria-label="Instagram" className="p-2.5 border border-paper/15 hover:border-flame hover:text-flame transition-colors">
              <InstagramIcon />
            </Link>
            <Link href={SITE.social.facebook} aria-label="Facebook" className="p-2.5 border border-paper/15 hover:border-flame hover:text-flame transition-colors">
              <FacebookIcon />
            </Link>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/45">Visit</h4>
          <address className="not-italic mt-5 text-paper/80 leading-relaxed flex gap-3">
            <MapPin size={14} className="mt-1 shrink-0 text-flame" />
            <span>
              {SITE.address.line1}<br />
              {SITE.address.city}<br />
              {SITE.address.postcode}
            </span>
          </address>
          <div className="mt-5 space-y-2 text-sm text-paper/70">
            <a href={`tel:${SITE.phoneHref}`} className="flex items-center gap-2 hover:text-flame">
              <Phone size={13} /> {SITE.phone}
            </a>
            <Link href="/contact" className="flex items-center gap-2 hover:text-flame">
              <Mail size={13} /> Get in touch via the form →
            </Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/45">Explore</h4>
          <ul className="mt-5 space-y-2.5 text-paper/75 text-sm">
            <li><Link href="/about" className="link-quiet hover:text-paper">About</Link></li>
            <li><Link href="/facilities" className="link-quiet hover:text-paper">Facilities</Link></li>
            <li><Link href="/contact" className="link-quiet hover:text-paper">Enquire</Link></li>
            <li><Link href="/contact" className="link-quiet hover:text-paper">Contact</Link></li>
            <li><Link href="/contact" className="link-quiet hover:text-paper">Book</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-paper/45">Get in touch</h4>
          <p className="mt-5 text-paper/70 text-sm leading-relaxed">
            Every new member starts with a short phone call with Hallum. Leave your details and we&rsquo;ll be in touch.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-flame hover:text-paper transition-colors"
          >
            Enquire now →
          </Link>
        </div>
      </div>

      <div className="border-t border-ink-line">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-paper/40">
          <p>© {new Date().getFullYear()} Gain Strength Therapy · All rights reserved</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-paper/80">Privacy</Link>
            <Link href="/terms" className="hover:text-paper/80">Terms</Link>
            <Link href="/faqs" className="hover:text-paper/80">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
