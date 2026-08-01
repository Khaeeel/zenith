"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CLANS } from "@/lib/clans";
import { mapMount } from "@/lib/mapWorld";

gsap.registerPlugin(ScrollTrigger);

/**
 * Chapter 03 · TWELVE — horizontal clan cards, then a short handoff into REALM.
 * No empty sky beat after the last card.
 */
export default function ClanRunway({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLParagraphElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || !sectionRef.current || !trackRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const track = trackRef.current;
    const amount = Math.max(0, track.scrollWidth - window.innerWidth);
    // Minimal bridge — castle WebGL should already be warming by now
    const bridge = Math.round(window.innerHeight * 0.1);
    let mapRequested = false;

    // Prefetch JS chunk only — don't mount WebGL until cards are on screen
    void import("@/components/three/MapWorld");

    let ctx: gsap.Context | null = null;
    const timer = window.setTimeout(() => {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${amount + bridge}`,
          pin: true,
          scrub: 0.25,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const total = amount + bridge;
            const cardEnd = amount / total;
            const p = self.progress;

            // Start castle WebGL early in the cards scroll (not at the handoff)
            if (!mapRequested && p > 0.08) {
              mapRequested = true;
              mapMount.request();
            }

            if (p <= cardEnd) {
              const tp = cardEnd > 0 ? p / cardEnd : 1;
              track.style.transform = `translate3d(${-amount * tp}px,0,0)`;
              if (cardsWrapRef.current) {
                const lift = smoothstep(tp, 0.92, 1);
                cardsWrapRef.current.style.opacity = String(1 - lift * 0.35);
                cardsWrapRef.current.style.transform = `translateY(${-lift * 16}px)`;
              }
              if (headerRef.current) {
                headerRef.current.style.opacity = String(
                  1 - smoothstep(tp, 0.9, 1) * 0.85,
                );
              }
              if (sectionRef.current) {
                sectionRef.current.style.setProperty(
                  "--runway-dusk",
                  String(smoothstep(tp, 0.9, 1) * 0.35),
                );
              }
              if (outroRef.current) {
                outroRef.current.style.opacity = String(smoothstep(tp, 0.9, 1));
              }
            } else {
              track.style.transform = `translate3d(${-amount}px,0,0)`;
              const bp = (p - cardEnd) / (1 - cardEnd);
              if (cardsWrapRef.current) {
                cardsWrapRef.current.style.opacity = String(
                  Math.max(0.2, 0.65 - bp * 0.45),
                );
              }
              if (headerRef.current) {
                headerRef.current.style.opacity = String(
                  Math.max(0, 0.15 - bp * 0.15),
                );
              }
              if (sectionRef.current) {
                sectionRef.current.style.setProperty(
                  "--runway-dusk",
                  String(0.35 + bp * 0.25),
                );
              }
              if (outroRef.current) {
                outroRef.current.style.opacity = String(
                  Math.max(0, 1 - smoothstep(bp, 0.25, 0.85)),
                );
              }
            }
          },
        });
      }, sectionRef);
    }, 220);

    return () => {
      window.clearTimeout(timer);
      ctx?.revert();
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="runway"
      className="relative flex h-screen items-center overflow-hidden"
      aria-label="Coalition clans"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #121018 0%, #050508 70%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 70% 50%, rgba(212,175,55,0.12), transparent 70%)",
        }}
      />

      {/* Soft obsidian wash into REALM */}
      <div
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 40%, #16120e 0%, #050508 60%, #000000 100%)",
          opacity: "var(--runway-dusk, 0)",
        }}
      />

      <div
        ref={headerRef}
        className="pointer-events-none absolute top-10 left-0 right-0 z-10 flex flex-col items-center px-4"
      >
        <p className="font-display text-[10px] tracking-[0.45em] text-gold-dim uppercase">
          Chapter 03 · The Twelve
        </p>
        <h2 className="font-display mt-2 text-xl tracking-wide text-gold-bright sm:text-3xl">
          Scroll through the coalition
        </h2>
      </div>

      <div ref={cardsWrapRef} className="relative z-[7] will-change-transform">
        <div
          ref={trackRef}
          className="flex w-max items-center gap-6 px-[15vw] will-change-transform sm:gap-10"
        >
          {CLANS.map((clan, i) => (
            <article
              key={clan.id}
              data-magnetic
              className="magnetic gold-border relative flex h-56 w-64 shrink-0 flex-col justify-between rounded-2xl bg-gradient-to-b from-[#121018]/95 to-[#0a0a0e]/90 p-6 sm:h-64 sm:w-72"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-xs tabular-nums text-gold-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-gold-bright">✦</span>
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wide text-gold-bright sm:text-xl">
                  {clan.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                  {clan.tagline}
                </p>
              </div>
              <p className="font-display text-[9px] tracking-[0.3em] text-gold-dim uppercase">
                ARC · Zenith
              </p>
            </article>
          ))}
        </div>
      </div>

      <p
        ref={outroRef}
        className="pointer-events-none absolute bottom-16 left-0 right-0 z-20 text-center font-display text-[10px] tracking-[0.45em] uppercase opacity-0 sm:text-xs"
        style={{ color: "rgba(212,175,55,0.55)" }}
      >
        The realm opens beyond the banners
      </p>
    </section>
  );
}

function smoothstep(p: number, a: number, b: number) {
  if (p <= a) return 0;
  if (p >= b) return 1;
  const t = (p - a) / (b - a);
  return t * t * (3 - 2 * t);
}
