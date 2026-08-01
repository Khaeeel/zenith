"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import ConfirmForm from "@/components/admin/ConfirmForm";


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
];

export default function AdminNav({
  displayName,
  appRole,
}: {
  displayName: string;
  appRole: string;
}) {
  const pathname = usePathname();

  function active(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

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
                {displayName}
              </p>
            </div>
          </div>
          <p className="relative mt-3 inline-block border border-[#d4af37]/35 bg-[rgba(212,175,55,0.08)] px-2 py-0.5 font-display text-[8px] tracking-[0.2em] text-[#c9a84a] uppercase">
            {appRole.replace("_", " ")}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {NAV.map((item) => {
            const on = active(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-sm px-3 py-2.5 font-display text-[10px] tracking-[0.2em] uppercase transition ${
                  on
                    ? "border border-[#d4af37]/45 bg-[rgba(212,175,55,0.14)] text-[#f0d060] shadow-[0_0_18px_rgba(212,175,55,0.12)]"
                    : "border border-transparent text-[#c9a84a]/70 hover:border-[#d4af37]/2 hover:bg-[rgba(212,175,55,0.06)] hover:text-[#f0d060]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-[#d4af37]/2 p-3">
          <Link href="/dashboard" className="hub-btn block w-full text-center">
            Public site
          </Link>
          <ConfirmForm
            action={async () => {
              await logoutAction();
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
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`shrink-0 whitespace-nowrap rounded-sm px-2.5 py-1.5 font-display text-[9px] tracking-widest uppercase ${
              active(n.href, n.exact)
                ? "bg-[rgba(212,175,55,0.15)] text-[#f0d060]"
                : "text-[#c9a84a]/75"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </header>
    </>
  );
}
