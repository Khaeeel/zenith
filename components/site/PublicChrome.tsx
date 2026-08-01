import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
];

export default function PublicChrome({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "home" | "clans" | "contact";
}) {
  return (
    <div className="hub-theme relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(90,120,180,0.28), transparent 50%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(212,175,55,0.08), transparent 45%), linear-gradient(180deg, #0b1224 0%, #070b14 45%, #050810 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
            mixBlendMode: "overlay",
          }}
        />
        <div
          className="absolute top-0 left-1/2 h-[50vh] w-[65vw] -translate-x-1/2 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(180,200,255,0.16), transparent 65%)",
          }}
        />
      </div>

      <header className="relative z-30 border-b border-[#d4af37]/20 bg-[rgba(7,11,20,0.72)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt="ARC"
              className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]"
            />
            <div className="hidden sm:block">
              <p className="font-display text-[11px] tracking-[0.18em] text-[#f0d060]">
                ARC COMMAND HUB
              </p>
              <p className="text-[9px] tracking-[0.2em] text-[#c9a84a]/60 uppercase">
                Official portal
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
            {LINKS.map((l) => {
              const isActive =
                (active === "home" && l.href === "/") ||
                (active === "contact" && l.href === "/contact");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`font-display text-[10px] tracking-[0.2em] uppercase transition ${
                    isActive
                      ? "border-b border-[#f0d060] pb-0.5 text-[#f0d060]"
                      : "text-[#c9a84a]/75 hover:text-[#f0d060]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="rounded-full border border-[#d4af37]/55 px-3 py-1.5 font-display text-[10px] tracking-[0.18em] text-[#f0d060] uppercase shadow-[0_0_16px_rgba(212,175,55,0.2)] transition hover:bg-gold/10"
            >
              Sign in
            </Link>
            <Link
              href="/admin/login"
              className="hidden rounded-full border border-[#d4af37]/55 px-3 py-1.5 font-display text-[10px] tracking-[0.18em] text-[#f0d060] uppercase shadow-[0_0_16px_rgba(212,175,55,0.2)] transition hover:bg-gold/10 sm:inline"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 mt-20 border-t border-[#d4af37]/2 bg-[rgba(5,8,16,0.85)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <p className="font-display text-xs tracking-[0.25em] text-[#f0d060]">
              APEX RESISTANCE COALITION
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[rgba(242,239,230,0.4)]">
              MIR4 · Zenith · Unofficial fan community portal
            </p>
          </div>
          <div className="text-center">
            <p className="font-display text-sm italic leading-relaxed text-[#c9a84a]/80">
              Lead with discipline. Fight with unity. Build with purpose.
            </p>
          </div>
          <div className="md:text-right">
            <p className="font-display text-[10px] tracking-[0.2em] text-[#8a7028] uppercase">
              Proud member of ARC
            </p>
            <div className="mt-3 flex gap-3 md:justify-end">
              <Link href="/contact" className="text-xs text-[#c9a84a]/70 hover:text-[#f0d060]">
                Contact
              </Link>
              <Link href="/login" className="text-xs text-[#c9a84a]/70 hover:text-[#f0d060]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
