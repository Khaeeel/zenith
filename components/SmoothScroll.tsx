"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis only on the cinematic homepage — dashboard/admin use native scroll.
 * GSAP/ScrollTrigger are loaded only when Lenis is active (avoids nav jank).
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
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.5,
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
      gsap.ticker.lagSmoothing(0);

      const onResize = () => {
        lenis.resize();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      const t1 = window.setTimeout(syncLimit, 500);
      const t2 = window.setTimeout(syncLimit, 1400);

      cleanup = () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
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
