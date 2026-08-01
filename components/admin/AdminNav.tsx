"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { SidebarNavItems } from "@/components/dashboard/SidebarNavItems";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/clans", label: "Clans" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/alliances", label: "Alliances" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/account", label: "Account" },
] as const;

function matchActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatRoleLabel(role: string) {
  if (role === "super_admin") return "Admin";
  if (role === "clan_admin") return "Clan Admin";
  return role.replace(/_/g, " ");
}

export default function AdminNav({
  displayName,
  appRole,
}: {
  displayName: string;
  appRole: string;
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
      <aside className="fixed top-0 left-0 z-40 hidden h-full w-64 flex-col border-r border-[#d4af37]/25 bg-[rgba(8,12,22,0.97)] shadow-[8px_0_40px_rgba(0,0,0,0.45)] lg:flex">
        <div className="relative overflow-hidden border-b border-[#d4af37]/25 px-5 py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at top left, rgba(212,175,55,0.18), transparent 60%)",
            }}
          />
          <div className="relative flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt=""
              className="h-10 w-10 object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.4)]"
            />
            <div>
              <p className="font-display text-[11px] tracking-[0.18em] text-[#f0d060]">
                COMMAND ADMIN
              </p>
              <p className="mt-1 text-[9px] tracking-[0.16em] text-[#c9a84a]/65 uppercase">
                {displayName === "Super Admin" ? "Admin" : displayName}
              </p>
            </div>
          </div>
          <p className="relative mt-3 inline-block border border-[#d4af37]/35 bg-[rgba(212,175,55,0.08)] px-2 py-0.5 font-display text-[8px] tracking-[0.2em] text-[#c9a84a] uppercase">
            {formatRoleLabel(appRole)}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          <SidebarNavItems items={NAV} />
        </nav>

        <div className="space-y-2 border-t border-[#d4af37]/2 p-3">
          <Link href="/dashboard" className="hub-btn block w-full text-center">
            Public site
          </Link>
          <ConfirmForm
            action={async () => {
              await logoutAction("/admin/login");
            }}
            title="Sign out"
            message="Sign out of the admin panel?"
            confirmLabel="Sign out"
            notifySuccess={false}
          >
            <button type="submit" className="hub-btn-filled w-full py-2.5">
              Sign out
            </button>
          </ConfirmForm>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-[#d4af37]/2 bg-[rgba(7,11,20,0.92)] px-3 py-3 backdrop-blur-md lg:hidden">
        {isPending ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[#d4af37]/15"
            aria-hidden
          >
            <div className="hub-nav-progress h-full w-1/3 bg-gradient-to-r from-transparent via-[#f0d060] to-transparent" />
          </div>
        ) : null}
        {NAV.map((n) => {
          const on = matchActive(highlightPath, n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
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
                if (matchActive(pathname, n.href, n.exact)) return;
                e.preventDefault();
                setPendingHref(n.href);
                router.push(n.href);
              }}
              className={`shrink-0 whitespace-nowrap rounded-sm px-2.5 py-1.5 font-display text-[9px] tracking-widest uppercase ${
                on
                  ? "bg-[rgba(212,175,55,0.15)] text-[#f0d060]"
                  : "text-[#c9a84a]/75"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </header>
    </>
  );
}
