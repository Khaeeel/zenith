import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import PageHeader from "@/components/dashboard/PageHeader";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import ConfirmForm from "@/components/admin/ConfirmForm";
import AdminField from "@/components/admin/AdminField";
import AdminMembersRoster from "@/components/admin/AdminMembersRoster";
import { MIR4_CLASSES } from "@/lib/clans";
import {
  importMembersCsvAction,
  upsertMemberAction,
} from "@/lib/actions/clans-members";
import { MEMBER_CSV_REQUIRED_HEADERS } from "@/lib/csv";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    clanId?: string;
    imported?: string;
    importError?: string;
  }>;
}) {
  const session = await requireAdmin();
  const { clanId: filterClan, imported, importError } = await searchParams;

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
  const activeClan = clans.find((c) => c.id === activeClanId);
  const clanIds = clans.map((c) => c.id);

  const allMembers =
    clanIds.length > 0
      ? await db.member.findMany({
          where: { clanId: { in: clanIds }, deletedAt: null },
          orderBy: [{ role: "asc" }, { powerScore: "desc" }],
        })
      : [];

  const clanNameById = new Map(clans.map((c) => [c.id, c.name]));
  const members = activeClanId
    ? allMembers.filter((m) => m.clanId === activeClanId)
    : [];

  const roleCounts = {
    clan_leader: members.filter((m) => m.role === "clan_leader").length,
    elder: members.filter((m) => m.role === "elder").length,
    master_protector: members.filter((m) => m.role === "master_protector")
      .length,
    member: members.filter((m) => m.role === "member").length,
  };
  const totalPower = members.reduce((s, m) => s + Number(m.powerScore), 0);
  const topPower = members.reduce(
    (max, m) => Math.max(max, Number(m.powerScore)),
    0,
  );
  const formatMini = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const rosterMembers = allMembers.map((m) => ({
    id: m.id,
    ign: m.ign,
    role: m.role,
    powerScore: m.powerScore.toString(),
    classId: m.classId,
    clanId: m.clanId,
    clanName: clanNameById.get(m.clanId) ?? "—",
  }));

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title="Members"
        description="Manage clan roster and roles."
        belowTitle={
          activeClanId ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
              <div className="border border-[#d4af37]/20 bg-[rgba(8,12,22,0.55)] px-3 py-2.5 sm:py-3">
                <p className="font-display text-[9px] tracking-[0.22em] text-[#8a7028] uppercase">
                  Roster
                </p>
                <p className="mt-1 font-display text-sm text-[#f2efe6]">
                  {members.length}{" "}
                  <span className="text-[rgba(242,239,230,0.4)]">members</span>
                </p>
              </div>
              <div className="border border-[#d4af37]/20 bg-[rgba(8,12,22,0.55)] px-3 py-2.5 sm:py-3">
                <p className="font-display text-[9px] tracking-[0.22em] text-[#8a7028] uppercase">
                  Total power
                </p>
                <p className="mt-1 font-display text-sm text-[#d4af37]">
                  {formatMini(totalPower)}
                </p>
              </div>
              <div className="col-span-2 border border-[#d4af37]/20 bg-[rgba(8,12,22,0.55)] px-3 py-2.5 sm:col-span-1 sm:py-3">
                <p className="font-display text-[9px] tracking-[0.22em] text-[#8a7028] uppercase">
                  Top CP
                </p>
                <p className="mt-1 font-display text-sm text-[#f2efe6]">
                  {formatMini(topPower)}
                </p>
              </div>
              <div className="col-span-2 border border-[#d4af37]/20 bg-[rgba(8,12,22,0.55)] px-3 py-2.5 sm:py-3 lg:col-span-3">
                <p className="font-display text-[9px] tracking-[0.22em] text-[#8a7028] uppercase">
                  Role mix
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[rgba(242,239,230,0.65)] sm:gap-x-4 sm:text-xs">
                  <span>
                    Leader{" "}
                    <strong className="text-[#f0d060]">
                      {roleCounts.clan_leader}
                    </strong>
                  </span>
                  <span>
                    Elder{" "}
                    <strong className="text-[#f0d060]">{roleCounts.elder}</strong>
                  </span>
                  <span>
                    Protector{" "}
                    <strong className="text-[#f0d060]">
                      {roleCounts.master_protector}
                    </strong>
                  </span>
                  <span>
                    Member{" "}
                    <strong className="text-[#f0d060]">{roleCounts.member}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : null
        }
        aside={
          activeClanId ? (
            <OrnateFrame className="w-full p-3 sm:p-4" ornate={false}>
              <h2 className="mb-1 font-display text-xs tracking-[0.2em] text-[#f0d060] uppercase">
                Import CSV
              </h2>
              <div className="mb-3 space-y-1 text-[10px] leading-relaxed text-[rgba(242,239,230,0.45)] sm:text-[11px]">
                <p className="break-all">
                  Columns:{" "}
                  <code className="text-[#f0d060]">
                    {MEMBER_CSV_REQUIRED_HEADERS.join(", ")}
                  </code>
                </p>
                <p className="break-all">
                  <span className="text-[rgba(242,239,230,0.55)]">role</span> —{" "}
                  <code className="text-[#f0d060]">
                    clan_leader, elder, master_protector, member
                  </code>
                </p>
                <p>
                  <span className="text-[rgba(242,239,230,0.55)]">
                    power_score
                  </span>{" "}
                  — whole number only
                </p>
                <p className="break-all">
                  <span className="text-[rgba(242,239,230,0.55)]">class</span> —{" "}
                  <code className="text-[#f0d060]">
                    {MIR4_CLASSES.map((c) => c.id).join(", ")}
                  </code>
                </p>
              </div>
              <ConfirmForm
                action={importMembersCsvAction}
                className="space-y-3"
                title="Import CSV"
                message={`Import members into ${activeClan?.name ?? "this clan"}? If “Replace roster” is checked, existing members will be soft-deleted first.`}
                confirmLabel="Import"
                notifySuccess={false}
              >
                <input type="hidden" name="clanId" value={activeClanId} />
                <input
                  type="file"
                  name="file"
                  accept=".csv,text/csv"
                  required
                  className="hub-input w-full max-w-full text-xs file:mr-2 file:border-0 file:bg-transparent file:font-display file:text-[10px] file:tracking-widest file:text-[#f0d060] file:uppercase"
                />
                <label className="flex items-center gap-2 text-xs text-[rgba(242,239,230,0.6)]">
                  <input
                    type="checkbox"
                    name="replace"
                    value="1"
                    className="accent-[#d4af37]"
                  />
                  Replace roster
                </label>
                <button type="submit" className="hub-btn-filled w-full">
                  Import CSV
                </button>
              </ConfirmForm>
            </OrnateFrame>
          ) : null
        }
      />

      {importError ? (
        <div
          className="mb-6 break-words border border-red-500/40 bg-red-950/40 px-3 py-3 text-sm text-red-200 sm:px-4"
          role="alert"
        >
          Import failed: {importError}
        </div>
      ) : null}
      {imported ? (
        <div
          className="mb-6 border border-[#d4af37]/35 bg-[rgba(212,175,55,0.08)] px-3 py-3 text-sm text-[#f0d060] sm:px-4"
          role="status"
        >
          Imported {imported} member{imported === "1" ? "" : "s"}
          {activeClan ? ` into ${activeClan.name}` : ""}.
        </div>
      ) : null}

      {activeClanId ? (
        <OrnateFrame className="mb-6 p-4 sm:mb-8 sm:p-5">
          <h2 className="mb-4 font-display text-sm tracking-[0.2em] text-[#f0d060] uppercase">
            Add member
          </h2>
          <ConfirmForm
            action={upsertMemberAction}
            className="space-y-3"
            title="Add member"
            message="Create this member on the roster?"
            confirmLabel="Add member"
            successMessage="Member added successfully."
          >
            <input type="hidden" name="clanId" value={activeClanId} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AdminField label="IGN" required>
                <input
                  name="ign"
                  placeholder="IGN"
                  className="hub-input"
                  required
                />
              </AdminField>
              <AdminField label="Role">
                <select name="role" className="hub-select" defaultValue="member">
                  <option value="clan_leader">Clan Leader</option>
                  <option value="elder">Elder</option>
                  <option value="master_protector">Master Protector</option>
                  <option value="member">Member</option>
                </select>
              </AdminField>
              <AdminField label="Power score" required>
                <input
                  name="powerScore"
                  placeholder="e.g. 250000000"
                  className="hub-input"
                  inputMode="numeric"
                  pattern="[0-9,]+"
                  title="Enter a whole number"
                  required
                />
              </AdminField>
              <AdminField label="Class">
                <select
                  name="classId"
                  className="hub-select"
                  defaultValue="warrior"
                >
                  {MIR4_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>
            <button type="submit" className="hub-btn-filled w-full sm:w-auto">
              Add member
            </button>
          </ConfirmForm>
        </OrnateFrame>
      ) : null}

      <AdminMembersRoster
        clans={clans.map((c) => ({ id: c.id, name: c.name }))}
        members={rosterMembers}
        activeClanId={activeClanId}
      />
    </div>
  );
}
