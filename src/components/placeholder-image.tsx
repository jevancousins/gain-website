import { cn } from "@/lib/utils";

type Variant = "lift" | "coach" | "studio" | "group" | "portrait" | "detail";

const variants: Record<Variant, { bg: string; svg: React.ReactNode; label: string }> = {
  lift: {
    bg: "from-forest to-ink",
    label: "Strength session",
    svg: (
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-screen" aria-hidden>
        <circle cx="100" cy="80" r="18" fill="#f6f1e8" />
        <rect x="60" y="100" width="80" height="6" rx="3" fill="#f6f1e8" />
        <circle cx="55" cy="103" r="16" fill="#f6f1e8" />
        <circle cx="145" cy="103" r="16" fill="#f6f1e8" />
        <rect x="94" y="115" width="12" height="50" fill="#f6f1e8" />
      </svg>
    ),
  },
  coach: {
    bg: "from-rust to-rust-dark",
    label: "Expert coaching",
    svg: (
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20" aria-hidden>
        <circle cx="100" cy="70" r="28" fill="#f6f1e8" />
        <path d="M40 180 Q100 120 160 180 Z" fill="#f6f1e8" />
      </svg>
    ),
  },
  studio: {
    bg: "from-sand to-bone-warm",
    label: "Our studio",
    svg: (
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-50" aria-hidden>
        <rect x="20" y="120" width="30" height="40" fill="#2f4a3a" opacity="0.3" />
        <rect x="60" y="100" width="30" height="60" fill="#2f4a3a" opacity="0.35" />
        <rect x="100" y="110" width="30" height="50" fill="#2f4a3a" opacity="0.3" />
        <rect x="140" y="90" width="30" height="70" fill="#2f4a3a" opacity="0.35" />
      </svg>
    ),
  },
  group: {
    bg: "from-forest/90 to-ink",
    label: "Small-group training",
    svg: (
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20" aria-hidden>
        <circle cx="50" cy="90" r="16" fill="#f6f1e8" />
        <circle cx="100" cy="75" r="18" fill="#f6f1e8" />
        <circle cx="150" cy="90" r="16" fill="#f6f1e8" />
        <path d="M30 180 Q50 140 70 180 Z M80 180 Q100 130 120 180 Z M130 180 Q150 140 170 180 Z" fill="#f6f1e8" />
      </svg>
    ),
  },
  portrait: {
    bg: "from-ember to-rust",
    label: "Member portrait",
    svg: (
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-25" aria-hidden>
        <circle cx="100" cy="80" r="32" fill="#f6f1e8" />
        <path d="M40 200 Q100 120 160 200 Z" fill="#f6f1e8" />
      </svg>
    ),
  },
  detail: {
    bg: "from-ink to-forest",
    label: "Detail",
    svg: (
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20" aria-hidden>
        <circle cx="100" cy="100" r="70" fill="none" stroke="#f6f1e8" strokeWidth="2" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#f6f1e8" strokeWidth="2" />
        <circle cx="100" cy="100" r="10" fill="#f6f1e8" />
      </svg>
    ),
  },
};

export function PlaceholderImage({
  variant = "lift",
  className,
  aspect = "aspect-[4/5]",
}: {
  variant?: Variant;
  className?: string;
  aspect?: string;
}) {
  const v = variants[variant];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br",
        v.bg,
        aspect,
        className
      )}
      aria-label={v.label}
      role="img"
    >
      {v.svg}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
      <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.22em] text-bone/70">
        {v.label}
      </span>
    </div>
  );
}
