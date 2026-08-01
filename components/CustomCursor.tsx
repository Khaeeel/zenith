"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Agency-style gold cursor — trailing ring + magnetic pull.
 * Avoids document-wide querySelectorAll on every mousemove.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const magEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("arc-cursor");

    const clearMag = () => {
      if (magEl.current) {
        magEl.current.style.transform = "";
        magEl.current = null;
      }
    };

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      const target = (e.target as HTMLElement | null)?.closest(
        "a, button, [data-magnetic], .magnetic",
      ) as HTMLElement | null;

      if (target) {
        hovering.current = true;
        if (magEl.current && magEl.current !== target) {
          magEl.current.style.transform = "";
        }
        magEl.current = target;
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const strength = 0.22;
        target.style.transform = `translate3d(${(e.clientX - cx) * strength}px, ${(e.clientY - cy) * strength}px, 0)`;
      } else {
        hovering.current = false;
        clearMag();
      }
    };

    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
      clearMag();
    };
    const onEnter = () => {
      if (dot.current) dot.current.style.opacity = "1";
      if (ring.current) ring.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let raf = 0;
    const tick = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;

      if (dot.current) {
        const s = hovering.current ? 0.5 : 1;
        dot.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${s})`;
      }
      if (ring.current) {
        const scale = hovering.current ? 2.15 : 1;
        ring.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ring.current.style.borderColor = hovering.current
          ? "rgba(240,208,96,0.95)"
          : "rgba(212,175,55,0.55)";
        ring.current.style.background = hovering.current
          ? "rgba(212,175,55,0.08)"
          : "transparent";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("arc-cursor");
      clearMag();
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-[200] h-10 w-10 rounded-full border border-gold/55 mix-blend-difference"
        style={{ opacity: 0, willChange: "transform" }}
        aria-hidden
      />
      <div
        ref={dot}
        className="pointer-events-none fixed top-0 left-0 z-[201] h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_12px_rgba(240,208,96,0.8)]"
        style={{ opacity: 0, willChange: "transform" }}
        aria-hidden
      />
    </>
  );
}
