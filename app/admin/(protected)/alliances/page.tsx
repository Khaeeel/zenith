import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import { upsertAllianceAction } from "@/lib/actions/content";

export default async function AdminAlliancesPage() {
  await requireAdmin();
  const [alliances, clans] = await Promise.all([
    db.alliance.findMany({
      include: { clans: true, leader: true },
      orderBy: { name: "asc" },
    }),
    db.clan.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Alliances" description="Assign clans and set alliance leaders." />

      <OrnateFrame className="mb-8 p-5">
        <form action={upsertAllianceAction} className="grid gap-3">
          <input name="name" placeholder="Alliance name" className="hub-input" required />
          <select name="leaderClanId" className="hub-select" required defaultValue="">
            <option value="" disabled>
              Leader clan
            </option>
            {clans.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="grid gap-2 sm:grid-cols-2">
            {clans.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-[#c9a84a]">
                <input type="checkbox" name="clanIds" value={c.id} /> {c.name}
              </label>
            ))}
          </div>
          <button type="submit" className="hub-btn-filled">
            Create alliance
          </button>
        </form>
      </OrnateFrame>

      <div className="space-y-4">
        {alliances.map((a) => {
          const memberIds = new Set(a.clans.map((c) => c.clanId));
          return (
            <OrnateFrame key={a.id} className="p-5" ornate={false}>
              <form action={upsertAllianceAction} className="grid gap-3">
                <input type="hidden" name="id" value={a.id} />
                <input name="name" defaultValue={a.name} className="hub-input" />
                <select
                  name="leaderClanId"
                  defaultValue={a.leaderClanId}
                  className="hub-select"
                >
                  {clans.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="grid gap-2 sm:grid-cols-2">
                  {clans.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm text-[#c9a84a]"
                    >
                      <input
                        type="checkbox"
                        name="clanIds"
                        value={c.id}
                        defaultChecked={memberIds.has(c.id)}
                      />{" "}
                      {c.name}
                    </label>
                  ))}
                </div>
                <button type="submit" className="hub-btn">
                  Save alliance
                </button>
              </form>
            </OrnateFrame>
          );
        })}
      </div>
    </div>
  );
}
