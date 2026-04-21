import { VIDEOS } from "@/lib/utils";

type VideoKey = keyof typeof VIDEOS;

/**
 * Full-bleed autoplaying video layer. Server component (no JS needed).
 * Default picks the homepage hero; pass `video="facilityA" | "facilityB"` for alternates.
 */
export function HeroVideo({
  className,
  video = "hero",
  poster,
}: {
  className?: string;
  video?: VideoKey;
  poster?: string;
}) {
  const v = VIDEOS[video];
  const posterSrc = poster ?? ("poster" in v ? v.poster : undefined);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-ink ${className ?? ""}`}>
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterSrc}
        aria-hidden
      >
        <source src={v.src1080} type="video/mp4" media="(min-width: 1024px)" />
        <source src={v.src720} type="video/mp4" />
      </video>
      {/* Dark wash — keeps white text legible on any frame */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 40%, rgba(10,10,10,0.60) 78%, rgba(10,10,10,0.88) 100%)",
        }}
        aria-hidden
      />
      {/* Orange flare — anchors the video to the brand without dominating */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-25"
        style={{
          background:
            "radial-gradient(110% 75% at 75% 35%, rgba(252,131,44,0.0) 35%, rgba(252,131,44,0.55) 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
