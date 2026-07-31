"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned manifesto chapter — massive typography scrubbed by scroll.
 * Inspired by agency "statement" sections (Lusion / Resn energy).
 */
export default function ManifestoSection({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const line1 = useRef<HTMLParagraphElement>(null);
  const line2 = useRef<HTMLParagraphElement>(null);
  const line3 = useRef<HTMLParagraphElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ready || !sectionRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=105%",
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        line1.current,
        { y: 120, opacity: 0, rotateX: 40 },
        { y: 0, opacity: 1, rotateX: 0, ease: "none" },
        0,
      )
        .fromTo(
          line2.current,
          { y: 120, opacity: 0, rotateX: 40 },
          { y: 0, opacity: 1, rotateX: 0, ease: "none" },
          0.15,
        )
        .fromTo(
          line3.current,
          { y: 120, opacity: 0, rotateX: 40 },
          { y: 0, opacity: 1, rotateX: 0, ease: "none" },
          0.3,
        )
        .fromTo(
          sub.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: "none" },
          0.5,
        )
        .to({}, { duration: 0.08 })
        .to([line1.current, line2.current, line3.current, sub.current], {
          opacity: 0,
          y: -60,
          ease: "none",
          duration: 0.18,
        });
    }, sectionRef);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative flex h-screen items-center justify-center overflow-hidden bg-[#040406]"
      style={{ perspective: "1000px" }}
    >
      {/* Moving gold wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(212,175,55,0.18), transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" />

      {/* Soft grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mb-8 font-display text-[10px] tracking-[0.5em] text-gold-dim uppercase">
          Chapter 02 · The Oath
        </p>

        <p
          ref={line1}
          className="font-display text-4xl leading-none tracking-[0.08em] text-gold-bright opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          ONE RESISTANCE
        </p>
        <p
          ref={line2}
          className="font-display mt-3 text-4xl leading-none tracking-[0.08em] text-gold opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          ONE COALITION
        </p>
        <p
          ref={line3}
          className="shimmer-text font-display mt-3 text-4xl leading-none tracking-[0.08em] opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          ONE FUTURE
        </p>

        <p
          ref={sub}
          className="mt-10 max-w-lg text-sm leading-relaxed text-foreground/55 opacity-0 sm:text-base"
        >
          Twelve clans under the APEX RESISTANCE banner. Bound by discipline,
          powered by Zenith — forged for MIR4.
        </p>
      </div>
    </section>
  );
}
