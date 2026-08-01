import type { Metadata } from "next";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { requireAuth } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Dashboard | MIR4 Tracker · ARC",
  description:
    "Overview of the current MIR4 server, clan, alliance, and player ecosystem.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="hub-theme relative min-h-screen">
      {/* Atmospheric hall backdrop — CSS only (no SVG feTurbulence) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 15%, rgba(60,80,120,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(212,175,55,0.06), transparent 50%), linear-gradient(180deg, #0a1224 0%, #070b14 40%, #050810 100%)",
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
