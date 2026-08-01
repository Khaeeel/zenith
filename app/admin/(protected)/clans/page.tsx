import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ConfirmForm from "@/components/admin/ConfirmForm";
import AdminField from "@/components/admin/AdminField";
import AdminClansList from "@/components/admin/AdminClansList";
import { upsertClanAction } from "@/lib/actions/clans-members";

export default async function AdminClansPage() {
  await requireAdmin();
  const [clans, servers] = await Promise.all([
    db.clan.findMany({
      where: { deletedAt: null },
      include: {
        server: true,
        resources: true,
        _count: { select: { members: { where: { deletedAt: null } } } },
      },
      orderBy: { name: "asc" },
    }),
    db.server.findMany({ orderBy: { name: "asc" } }),
  ]);

  const listClans = clans.map((clan) => ({
    id: clan.id,
    name: clan.name,
    slug: clan.slug,
    serverId: clan.serverId,
    serverName: clan.server.name,
    memberCount: clan._count.members,
    resources: clan.resources
      ? {
          clanFund: clan.resources.clanFund.toString(),
          darksteel: clan.resources.darksteel.toString(),
          clanEnergy: clan.resources.clanEnergy.toString(),
          energyCapacityPct: clan.resources.energyCapacityPct,
        }
      : null,
  }));

  return (
    <div>
      <PageHeader
        title="Clans"
        description="Create and edit tracked clans. Changes appear on the public dashboard clan list and overview."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/dashboard/clans" className="hub-btn">
          View dashboard clan list →
        </a>
      </div>

      <OrnateFrame className="mb-8 p-5">
        <h2 className="mb-4 font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase">
          Create clan
        </h2>
        {servers.length === 0 ? (
          <p className="text-sm text-red-300/80">
            No servers found. Add a server in the database before creating clans.
          </p>
        ) : (
          <ConfirmForm
            action={upsertClanAction}
            className="grid gap-3 sm:grid-cols-3"
            title="Create clan"
            message="Create this clan? It will appear on the public dashboard."
            confirmLabel="Create"
            successMessage="Clan created. It now appears on the dashboard."
          >
            <AdminField label="Name" required>
              <input name="name" placeholder="Name" className="hub-input" required />
            </AdminField>
            <AdminField label="Slug" hint="URL path; leave blank to auto-generate from name.">
              <input name="slug" placeholder="optional" className="hub-input" />
            </AdminField>
            <AdminField label="Server" required>
              <select name="serverId" className="hub-select" required defaultValue="">
                <option value="" disabled>
                  Select server
                </option>
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <button type="submit" className="hub-btn-filled sm:col-span-3">
              Create
            </button>
          </ConfirmForm>
        )}
      </OrnateFrame>

      <AdminClansList
        clans={listClans}
        servers={servers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
