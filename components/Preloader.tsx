"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type PreloaderProps = {
  /** Fire early so homepage can mount WebGL/GSAP under the cover */
  onWarm?: () => void;
  onComplete: () => void;
};

/** Survives Strict Mode / HMR — once true, preloader never covers again. */
let bootFinished = false;

/**
 * Boot slate — counter runs while homepage warms underneath, then a quick lift.
 */
export default function Preloader({ onWarm, onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(() => !bootFinished);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const warmedRef = useRef(false);

  useEffect(() => {
    if (bootFinished) {
      setVisible(false);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      onWarm?.();
      onComplete();
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const unlock = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    const warm = () => {
      if (warmedRef.current) return;
      warmedRef.current = true;
      onWarm?.();
    };

    if (prefersReduced) {
      bootFinished = true;
      setVisible(false);
      unlock();
      warm();
      window.scrollTo(0, 0);
      onComplete();
      return;
    }

    void import("@/components/three/HeroScene");
    const logo = new window.Image();
    logo.src = "/assets/logo.png";

    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const duration = 750;
    const timers: number[] = [];

    // Start mounting homepage under the slate ASAP
    timers.push(window.setTimeout(warm, 80));

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      bootFinished = true;
      warm();
      if (counterRef.current) counterRef.current.textContent = "100";
      if (barRef.current) barRef.current.style.width = "100%";
      window.scrollTo(0, 0);
      unlock();
      // Fade out only — heavy work already warmed
      setVisible(false);
      onComplete();
    };

    const tick = (now: number) => {
      if (cancelled || bootFinished) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2.2);
      const pct = Math.round(eased * 100);
      if (counterRef.current) {
        counterRef.current.textContent = String(pct).padStart(3, "0");
      }
      if (barRef.current) barRef.current.style.width = `${pct}%`;

      if (t < 1) raf = requestAnimationFrame(tick);
      else finish();
    };

    raf = requestAnimationFrame(tick);
    timers.push(window.setTimeout(finish, 1200));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      if (!bootFinished) unlock();
    };
  }, [onWarm, onComplete]);

  if (!visible && bootFinished) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col bg-[#030305]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(212,175,55,0.18), transparent 70%)",
            }}
          />

          <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12">
            <p
              ref={counterRef}
              className="font-display text-6xl leading-none tracking-tight text-gold-bright/90 tabular-nums sm:text-8xl md:text-9xl"
            >
              000
            </p>
            <p className="mt-2 font-display text-[10px] tracking-[0.45em] text-gold-dim uppercase">
              Establishing link
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-[-20%] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(240,208,96,0.35), transparent 70%)",
                }}
              />
              <Image
                src="/assets/logo.png"
                alt="APEX RESISTANCE COALITION"
                width={200}
                height={200}
                priority
                className="relative h-40 w-40 object-contain sm:h-48 sm:w-48"
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <h1 className="font-display text-center text-sm tracking-[0.4em] text-gold-bright sm:text-base">
                APEX RESISTANCE COALITION
              </h1>
              <p className="text-[10px] tracking-[0.45em] text-gold-dim uppercase">
                Forging the resistance
              </p>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 h-[2px] bg-white/5">
            <div
              ref={barRef}
              className="h-full bg-gradient-to-r from-gold-dim via-gold to-gold-bright"
              style={{ width: "0%" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
