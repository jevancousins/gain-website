import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ——— Section — dark-first tones ——— */

export function Section({
  children,
  className,
  id,
  tone = "ink",
  containerClass,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "ink" | "ink-soft" | "ink-mid" | "flame" | "paper";
  containerClass?: string;
}) {
  const tones = {
    ink: "bg-ink text-paper",
    "ink-soft": "bg-ink-soft text-paper",
    "ink-mid": "bg-ink-mid text-paper",
    flame: "bg-flame text-ink",
    paper: "bg-paper text-ink",
  };
  return (
    <section id={id} className={cn("relative", tones[tone], className)}>
      <div className={cn("mx-auto max-w-[86rem] px-6 md:px-10 lg:px-16 py-20 md:py-28", containerClass)}>
        {children}
      </div>
    </section>
  );
}

/* ——— Headings ——— */

export function H2({
  children,
  className,
  as: As = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <As className={cn("display text-[clamp(2.25rem,5vw,4.25rem)] text-paper", className)}>
      {children}
    </As>
  );
}

export function H3({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("display-tight text-xl md:text-2xl text-paper", className)}>
      {children}
    </h3>
  );
}

export function Lede({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("lede text-xl md:text-[1.35rem] text-paper/75 max-w-2xl", className)}>
      {children}
    </p>
  );
}

/* ——— Buttons ——— */

type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline-cream" | "solid-black";
  className?: string;
  external?: boolean;
  icon?: "arrow" | "up-right" | "none";
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  external,
  icon = "arrow",
}: BtnProps) {
  const styles = {
    primary: "bg-flame text-ink hover:bg-flame-deep",
    secondary: "bg-paper text-ink hover:bg-flame hover:text-ink",
    ghost: "bg-transparent text-paper border border-paper/20 hover:border-flame hover:text-flame",
    "outline-cream": "bg-transparent text-paper border border-paper/25 hover:bg-paper/10",
    "solid-black": "bg-ink text-paper hover:bg-flame hover:text-ink",
  } as const;

  const cls = cn(
    "group inline-flex items-center gap-3 rounded-sm px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.22em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
    styles[variant],
    className
  );

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

/* ——— Info primitives ——— */

export function Stat({
  value,
  label,
  tone = "paper",
}: {
  value: string;
  label: string;
  tone?: "paper" | "ink";
}) {
  return (
    <div>
      <div className={cn("display text-5xl md:text-6xl font-black tabular-nums", tone === "ink" ? "text-ink" : "text-paper")}>
        {value}
      </div>
      <div className={cn("mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em]", tone === "ink" ? "text-ink/60" : "text-paper/55")}>
        {label}
      </div>
    </div>
  );
}

export function FeatureCard({
  n,
  title,
  children,
  icon,
}: {
  n?: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <article className="group relative bg-ink-soft border border-ink-line p-7 md:p-8 h-full flex flex-col transition-all duration-300 hover:border-flame/50 hover:bg-ink-mid">
      <div className="flex items-start justify-between mb-6">
        {icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center border border-paper/15 text-flame">
            {icon}
          </span>
        ) : (
          <span />
        )}
        {n && (
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-mute-dark tabular-nums">
            / {n}
          </span>
        )}
      </div>
      <h3 className="display-tight text-[1.4rem] md:text-[1.55rem] text-paper leading-[1.15]">{title}</h3>
      <div className="mt-4 text-[0.95rem] text-paper/65 leading-relaxed">
        {children}
      </div>
    </article>
  );
}

export function Testimonial({
  quote,
  name,
  detail,
}: {
  quote: string;
  name: string;
  detail?: string;
}) {
  return (
    <figure className="flex flex-col gap-6 bg-ink-soft border border-ink-line p-7 md:p-8 h-full">
      <div className="flex items-center gap-1 text-flame" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21.2l1.7-7L2 9.5l7.1-.6L12 2z" />
          </svg>
        ))}
      </div>
      <blockquote className="display-tight text-xl md:text-[1.4rem] text-paper leading-[1.2]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-baseline justify-between pt-6 border-t border-ink-line">
        <span className="text-sm font-semibold tracking-wide text-paper">{name}</span>
        {detail && <span className="text-xs uppercase tracking-[0.18em] text-mute-dark">{detail}</span>}
      </figcaption>
    </figure>
  );
}

export function Pill({
  children,
  tone = "paper",
}: {
  children: React.ReactNode;
  tone?: "paper" | "flame" | "ink";
}) {
  const tones = {
    paper: "bg-paper/5 border-paper/15 text-paper/85",
    flame: "bg-flame/15 border-flame/30 text-flame",
    ink: "bg-ink/5 border-ink/10 text-ink",
  };
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.72rem] font-medium tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

/* ——— Final CTA band ——— */

export function FinalCTA({
  title = "Ready to feel stronger?",
  body = "Leave your details and Hallum will call you for a short, no-pressure chat. If it sounds like a fit, he'll invite you in to see the studio.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <Section tone="flame" containerClass="!py-24 md:!py-32">
      <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-end">
        <div className="md:col-span-7">
          <span className="inline-block text-[0.68rem] font-bold uppercase tracking-[0.28em] text-ink/75">
            Start here · Step 01
          </span>
          <h2 className="display mt-6 text-[clamp(2.25rem,6vw,5.25rem)] text-ink">
            {title}
          </h2>
        </div>
        <div className="md:col-span-5">
          <p className="lede text-lg md:text-xl text-ink/85 max-w-md">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton
              href="/contact"
              variant="solid-black"
              className="hover:!bg-ink hover:!text-flame"
            >
              Enquire now
            </CTAButton>
            <CTAButton
              href="/about"
              variant="ghost"
              className="!text-ink !border-ink/40 hover:!bg-ink hover:!text-flame hover:!border-ink"
            >
              Learn more
            </CTAButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
