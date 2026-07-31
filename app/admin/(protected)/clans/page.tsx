import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import {
  softDeleteClanAction,
  upsertClanAction,
  updateClanResourcesAction,
} from "@/lib/actions/clans-members";

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

  return (
    <div>
      <PageHeader title="Clans" description="Create and edit tracked clans." />

      <OrnateFrame className="mb-8 p-5">
        <h2 className="mb-4 font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase">
          Create clan
        </h2>
        <form action={upsertClanAction} className="grid gap-3 sm:grid-cols-3">
          <input name="name" placeholder="Name" className="hub-input" required />
          <input name="slug" placeholder="slug (optional)" className="hub-input" />
          <select name="serverId" className="hub-select" required defaultValue="">
            <option value="" disabled>
              Server
            </option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="submit" className="hub-btn-filled sm:col-span-3">
            Create
          </button>
        </form>
      </OrnateFrame>

      <div className="space-y-4">
        {clans.map((clan) => (
          <OrnateFrame key={clan.id} className="p-5" ornate={false}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg text-[#f0d060]">{clan.name}</p>
                <p className="text-sm text-[rgba(242,239,230,0.5)]">
                  /{clan.slug} · {clan.server.name} · {clan._count.members} members
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/clans/${clan.slug}`}
                  className="hub-btn"
                >
                  View
                </Link>
                <form action={softDeleteClanAction.bind(null, clan.id)}>
                  <button type="submit" className="hub-btn">
                    Soft delete
                  </button>
                </form>
              </div>
            </div>

            <form action={upsertClanAction} className="mt-4 grid gap-2 sm:grid-cols-3">
              <input type="hidden" name="id" value={clan.id} />
              <input name="name" defaultValue={clan.name} className="hub-input" />
              <input name="slug" defaultValue={clan.slug} className="hub-input" />
              <select name="serverId" defaultValue={clan.serverId} className="hub-select">
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="hub-btn sm:col-span-3">
                Save clan
              </button>
            </form>

            <form
              action={updateClanResourcesAction}
              className="mt-4 grid gap-2 border-t border-[#d4af37]/15 pt-4 sm:grid-cols-4"
            >
              <input type="hidden" name="clanId" value={clan.id} />
              <input
                name="clanFund"
                className="hub-input"
                defaultValue={clan.resources?.clanFund.toString() ?? "0"}
                placeholder="Clan fund"
              />
              <input
                name="darksteel"
                className="hub-input"
                defaultValue={clan.resources?.darksteel.toString() ?? "0"}
                placeholder="Darksteel"
              />
              <input
                name="clanEnergy"
                className="hub-input"
                defaultValue={clan.resources?.clanEnergy.toString() ?? "0"}
                placeholder="Energy"
              />
              <input
                name="energyCapacityPct"
                className="hub-input"
                defaultValue={clan.resources?.energyCapacityPct ?? 0}
                placeholder="Capacity %"
              />
              <button type="submit" className="hub-btn sm:col-span-4">
                Save resources
              </button>
            </form>
          </OrnateFrame>
        ))}
      </div>
    </div>
  );
}
