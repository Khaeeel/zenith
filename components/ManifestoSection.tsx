"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned manifesto chapter — massive typography scrubbed by scroll.
 * Content stays readable through the pin (no empty black void after fade-out).
 */
export default function ManifestoSection({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const line1 = useRef<HTMLParagraphElement>(null);
  const line2 = useRef<HTMLParagraphElement>(null);
  const line3 = useRef<HTMLParagraphElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (!ready || !sectionRef.current) return;

    const lines = [line1.current, line2.current, line3.current, sub.current].filter(
      Boolean,
    ) as HTMLElement[];

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      gsap.set(lines, { opacity: 1, y: 0, rotateX: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([line1.current, line2.current, line3.current], {
        opacity: 0,
        y: 120,
        rotateX: 40,
      });
      gsap.set(sub.current, { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=90%",
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        line1.current,
        { y: 0, opacity: 1, rotateX: 0, ease: "none", duration: 0.35 },
        0,
      )
        .to(
          line2.current,
          { y: 0, opacity: 1, rotateX: 0, ease: "none", duration: 0.35 },
          0.12,
        )
        .to(
          line3.current,
          { y: 0, opacity: 1, rotateX: 0, ease: "none", duration: 0.35 },
          0.24,
        )
        .to(
          sub.current,
          { opacity: 1, y: 0, ease: "none", duration: 0.3 },
          0.4,
        )
        // Hold readable content through the rest of the pin
        .to({}, { duration: 0.45 });
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      gsap.set(lines, { clearProps: "opacity,transform" });
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative flex h-screen items-center justify-center overflow-hidden bg-[#040406]"
      style={{ perspective: "1000px" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(212,175,55,0.18), transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" />

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
          className="font-display text-4xl leading-none tracking-[0.08em] text-gold-bright sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          ONE RESISTANCE
        </p>
        <p
          ref={line2}
          className="font-display mt-3 text-4xl leading-none tracking-[0.08em] text-gold sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          ONE COALITION
        </p>
        <p
          ref={line3}
          className="shimmer-text font-display mt-3 text-4xl leading-none tracking-[0.08em] sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          ONE FUTURE
        </p>

        <p
          ref={sub}
          className="mt-10 max-w-lg text-sm leading-relaxed text-foreground/55 sm:text-base"
        >
          Twelve clans under the APEX RESISTANCE banner. Bound by discipline,
          powered by Zenith — forged for MIR4.
        </p>
      </div>
    </section>
  );
}
