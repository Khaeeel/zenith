import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import { MIR4_CLASSES } from "@/lib/clans";
import {
  softDeleteMemberAction,
  upsertMemberAction,
} from "@/lib/actions/clans-members";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ clanId?: string }>;
}) {
  const session = await requireAdmin();
  const { clanId: filterClan } = await searchParams;

  const clans = await db.clan.findMany({
    where: {
      deletedAt: null,
      ...(session.user.appRole === "clan_admin" && session.user.clanId
        ? { id: session.user.clanId }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  const activeClanId = filterClan || clans[0]?.id;

  const members = activeClanId
    ? await db.member.findMany({
        where: { clanId: activeClanId, deletedAt: null },
        orderBy: [{ role: "asc" }, { powerScore: "desc" }],
      })
    : [];

  return (
    <div>
      <PageHeader title="Members" description="Manage clan roster and roles." />

      <div className="mb-6 flex flex-wrap gap-2">
        {clans.map((c) => (
          <a
            key={c.id}
            href={`/admin/members?clanId=${c.id}`}
            className={`hub-btn ${activeClanId === c.id ? "hub-btn-filled" : ""}`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {activeClanId ? (
        <OrnateFrame className="mb-8 p-5">
          <h2 className="mb-4 font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase">
            Add member
          </h2>
          <form action={upsertMemberAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="clanId" value={activeClanId} />
            <input name="name" placeholder="IGN" className="hub-input" required />
            <select name="role" className="hub-select" defaultValue="member">
              <option value="clan_leader">Clan Leader</option>
              <option value="elder">Elder</option>
              <option value="master_protector">Master Protector</option>
              <option value="member">Member</option>
            </select>
            <input
              name="powerScore"
              placeholder="Power score"
              className="hub-input"
              required
            />
            <select name="classId" className="hub-select" defaultValue="warrior">
              {MIR4_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="hub-btn-filled sm:col-span-2 lg:col-span-3">
              Add member
            </button>
          </form>
        </OrnateFrame>
      ) : null}

      <div className="space-y-3">
        {members.map((m) => (
          <OrnateFrame key={m.id} className="p-4" ornate={false}>
            <form action={upsertMemberAction} className="grid gap-2 sm:grid-cols-5">
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="clanId" value={m.clanId} />
              <input name="name" defaultValue={m.name} className="hub-input" />
              <select name="role" defaultValue={m.role} className="hub-select">
                <option value="clan_leader">Clan Leader</option>
                <option value="elder">Elder</option>
                <option value="master_protector">Master Protector</option>
                <option value="member">Member</option>
              </select>
              <input
                name="powerScore"
                defaultValue={m.powerScore.toString()}
                className="hub-input"
              />
              <select name="classId" defaultValue={m.classId ?? ""} className="hub-select">
                {MIR4_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="hub-btn flex-1">
                  Save
                </button>
              </div>
            </form>
            <form action={softDeleteMemberAction.bind(null, m.id)} className="mt-2">
              <button type="submit" className="text-xs text-red-400/80 hover:text-red-300">
                Soft delete
              </button>
            </form>
          </OrnateFrame>
        ))}
      </div>
    </div>
  );
}
