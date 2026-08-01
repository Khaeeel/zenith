import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="hub-theme min-h-screen">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(60,80,120,0.32), transparent 55%), linear-gradient(180deg, #0a1224 0%, #070b14 100%)",
        }}
      />
      <AdminNav
        displayName={session.user.displayName}
        appRole={session.user.appRole}
      />
      <div className="relative lg:pl-64">
        <main className="mx-auto w-full max-w-[min(100%,80rem)] px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
