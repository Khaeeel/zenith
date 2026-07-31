"use client";

/**
 * Subtle film grain — static tiled PNG (no SVG feTurbulence, no mix-blend).
 * Avoids continuous filter re-rasterization over the full viewport.
 */
export default function FilmGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] opacity-[0.05]"
      aria-hidden
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
      }}
    />
  );
}
