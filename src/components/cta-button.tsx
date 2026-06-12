"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline-cream" | "solid-black";
  className?: string;
  external?: boolean;
  icon?: "arrow" | "up-right" | "none";
};

const styles = {
  primary: "bg-flame text-ink hover:bg-flame-deep",
  secondary: "bg-paper text-ink hover:bg-flame hover:text-ink",
  ghost: "bg-transparent text-paper border border-paper/40 hover:border-flame hover:text-flame",
  "outline-cream": "bg-transparent text-paper border border-paper/40 hover:bg-paper/10",
  "solid-black": "bg-ink text-paper hover:bg-flame hover:text-ink",
} as const;

const baseCls =
  "group inline-flex items-center gap-3 rounded-sm px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.22em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

// Smoothly scroll to an in-page target WITHOUT writing a hash to the URL.
// Keeping the URL clean means reopening or reloading the page always starts
// at the top (the hero) rather than jumping to whichever section a CTA last
// pointed at. If the target id is not on the page we leave the default anchor
// behaviour intact.
function scrollToHash(e: React.MouseEvent, href: string) {
  const el = document.getElementById(href.slice(1));
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  external,
  icon = "arrow",
}: BtnProps) {
  const cls = cn(baseCls, styles[variant], className);

  const IconEl =
    icon === "up-right" ? (
      <ArrowUpRight size={15} strokeWidth={2.4} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    ) : icon === "arrow" ? (
      <ArrowRight size={15} strokeWidth={2.4} className="transition-transform duration-300 group-hover:translate-x-1" />
    ) : null;

  const content = (
    <>
      <span>{children}</span>
      {IconEl}
    </>
  );

  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls} onClick={(e) => scrollToHash(e, href)}>
        {content}
      </a>
    );
  }

  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

// Bare in-page scroll trigger for bespoke-styled buttons (e.g. the slim header
// "Get Started" button on the landing pages). Same no-hash smooth scroll as
// CTAButton, but it carries no built-in styling of its own.
export function ScrollLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        scrollToHash(e, href);
      }}
    >
      {children}
    </a>
  );
}
