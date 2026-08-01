"use client";

/** Thin cinematic bars — fixed height (no layout thrash from height transitions). */
export default function Letterbox({ ready }: { ready: boolean }) {
  return (
    <>
      <div
        className={`pointer-events-none fixed top-0 right-0 left-0 z-[70] h-3 bg-black transition-opacity duration-500 sm:h-4 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none fixed right-0 bottom-0 left-0 z-[70] h-3 bg-black transition-opacity duration-500 sm:h-4 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
    </>
  );
}
