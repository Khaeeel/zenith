import type { Metadata } from "next";
import DashboardSidebar from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard | MIR4 Tracker · ARC",
  description:
    "Overview of the current MIR4 server, clan, alliance, and player ecosystem.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hub-theme relative min-h-screen">
      {/* Atmospheric hall backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 15%, rgba(60,80,120,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(212,175,55,0.06), transparent 50%), linear-gradient(180deg, #0a1224 0%, #070b14 40%, #050810 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
            backgroundSize: "180px 180px",
            mixBlendMode: "overlay",
          }}
        />
        <div
          className="absolute top-0 left-1/2 h-[55vh] w-[70vw] -translate-x-1/2 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(180,200,255,0.18), transparent 65%)",
          }}
        />
      </div>

      <DashboardSidebar />
      <div className="relative lg:pl-64">
        <main className="min-h-screen px-4 pt-20 pb-16 sm:px-6 lg:px-10 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
