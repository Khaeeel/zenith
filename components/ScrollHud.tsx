"use client";

import { useEffect, useRef, useState } from "react";

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

/** Cinematic scroll HUD — progress + chapter ticks (rAF-throttled). */
export default function ScrollHud({ ready }: { ready: boolean }) {
  const [progress, setProgress] = useState(0);
  const [chapter, setChapter] = useState(0);
  const pending = useRef(false);
  const last = useRef({ progress: 0, chapter: 0 });

  useEffect(() => {
    if (!ready) return;

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y =
        (window as unknown as { __lenis?: { scroll: number } }).__lenis
          ?.scroll ?? window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      let active = 0;
      const threshold = window.innerHeight * 0.42;
      for (let i = 0; i < CHAPTERS.length; i++) {
        const top = measureTop(CHAPTERS[i].id);
        if (top !== null && top < threshold) active = i;
      }

      if (Math.abs(last.current.progress - p) > 0.004) {
        last.current.progress = p;
        setProgress(p);
      }
      if (last.current.chapter !== active) {
        last.current.chapter = active;
        setChapter(active);
      }
    };

    const onScroll = () => {
      if (pending.current) return;
      pending.current = true;
      requestAnimationFrame(() => {
        pending.current = false;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    const lenis = (
      window as unknown as { __lenis?: { on: Function; off: Function } }
    ).__lenis;
    lenis?.on?.("scroll", onScroll);
    const t1 = window.setTimeout(measure, 500);
    return () => {
      window.removeEventListener("scroll", onScroll);
      lenis?.off?.("scroll", onScroll);
      window.clearTimeout(t1);
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
        {current.num}
      </p>
      <p className="font-display text-[9px] tracking-[0.3em] text-gold/70">
        {current.label}
      </p>
      <div className="relative mt-1 h-24 w-[2px] overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-gold-bright to-gold-dim"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        {CHAPTERS.map((c, i) => (
          <span
            key={c.id}
            className={`block h-1 w-1 rounded-full ${
              i === chapter ? "bg-gold-bright" : "bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
