"use client";

import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const cells = [
    ["Days", days],
    ["Hrs", hrs],
    ["Mins", mins],
    ["Secs", secs],
  ] as const;

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="border border-[#d4af37]/25 bg-[rgba(0,0,0,0.25)] px-1 py-2 text-center"
        >
          <p className="font-display text-lg text-[#f0d060]">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-[9px] tracking-widest text-[#8a7028] uppercase">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
