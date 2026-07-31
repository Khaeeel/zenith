"use client";

import { useState } from "react";

export default function AdminCollapsible({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#d4af37]/25 bg-[rgba(10,16,28,0.75)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-[rgba(212,175,55,0.06)]"
        aria-expanded={open}
      >
        <div>
          <p className="font-display text-sm tracking-[0.18em] text-[#f0d060] uppercase">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-[rgba(242,239,230,0.45)]">{subtitle}</p>
          ) : null}
        </div>
        <span
          className={`font-display text-lg text-[#d4af37] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open ? <div className="border-t border-[#d4af37]/2 px-5 py-4">{children}</div> : null}
    </div>
  );
}
