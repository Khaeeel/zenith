"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function matchActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  soon?: boolean;
};

export function SidebarNavItems({
  items,
  onNavigate,
}: {
  items: readonly NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isPending = pendingHref !== null && pendingHref !== pathname;
  const highlightPath = pendingHref ?? pathname;

  return (
    <>
      {isPending ? (
        <div
          className="pointer-events-none fixed top-0 right-0 left-0 z-[80] h-0.5 overflow-hidden bg-[#d4af37]/15 lg:left-64"
          aria-hidden
        >
          <div className="hub-nav-progress h-full w-1/3 bg-gradient-to-r from-transparent via-[#f0d060] to-transparent" />
        </div>
      ) : null}

      {items.map((item) => {
        if (item.soon) {
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

        const active = matchActive(highlightPath, item.href, item.exact);
        const navigatingHere = isPending && pendingHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onClick={(e) => {
              if (
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey ||
                e.altKey ||
                e.button !== 0
              ) {
                return;
              }
              if (matchActive(pathname, item.href, item.exact)) {
                onNavigate?.();
                return;
              }
              e.preventDefault();
              onNavigate?.();
              setPendingHref(item.href);
              router.push(item.href);
            }}
            className={`rounded-sm px-3 py-2.5 font-display text-[10px] tracking-[0.22em] uppercase transition-colors duration-150 ${
              active
                ? "border border-[#d4af37]/50 bg-[rgba(212,175,55,0.12)] text-[#f0d060] shadow-[0_0_16px_rgba(212,175,55,0.15)]"
                : "border border-transparent text-[#c9a84a]/75 hover:border-[#d4af37]/25 hover:bg-[rgba(212,175,55,0.06)] hover:text-[#f0d060]"
            } ${navigatingHere ? "opacity-90" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
            {navigatingHere ? (
              <span className="ml-2 inline-block text-[8px] tracking-widest text-[#f0d060]/70">
                …
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
