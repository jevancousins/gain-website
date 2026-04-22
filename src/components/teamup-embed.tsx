import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

/**
 * TeamUp booking iframe. Wrapped in brand chrome so it feels native
 * even though the widget itself is TeamUp's light-themed UI.
 *
 * `src` is the TeamUp customer-site URL (e.g. /c/appointment_types).
 * `fallbackHref` is where the "Open in new tab" link points if a user
 * would rather go directly to TeamUp — also a belt-and-braces fallback
 * if their browser blocks the iframe.
 */
export function TeamUpEmbed({
  src,
  title,
  fallbackHref,
  className,
  minHeightClass = "min-h-[820px] md:min-h-[920px]",
}: {
  src: string;
  title: string;
  fallbackHref?: string;
  className?: string;
  minHeightClass?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-hidden bg-paper border border-ink-line rounded-sm">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className={cn("w-full bg-paper block", minHeightClass)}
          style={{ border: 0, colorScheme: "light" }}
          allow="payment"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {fallbackHref && (
        <div className="mt-3 flex items-center justify-between flex-wrap gap-3 text-[0.72rem] tracking-[0.18em] uppercase text-paper/50">
          <span>Live availability · powered by TeamUp</span>
          <a
            href={fallbackHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-paper/70 hover:text-flame transition-colors"
          >
            Open in a new tab <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
