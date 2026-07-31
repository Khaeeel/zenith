"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type PreloaderProps = {
  onComplete: () => void;
};

/** Survives Strict Mode / HMR — once true, preloader never covers again. */
let bootFinished = false;

/**
 * Boot slate — counts once, then lifts away.
 * bootFinished is set synchronously so interrupted timers can't leave a stuck overlay.
 */
export default function Preloader({ onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(() => !bootFinished);
  const [phase, setPhase] = useState<"load" | "reveal">("load");
  const counterRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bootFinished) {
      setVisible(false);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
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

    if (prefersReduced) {
      bootFinished = true;
      setVisible(false);
      unlock();
      window.scrollTo(0, 0);
      onComplete();
      return;
    }

    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const duration = 1500;
    const timers: number[] = [];

    const complete = () => {
      if (bootFinished) {
        setVisible(false);
        unlock();
        onComplete();
        return;
      }
      bootFinished = true;
      if (counterRef.current) counterRef.current.textContent = "100";
      if (barRef.current) barRef.current.style.width = "100%";
      setPhase("reveal");
      setVisible(false);
      window.scrollTo(0, 0);
      unlock();
      // Tiny delay so exit animation can paint, then notify parent
      const id = window.setTimeout(() => onComplete(), 80);
      timers.push(id);
    };

    const tick = (now: number) => {
      if (cancelled || bootFinished) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = t * 0.85 + (1 - Math.pow(1 - t, 2)) * 0.15;
      const pct = Math.round(eased * 100);
      if (counterRef.current) {
        counterRef.current.textContent = String(pct).padStart(3, "0");
      }
      if (barRef.current) barRef.current.style.width = `${pct}%`;

      if (t < 1) raf = requestAnimationFrame(tick);
      else complete();
    };

    raf = requestAnimationFrame(tick);
    timers.push(window.setTimeout(complete, duration + 350));

    // Absolute failsafe — never leave the slate up more than ~2.8s
    timers.push(window.setTimeout(complete, 2800));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      if (!bootFinished) unlock();
    };
  }, [onComplete]);

  if (!visible && bootFinished) {
    // Skip AnimatePresence entirely once done — no ghost overlay
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
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(212,175,55,0.22), transparent 70%)",
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
            <motion.div
              className="relative"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(212,175,55,0.3))",
                  "drop-shadow(0 0 55px rgba(240,208,96,0.75))",
                  "drop-shadow(0 0 20px rgba(212,175,55,0.3))",
                ],
              }}
              transition={{
                filter: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Image
                src="/assets/logo.png"
                alt="APEX RESISTANCE COALITION"
                width={200}
                height={200}
                priority
                className="h-40 w-40 object-contain sm:h-48 sm:w-48"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-2">
              <h1 className="font-display text-center text-sm tracking-[0.4em] text-gold-bright sm:text-base">
                APEX RESISTANCE COALITION
              </h1>
              <p className="text-[10px] tracking-[0.45em] text-gold-dim uppercase">
                {phase === "reveal"
                  ? "Welcome, recruit"
                  : "Forging the resistance"}
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
