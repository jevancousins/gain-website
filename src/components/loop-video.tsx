import { cn } from "@/lib/utils";

/**
 * Inline decorative looping video — the editorial counterpart to <Photo/>.
 * Use alongside photos, not as a replacement. Server component.
 */
export function LoopVideo({
  src720,
  src1080,
  poster,
  alt,
  caption,
  aspect = "aspect-[4/5]",
  className,
  priority,
  tone = "neutral",
}: {
  src720: string;
  src1080: string;
  poster?: string;
  alt: string;
  caption?: string;
  aspect?: string;
  className?: string;
  priority?: boolean;
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
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          poster={poster}
          aria-label={alt}
        >
          <source src={src1080} type="video/mp4" media="(min-width: 1024px)" />
          <source src={src720} type="video/mp4" />
        </video>
        {/* Small motion indicator — editorial flourish */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-ink/70 text-paper text-[0.6rem] font-bold uppercase tracking-[0.24em] px-2 py-1 rounded-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-flame animate-pulse" />
          Motion
        </span>
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
