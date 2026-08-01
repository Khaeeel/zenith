"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis only on the cinematic homepage — dashboard/admin use native scroll.
 * Tuned for responsive feel (short duration) and cheap resize handling.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const enableLenis = pathname === "/";

  useEffect(() => {
    if (!enableLenis) {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        // Shorter = less “draggy” scroll lag
        duration: 0.55,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.35,
        smoothWheel: true,
        autoRaf: false,
      });

      document.documentElement.classList.add("lenis", "lenis-smooth");
      (window as unknown as { __lenis?: typeof lenis }).__lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const syncLimit = () => {
        lenis.resize();
      };

      ScrollTrigger.addEventListener("refresh", syncLimit);

      const ticker = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(500, 33);

      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          lenis.resize();
          ScrollTrigger.refresh();
        }, 150);
      };
      window.addEventListener("resize", onResize);

      const t1 = window.setTimeout(syncLimit, 400);

      cleanup = () => {
        window.clearTimeout(t1);
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        ScrollTrigger.removeEventListener("refresh", syncLimit);
        gsap.ticker.remove(ticker);
        delete (window as unknown as { __lenis?: typeof lenis }).__lenis;
        document.documentElement.classList.remove("lenis", "lenis-smooth");
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enableLenis]);

  return <>{children}</>;
}
