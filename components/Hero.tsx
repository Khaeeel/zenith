"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroScroll } from "@/lib/mapWorld";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

type HeroProps = {
  ready: boolean;
};

export default function Hero({ ready }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [use3d, setUse3d] = useState(true);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setUse3d(false);
    }
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !use3d) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "15% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [use3d]);

  useEffect(() => {
    if (!ready || !sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    heroScroll.progress = 0;

    let ctx: gsap.Context | null = null;
    const id = requestAnimationFrame(() => {
      if (!sectionRef.current) return;
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=110%",
          pin: true,
          scrub: 0.35,
          anticipatePin: 1,
          onUpdate: (self) => {
            heroScroll.progress = self.progress;
          },
          onRefresh: (self) => {
            heroScroll.progress = self.progress;
          },
        });

        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { opacity: 1, y: 0 },
            {
              opacity: 0,
              y: 32,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "+=30%",
                scrub: true,
              },
            },
          );
        }
      }, sectionRef);
    });

    return () => {
      cancelAnimationFrame(id);
      ctx?.revert();
      heroScroll.progress = 0;
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-[#020205]"
    >
      <div className="absolute inset-0">
        {use3d ? (
          <Canvas
            camera={{ position: [0, 0.65, 6.2], fov: 40, near: 0.1, far: 80 }}
            dpr={1}
            frameloop={inView ? "always" : "never"}
            performance={{ min: 0.5, debounce: 200 }}
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        ) : (
          <div className="flex h-full items-center justify-center bg-[#020205]">
            <div className="h-40 w-40 rounded-full border border-gold/40 gold-glow" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-28 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[28%] bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 sm:pb-16"
      >
        <motion.div
          className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-display text-[10px] tracking-[0.5em] text-gold/80 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-xs">
            Chapter 01 · Origin · MIR4
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-[0.12em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] sm:text-5xl md:text-6xl">
            <span className="shimmer-text block">APEX RESISTANCE</span>
            <span className="gold-text mt-2 block">COALITION</span>
          </h1>

          <div className="mt-1 flex items-center gap-3">
            <span className="h-px w-8 bg-gold-dim/60 sm:w-14" />
            <p className="font-display text-[10px] tracking-[0.25em] text-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-xs">
              ONE RESISTANCE <span className="text-gold-bright">✦</span> ONE
              COALITION <span className="text-gold-bright">✦</span> ONE FUTURE
            </p>
            <span className="h-px w-8 bg-gold-dim/60 sm:w-14" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-[0.35em] text-gold-dim uppercase">
              Scroll to enter the film
            </span>
            <div className="animate-scroll-hint flex h-8 w-5 items-start justify-center rounded-full border border-gold/40 p-1">
              <div className="h-1.5 w-1 rounded-full bg-gold" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
