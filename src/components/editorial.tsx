import { cn } from "@/lib/utils";

/** Editorial primitives — dark-first. */

export function Kicker({
  children,
  tone = "flame",
  className,
}: {
  children: React.ReactNode;
  tone?: "flame" | "ink" | "paper";
  className?: string;
}) {
  const tones = {
    flame: "text-flame",
    ink: "text-ink",
    paper: "text-paper",
  };
  return (
    <span
      className={cn(
        "inline-block text-[0.68rem] font-bold uppercase tracking-[0.28em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Folio({
  number,
  label,
  tone = "paper",
}: {
  number: string;
  label: string;
  tone?: "paper" | "ink";
}) {
  return (
    <div className={cn("flex items-baseline gap-4", tone === "ink" ? "text-ink/80" : "text-paper/70")}>
      <span className="text-[0.72rem] font-bold tracking-[0.24em] uppercase text-flame">
        No. {number}
      </span>
      <span
        className={cn(
          "inline-block h-px w-10",
          tone === "ink" ? "bg-ink/30" : "bg-paper/30"
        )}
      />
      <span className="text-[0.72rem] font-bold tracking-[0.24em] uppercase">
        {label}
      </span>
    </div>
  );
}

export function Rule({
  tone = "line",
  className,
  weight = 1,
}: {
  tone?: "line" | "ink" | "flame" | "paper";
  className?: string;
  weight?: 1 | 2;
}) {
  const tones = {
    line: "bg-ink-line",
    ink: "bg-ink",
    flame: "bg-flame",
    paper: "bg-paper/20",
  };
  return (
    <div
      className={cn(
        tones[tone],
        weight === 2 ? "h-0.5" : "h-px",
        className
      )}
    />
  );
}

export function BoxedNumber({
  n,
  tone = "paper",
}: {
  n: string;
  tone?: "ink" | "flame" | "paper";
}) {
  const tones = {
    ink: "border-ink text-ink",
    flame: "border-flame text-flame",
    paper: "border-paper/40 text-paper",
  };
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center border text-sm font-semibold tabular-nums",
        tones[tone]
      )}
    >
      {n}
    </span>
  );
}

export function PullQuote({
  quote,
  attribution,
  className,
  tone = "paper",
}: {
  quote: string;
  attribution?: string;
  className?: string;
  tone?: "paper" | "ink";
}) {
  return (
    <figure className={cn("relative", className)}>
      {/* Decorative oversized quote mark — sits behind the text (z-0 via
          negative z-index) so it never overlays or blocks selection of
          the real words. pointer-events-none belt-and-braces. */}
      <span
        aria-hidden
        className={cn(
          "display absolute -left-6 -top-16 md:-top-20 text-[10rem] leading-none select-none pointer-events-none -z-10",
          tone === "ink" ? "text-ink/10" : "text-flame/25"
        )}
      >
        &ldquo;
      </span>
      <blockquote className={cn("relative z-10 display-tight text-3xl md:text-5xl leading-[1.05]", tone === "ink" ? "text-ink" : "text-paper")}>
        {quote}
      </blockquote>
      {attribution && (
        <figcaption className={cn("relative z-10 mt-6 text-sm tracking-wide italic", tone === "ink" ? "text-ink/60" : "text-paper/55")}>
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}

export function Caption({
  children,
  tone = "paper",
}: {
  children: React.ReactNode;
  tone?: "paper" | "ink";
}) {
  return (
    <p className={cn("mt-2.5 text-xs italic tracking-wide", tone === "ink" ? "text-ink/55" : "text-paper/50")}>
      {children}
    </p>
  );
}
