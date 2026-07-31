"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type JoinCTAProps = {
  onJoin: () => void;
};

const STATS = [
  { value: 12, label: "Clans" },
  { value: 1, label: "Coalition" },
  { value: 3, label: "Pillars" },
];

export default function JoinCTA({ onJoin }: JoinCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !innerRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(innerRef.current, {
        opacity: 0,
        y: 80,
        scale: 0.96,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      STATS.forEach((stat, i) => {
        const el = statRefs.current[i];
        if (!el) return;
        const obj = { n: 0 };
        gsap.to(obj, {
          n: stat.value,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.n)).padStart(2, "0");
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-obsidian px-4 py-28"
      id="join"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.14), transparent 70%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <Image
          src="/assets/logo.png"
          alt=""
          width={520}
          height={520}
          className="h-96 w-96 object-contain sm:h-[30rem] sm:w-[30rem]"
        />
      </div>

      <div
        ref={innerRef}
        className="relative z-10 flex max-w-3xl flex-col items-center gap-8 text-center"
      >
        <p className="font-display text-[10px] tracking-[0.5em] text-gold-dim uppercase sm:text-xs">
          Chapter 05 · Enlist
        </p>

        <h2 className="font-display text-4xl tracking-wide text-gold-bright sm:text-6xl">
          Join the Coalition
        </h2>

        <p className="max-w-md text-sm leading-relaxed text-foreground/65 sm:text-base">
          Twelve clans. One resistance. Fill out your application and fight
          alongside the APEX RESISTANCE COALITION in MIR4.
        </p>

        {/* Animated stats strip */}
        <div className="mt-2 flex items-center gap-8 sm:gap-14">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span
                ref={(el) => {
                  statRefs.current[i] = el;
                }}
                className="font-display text-3xl tabular-nums text-gold-bright sm:text-4xl"
              >
                00
              </span>
              <span className="font-display text-[9px] tracking-[0.35em] text-gold-dim uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          data-magnetic
          onClick={onJoin}
          className="magnetic group relative mt-4 overflow-hidden rounded-full px-12 py-4 font-display text-sm tracking-[0.3em] text-obsidian uppercase transition-transform duration-300 will-change-transform"
          style={{
            background:
              "linear-gradient(135deg, #8a7020 0%, #d4af37 50%, #f0d060 100%)",
            boxShadow:
              "0 0 40px rgba(212,175,55,0.45), 0 0 80px rgba(212,175,55,0.18)",
          }}
        >
          <span className="relative z-10">Apply to Join</span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px w-12 bg-gold-dim/40" />
          <p className="font-display text-[10px] tracking-[0.3em] text-gold-dim">
            ONE RESISTANCE ✦ ONE COALITION ✦ ONE FUTURE
          </p>
          <span className="h-px w-12 bg-gold-dim/40" />
        </div>
      </div>
    </section>
  );
}
