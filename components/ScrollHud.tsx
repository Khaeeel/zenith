"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: "hero", label: "ORIGIN", num: "01" },
  { id: "manifesto", label: "OATH", num: "02" },
  { id: "runway", label: "TWELVE", num: "03" },
  { id: "territories", label: "REALM", num: "04" },
  { id: "join", label: "ENLIST", num: "05" },
];

function measureTop(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const spacer = el.parentElement?.classList.contains("pin-spacer")
    ? el.parentElement
    : el;
  return spacer.getBoundingClientRect().top;
}

/** Cinematic scroll HUD — progress + chapter ticks. */
export default function ScrollHud({ ready }: { ready: boolean }) {
  const [progress, setProgress] = useState(0);
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    if (!ready) return;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y =
        (window as unknown as { __lenis?: { scroll: number } }).__lenis
          ?.scroll ?? window.scrollY;
      const p = max > 0 ? y / max : 0;
      setProgress(Math.min(1, Math.max(0, p)));

      let active = 0;
      const threshold = window.innerHeight * 0.42;
      CHAPTERS.forEach((c, i) => {
        const top = measureTop(c.id);
        if (top === null) return;
        if (top < threshold) active = i;
      });
      setChapter(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const lenis = (
      window as unknown as { __lenis?: { on: Function; off: Function } }
    ).__lenis;
    lenis?.on?.("scroll", onScroll);
    const onRefresh = () => onScroll();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const t1 = window.setTimeout(onScroll, 700);
    const t2 = window.setTimeout(onScroll, 1800);
    return () => {
      window.removeEventListener("scroll", onScroll);
      lenis?.off?.("scroll", onScroll);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [ready]);

  if (!ready) return null;

  const current = CHAPTERS[chapter];

  return (
    <div
      className="pointer-events-none fixed top-1/2 right-4 z-[60] hidden -translate-y-1/2 flex-col items-end gap-3 sm:right-6 sm:flex"
      aria-hidden
    >
      <p className="font-display text-[11px] tabular-nums tracking-[0.35em] text-gold-bright">
        {String(Math.round(progress * 100)).padStart(3, "0")}
      </p>

      <div className="flex flex-col items-end gap-2.5 py-1">
        {CHAPTERS.map((c, i) => {
          const active = i === chapter;
          const passed = i < chapter;
          return (
            <div key={c.id} className="flex items-center gap-2">
              <span
                className={`font-display text-[8px] tracking-[0.25em] uppercase transition-colors duration-300 ${
                  active
                    ? "text-gold-bright opacity-100"
                    : passed
                      ? "text-gold-dim opacity-50"
                      : "text-gold-dim opacity-25"
                }`}
              >
                {active ? c.label : c.num}
              </span>
              <span
                className={`block rounded-full transition-[background-color,box-shadow,width,height] duration-300 ${
                  active
                    ? "h-2 w-2 bg-gold-bright shadow-[0_0_10px_rgba(240,208,96,0.7)]"
                    : passed
                      ? "h-1 w-1 bg-gold-dim"
                      : "h-1 w-1 bg-white/20"
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="relative mt-1 h-24 w-[2px] overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute top-0 left-0 w-full origin-top bg-gradient-to-b from-gold-bright via-gold to-gold-dim transition-[height] duration-150"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      <p className="font-display text-[9px] tracking-[0.32em] text-gold/75">
        {current?.num} {current?.label}
      </p>
    </div>
  );
}
