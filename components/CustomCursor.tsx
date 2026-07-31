"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Agency-style gold cursor — trailing ring + magnetic pull on interactive targets.
 * Inspired by Lusion / award-site magnetic cursor patterns.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const magnetic = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("arc-cursor");

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      const target = (e.target as HTMLElement | null)?.closest(
        "a, button, [data-magnetic], .magnetic",
      ) as HTMLElement | null;

      if (target) {
        hovering.current = true;
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const strength = 0.28;
        magnetic.current = {
          x: (e.clientX - cx) * strength,
          y: (e.clientY - cy) * strength,
          active: true,
        };
        target.style.transform = `translate(${magnetic.current.x}px, ${magnetic.current.y}px)`;
        target.dataset.mag = "1";
      } else {
        hovering.current = false;
        magnetic.current.active = false;
        document.querySelectorAll<HTMLElement>("[data-mag='1']").forEach((el) => {
          el.style.transform = "";
          delete el.dataset.mag;
        });
      }
    };

    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };
    const onEnter = () => {
      if (dot.current) dot.current.style.opacity = "1";
      if (ring.current) ring.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let raf = 0;
    const tick = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.14;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.14;

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
      document.querySelectorAll<HTMLElement>("[data-mag='1']").forEach((el) => {
        el.style.transform = "";
      });
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-[200] h-10 w-10 rounded-full border border-gold/55 mix-blend-difference transition-[border-color] duration-200"
        style={{ opacity: 0 }}
        aria-hidden
      />
      <div
        ref={dot}
        className="pointer-events-none fixed top-0 left-0 z-[201] h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_12px_rgba(240,208,96,0.8)] transition-[scale] duration-200"
        style={{ opacity: 0 }}
        aria-hidden
      />
    </>
  );
}
