import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GridBackground({
  children,
  className,
}: GridBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen bg-background", className)}>
      {/* Mesh gradient + grid overlay */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Boxed grid base */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundColor: "rgba(6, 8, 20, 0.9)",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Dense micro-grid for texture */}
        <div
          className="absolute inset-0 opacity-2"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Brighter rising graph accent (irregular path) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-75 mix-blend-screen"
          viewBox="0 0 1440 900"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mesh-line" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(80,220,255,0.5)" />
              <stop offset="45%" stopColor="rgba(140,255,220,0.65)" />
              <stop offset="100%" stopColor="rgba(255,210,255,0.75)" />
            </linearGradient>
            <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polyline
            fill="none"
            stroke="url(#mesh-line)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="0,840 140,720 260,760 360,690 520,640 660,700 760,560 910,590 1020,500 1180,470 1300,420 1440,360"
            filter="url(#glow-line)"
          />
          <g fill="url(#mesh-line)">
            <circle cx="140" cy="720" r="6" />
            <circle cx="360" cy="690" r="6" />
            <circle cx="660" cy="700" r="6" />
            <circle cx="910" cy="590" r="6" />
            <circle cx="1180" cy="470" r="6" />
            <circle cx="1440" cy="360" r="7" />
          </g>
        </svg>

        {/* Soft glow anchors */}
        <div className="absolute inset-0 mix-blend-screen opacity-30">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-primary/12 blur-[140px]" />
          <div className="absolute bottom-16 right-6 w-[520px] h-[320px] bg-secondary/18 blur-[120px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
