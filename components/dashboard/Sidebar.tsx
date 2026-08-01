"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/clans", label: "Clans" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/announcements", label: "Announcements" },
  { href: "/dashboard/servers", label: "Servers", soon: true },
  { href: "/dashboard/alliances", label: "Alliances", soon: true },
  { href: "/dashboard/players", label: "Players", soon: true },
  { href: "/dashboard/rankings", label: "Rankings", soon: true },
  { href: "/dashboard/reports", label: "Reports", soon: true },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 px-3 py-5">
      {NAV.map((item) => {
        const active = isActive(
          pathname,
          item.href,
          "exact" in item && item.exact,
        );
        const soon = "soon" in item && item.soon;

        if (soon) {
          return (
            <span
              key={item.href}
              className="flex items-center justify-between rounded-sm px-3 py-2.5 font-display text-[10px] tracking-[0.22em] text-[#8a7028]/55 uppercase"
            >
              {item.label}
              <span className="text-[8px] tracking-widest text-white/20">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`rounded-sm px-3 py-2.5 font-display text-[10px] tracking-[0.22em] uppercase transition ${
              active
                ? "border border-[#d4af37]/50 bg-[rgba(212,175,55,0.12)] text-[#f0d060] shadow-[0_0_16px_rgba(212,175,55,0.15)]"
                : "border border-transparent text-[#c9a84a]/75 hover:border-[#d4af37]/25 hover:bg-[rgba(212,175,55,0.06)] hover:text-[#f0d060]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-40 flex h-14 items-center justify-between border-b border-[#d4af37]/25 bg-[rgba(7,11,20,0.92)] px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-display text-[10px] tracking-[0.25em] text-[#f0d060] uppercase"
          aria-label="Open menu"
        >
          Menu
        </button>
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="ARC" className="h-7 w-7 object-contain" />
        </Link>
        <Link
          href="/"
          className="font-display text-[10px] tracking-[0.2em] text-[#c9a84a]/80 uppercase"
        >
          Home
        </Link>
      </header>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-[#d4af37]/25 bg-[rgba(8,12,22,0.96)] shadow-[4px_0_40px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-[#d4af37]/25 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt="ARC"
              className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]"
            />
            <div>
              <p className="font-display text-[11px] leading-tight tracking-[0.16em] text-[#f0d060]">
                MIR4 TRACKER
              </p>
              <p className="mt-1 text-[9px] tracking-[0.18em] text-[#c9a84a]/60 uppercase">
                Official Command Hub
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 font-display text-[10px] text-[#c9a84a]/70 lg:hidden"
          >
            Close
          </button>
        </div>

        {nav}

        <div className="mt-auto space-y-2 border-t border-[#d4af37]/2 p-4">
          <Link href="/admin" className="hub-btn block w-full text-center">
            Admin Hub
          </Link>
          <Link
            href="/"
            className="block text-center font-display text-[10px] tracking-[0.2em] text-gold/60 uppercase transition hover:text-gold-bright"
          >
            ← Homepage
          </Link>
        </div>
      </aside>
    </>
  );
}
