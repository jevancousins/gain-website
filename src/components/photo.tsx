import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Editorial photograph treatment — dark-first.
 * - Uses next/image with Wix CDN remote pattern
 * - Optional caption
 * - Subtle inset ring for press-plate feel
 */
export function Photo({
  src,
  alt,
  caption,
  aspect = "aspect-[4/5]",
  priority,
  className,
  sizes,
  tone = "neutral",
}: {
  src: string;
  alt: string;
  caption?: string;
  aspect?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  tone?: "neutral" | "warm" | "cool";
}) {
  const washes = {
    neutral: "",
    warm: "after:bg-flame/10 after:mix-blend-screen",
    cool: "after:bg-ink/20",
  };
  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden bg-ink-mid",
          aspect,
          "after:absolute after:inset-0 after:pointer-events-none",
          washes[tone]
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
          className="object-cover"
        />
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-paper/5" />
      </div>
      {caption && (
        <figcaption className="mt-3 text-xs italic text-paper/50 tracking-wide">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
