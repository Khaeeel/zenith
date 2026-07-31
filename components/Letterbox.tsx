"use client";

import { useEffect, useState } from "react";

const CHAPTER_IDS = [
  "hero",
  "manifesto",
  "runway",
  "territories",
  "join",
] as const;

const HEIGHT: Record<string, string> = {
  hero: "h-5 sm:h-7",
  manifesto: "h-6 sm:h-8",
  runway: "h-5 sm:h-7",
  territories: "h-3 sm:h-4",
  join: "h-6 sm:h-8",
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

/** Cinematic letterbox — opens wider over the realm map. */
export default function Letterbox({ ready }: { ready: boolean }) {
  const [chapter, setChapter] = useState("hero");

  useEffect(() => {
    if (!ready) return;
    const onScroll = () => setChapter(activeChapterId());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = window.setTimeout(onScroll, 800);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, [ready]);

  const h = ready ? HEIGHT[chapter] ?? "h-5 sm:h-7" : "h-0";

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
