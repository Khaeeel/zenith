"use client";

/**
 * Static CSS grain — no SVG feTurbulence (that filter re-rasters and tanks scroll FPS).
 */
export default function FilmGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] opacity-[0.035]"
      aria-hidden
      style={{
        backgroundImage:
          "repeating-radial-gradient(circle at 17% 32%, rgba(255,255,255,0.045) 0 0.5px, transparent 0.6px 3px), repeating-radial-gradient(circle at 72% 64%, rgba(255,255,255,0.03) 0 0.4px, transparent 0.5px 2.5px)",
        backgroundSize: "140px 140px, 90px 90px",
        mixBlendMode: "overlay",
      }}
    />
  );
}
