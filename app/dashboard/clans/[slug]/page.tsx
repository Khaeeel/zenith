import Link from "next/link";
import { notFound } from "next/navigation";
import ClanHierarchy from "@/components/dashboard/ClanHierarchy";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import { formatNumber, formatPower, getClanBySlug } from "@/lib/tracker/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ClanDetailPage({ params }: Props) {
  const { slug } = await params;
  const clan = await getClanBySlug(slug);
  if (!clan) notFound();

  const alliance = clan.alliance;
  const allianceClans = alliance?.clans.map((c) => c.clan) ?? [];
  const alliancePower = allianceClans.reduce(
    (sum, c) =>
      sum + c.members.reduce((s, m) => s + Number(m.powerScore), 0),
    0,
  );
  const alliancePlayers = allianceClans.reduce(
    (sum, c) => sum + c.members.length,
    0,
  );

  return (
    <div>
      <Link
        href="/dashboard/clans"
        className="mb-6 inline-block font-display text-[10px] tracking-[0.2em] text-[#c9a84a]/80 uppercase hover:text-[#f0d060]"
      >
        ← Clan List
      </Link>

      <OrnateFrame className="relative overflow-hidden px-6 py-8 sm:px-8">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[#d4af37]/55 bg-[rgba(212,175,55,0.12)] font-display text-2xl text-[#f0d060]">
            {clan.name.slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl tracking-[0.08em] text-[#f2efe6] uppercase">
              {clan.name}
            </h1>
            <p className="mt-1 font-display text-sm italic text-[#d4af37]/90">
              {clan.server.region.toUpperCase()} · {clan.server.name}
            </p>
            <p className="mt-0.5 text-sm text-[#c9a84a]/80">
              {alliance?.name ?? "No Alliance"}
            </p>
            <div className="mt-5 flex flex-wrap gap-6">
              <div>
                <p className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Players
                </p>
                <p className="mt-1 font-display text-lg">{clan.players}</p>
              </div>
              <div>
                <p className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Power
                </p>
                <p className="mt-1 font-display text-lg text-[#d4af37]">
                  {formatPower(clan.totalPower)}
                </p>
              </div>
              <div>
                <p className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Rank
                </p>
                <p className="mt-1 font-display text-lg text-[#f0d060]">
                  #{clan.rank}
                </p>
              </div>
            </div>
          </div>
        </div>
      </OrnateFrame>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-[#d4af37]/2 pb-3">
        {[
          ["overview", "Overview"],
          ["members", "Members"],
          ["resources", "Resources"],
          ["alliance", "Alliance"],
          ["history", "History"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="px-3 py-1.5 font-display text-[10px] tracking-[0.2em] text-[#c9a84a]/75 uppercase transition hover:bg-[rgba(212,175,55,0.1)] hover:text-[#f0d060]"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="overview" className="mt-10 scroll-mt-24">
        <h2 className="hub-section-title mb-6">Clan Hierarchy</h2>
        <div id="members" className="scroll-mt-24">
          <OrnateFrame className="px-3 py-6 sm:px-5 sm:py-8" ornate={false}>
            <ClanHierarchy members={clan.hierarchyMembers} />
          </OrnateFrame>
        </div>
      </section>

      <section id="resources" className="mt-10 scroll-mt-24">
        <h2 className="hub-section-title mb-5">Clan Resources</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <OrnateFrame className="px-5 py-6">
            <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
              Clan Fund
            </p>
            <p className="mt-4 font-display text-2xl text-[#f0d060]">
              {formatNumber(Number(clan.resources?.clanFund ?? 0))}
            </p>
          </OrnateFrame>
          <OrnateFrame className="px-5 py-6">
            <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
              Darksteel
            </p>
            <p className="mt-4 font-display text-2xl text-[#f0d060]">
              {formatNumber(Number(clan.resources?.darksteel ?? 0))}
            </p>
          </OrnateFrame>
          <OrnateFrame className="px-5 py-6">
            <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
              Clan Energy
            </p>
            <p className="mt-4 font-display text-2xl text-[#f0d060]">
              {formatNumber(Number(clan.resources?.clanEnergy ?? 0))}
            </p>
            <p className="mt-2 text-sm text-[rgba(242,239,230,0.5)]">
              {clan.resources?.energyCapacityPct ?? 0}% Capacity
            </p>
          </OrnateFrame>
        </div>
      </section>

      <section id="alliance" className="mt-10 scroll-mt-24">
        <h2 className="hub-section-title mb-5">Alliance</h2>
        {alliance ? (
          <OrnateFrame className="px-5 py-6">
            <p className="font-display text-xl tracking-wide text-[#f0d060] uppercase">
              {alliance.name}
            </p>
            <p className="mt-3 text-sm text-[rgba(242,239,230,0.55)]">
              Alliance Leader{" "}
              <span className="text-[#f0d060]">🛡 {alliance.leader.name}</span>
            </p>
            <ul className="mt-6 divide-y divide-[#d4af37]/15 border border-[#d4af37]/25">
              {allianceClans.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <Link
                    href={`/dashboard/clans/${c.slug}`}
                    className="text-[#f0d060] hover:underline"
                  >
                    {c.name}
                  </Link>
                  <span className="text-[rgba(242,239,230,0.5)]">
                    {c.members.length} Players
                  </span>
                  <span className="font-display text-[#d4af37]">
                    {formatPower(
                      c.members.reduce((s, m) => s + Number(m.powerScore), 0),
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-[rgba(242,239,230,0.55)]">
              <p>
                Total Alliance Power:{" "}
                <span className="text-[#d4af37]">{formatPower(alliancePower)}</span>
              </p>
              <p>
                Total Players:{" "}
                <span className="text-[rgba(242,239,230,0.85)]">
                  {alliancePlayers}
                </span>
              </p>
            </div>
          </OrnateFrame>
        ) : (
          <OrnateFrame className="px-5 py-6 text-sm text-[rgba(242,239,230,0.45)]">
            This clan is not currently in an alliance.
          </OrnateFrame>
        )}
      </section>

      <section className="mt-10">
        <h2 className="hub-section-title mb-5">Unattackable Clans</h2>
        {clan.unattackables.length > 0 ? (
          <OrnateFrame className="overflow-hidden">
            <div className="divide-y divide-[#d4af37]/15">
              {clan.unattackables.map((u) => (
                <div key={u.id} className="px-5 py-4">
                  <p className="font-display text-sm text-[#f0d060]">
                    🛡 {u.protectedClan.name}
                  </p>
                  <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">
                    {u.protectedClan.server.name}
                  </p>
                  <p className="mt-1 text-xs tracking-wide text-[#8a7028] uppercase">
                    Status: Protected
                    {u.protectionType ? ` · ${u.protectionType}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </OrnateFrame>
        ) : (
          <OrnateFrame className="px-5 py-6 text-sm text-[rgba(242,239,230,0.45)]">
            No protected clans listed.
          </OrnateFrame>
        )}
      </section>

      <section id="history" className="mt-10 scroll-mt-24">
        <h2 className="hub-section-title mb-5">History</h2>
        <OrnateFrame className="px-5 py-6 text-sm text-[rgba(242,239,230,0.45)]">
          Clan history timeline coming soon.
        </OrnateFrame>
      </section>
    </div>
  );
}
