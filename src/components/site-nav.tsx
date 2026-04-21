"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn, IMAGES } from "@/lib/utils";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/facilities", label: "Facilities" },
  { href: "/programme", label: "Programme" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled ? "bg-ink/90 backdrop-blur-md border-b border-ink-line" : "bg-ink/0 border-b border-transparent"
      )}
    >
      <div className="hidden md:block border-b border-paper/10">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 h-8 flex items-center justify-between text-[0.68rem] font-medium uppercase tracking-[0.24em] text-paper/55">
          <span>Eastbourne · BN22 8DJ</span>
          <span className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-flame animate-pulse" />
              New enquiries open
            </span>
            <span className="text-paper">5.0 ★ Google</span>
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 h-16 md:h-[72px] flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
          aria-label="Gain Strength Therapy — home"
        >
          <span className="relative h-8 w-8 shrink-0">
            <Image src={IMAGES.logo} alt="" fill sizes="32px" className="object-contain brightness-0 invert" />
          </span>
          <span className="display text-[1.55rem] leading-none font-black tracking-[-0.03em] text-paper">
            GAIN
          </span>
          <span className="hidden md:inline text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-paper/50 pl-3 border-l border-paper/15">
            Strength Therapy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9 text-[0.82rem] font-medium">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-paper/80 hover:text-paper link-quiet"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-sm bg-flame text-ink px-5 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.2em] hover:bg-flame-deep transition-colors"
          >
            Enquire now
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden p-2 -mr-2 text-paper"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-[max-height] duration-500 ease-out border-t border-ink-line",
          open ? "max-h-[28rem]" : "max-h-0"
        )}
      >
        <div className="px-6 py-8 flex flex-col gap-6 bg-ink">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="display-tight text-3xl text-paper anim-rise"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setOpen(false)}
            >
              <span className="text-paper/40 text-xs mr-3 align-middle tabular-nums">
                0{i + 1}
              </span>
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-sm bg-flame text-ink px-6 py-4 text-[0.82rem] font-bold uppercase tracking-[0.2em]"
            onClick={() => setOpen(false)}
          >
            Enquire now
          </Link>
        </div>
      </div>
    </header>
  );
}
