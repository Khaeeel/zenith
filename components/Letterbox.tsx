"use client";

import { useEffect, useState } from "react";

const CHAPTER_IDS = [
  "hero",
  "manifesto",
  "runway",
  "territories",
  "join",
] as const;

/** Thin cinematic bars — keep small so page content is never half-covered. */
const HEIGHT: Record<string, string> = {
  hero: "h-3 sm:h-4",
  manifesto: "h-3 sm:h-4",
  runway: "h-3 sm:h-4",
  territories: "h-2 sm:h-3",
  join: "h-3 sm:h-4",
};

function activeChapterId(): string {
  let active = "hero";
  const threshold = window.innerHeight * 0.42;
  for (const id of CHAPTER_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const spacer = el.parentElement?.classList.contains("pin-spacer")
      ? el.parentElement
      : el;
    if (spacer.getBoundingClientRect().top < threshold) active = id;
  }
  return active;
}

/** Cinematic letterbox — thin bars only; never obscure half the viewport. */
export default function Letterbox({ ready }: { ready: boolean }) {
  const [chapter, setChapter] = useState("hero");

  useEffect(() => {
    if (!ready) return;
    const onScroll = () => setChapter(activeChapterId());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const lenis = (
      window as unknown as { __lenis?: { on: Function; off: Function } }
    ).__lenis;
    lenis?.on?.("scroll", onScroll);
    const t = window.setTimeout(onScroll, 800);
    return () => {
      window.removeEventListener("scroll", onScroll);
      lenis?.off?.("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, [ready]);

  const h = ready ? HEIGHT[chapter] ?? "h-3 sm:h-4" : "h-0";

  return (
    <>
      <div
        className={`pointer-events-none fixed top-0 right-0 left-0 z-[70] bg-black transition-all duration-700 ease-out ${h}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none fixed right-0 bottom-0 left-0 z-[70] bg-black transition-all duration-700 ease-out ${h}`}
        aria-hidden
      />
    </>
  );
}
