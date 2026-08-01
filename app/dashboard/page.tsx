import Link from "next/link";
import OrnateFrame from "@/components/dashboard/OrnateFrame";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import PowerLine from "@/components/dashboard/charts/PowerLine";
import RoleDonut from "@/components/dashboard/charts/RoleDonut";
import {
  formatNumber,
  formatPower,
  getDashboardOverview,
  relativeTime,
} from "@/lib/tracker/queries";

/** Cache Neon reads briefly — was force-dynamic (6s+ cold trips). */
export const revalidate = 30;

export default async function DashboardPage() {
  const {
    stats,
    strongest,
    largest,
    topClans,
    chartClans,
    roleMix,
    alliance,
    announcements,
  } = await getDashboardOverview();

  const allianceClans = alliance?.clans.map((c) => c.clan) ?? [];
  const alliancePower = allianceClans.reduce(
    (sum, c) =>
      sum + c.members.reduce((s, m) => s + Number(m.powerScore), 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of the current MIR4 server, clan, alliance, and player ecosystem."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard index={1} label="Total Players" value={formatNumber(stats.totalPlayers)} icon="players" />
        <StatCard index={2} label="Total Clans" value={formatNumber(stats.totalClans)} icon="clans" />
        <StatCard index={3} label="Total Servers" value={formatNumber(stats.totalServers)} icon="servers" />
        <StatCard index={4} label="Active Servers" value={formatNumber(stats.activeServers)} icon="active" />
        <StatCard index={5} label="Peace Servers" value={formatNumber(stats.peaceServers)} icon="peace" />
        <StatCard index={6} label="Total Power" value={formatPower(stats.totalPower)} icon="power" />
      </section>

      <section className="mt-12">
        <h2 className="hub-section-title mb-5">Command Insights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <OrnateFrame className="overflow-hidden" ornate={false}>
            <div className="border-b border-[#d4af37]/2 px-5 py-3">
              <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
                Top Clans by Power
              </p>
            </div>
            <PowerLine clans={chartClans} />
          </OrnateFrame>
          <OrnateFrame className="overflow-hidden" ornate={false}>
            <div className="border-b border-[#d4af37]/2 px-5 py-3">
              <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
                Roster Role Mix
              </p>
            </div>
            <RoleDonut roles={roleMix} />
          </OrnateFrame>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="hub-section-title">Announcements</h2>
          <Link
            href="/dashboard/announcements"
            className="font-display text-[10px] tracking-[0.2em] text-[#c9a84a]/80 uppercase transition hover:text-[#f0d060]"
          >
            View all →
          </Link>
        </div>
        <OrnateFrame className="overflow-hidden">
          <div className="relative divide-y divide-[#d4af37]/15">
            {announcements.map((a) => (
              <article
                key={a.id}
                className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  {a.image ? (
                    <div className="mb-3 aspect-video max-w-sm overflow-hidden border border-[#d4af37]/25 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.image.url}
                        alt={a.image.alt ?? a.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="font-display text-sm tracking-wide text-[#f0d060]">
                    <span className="mr-2 opacity-80">
                      {a.icon === "bell" ? "🔔" : "⚔️"}
                    </span>
                    {a.title}
                  </p>
                  <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">{a.body}</p>
                </div>
                <p className="shrink-0 font-display text-[10px] tracking-widest text-[#8a7028] uppercase sm:pt-1">
                  {relativeTime(a.createdAt)}
                </p>
              </article>
            ))}
            {announcements.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[rgba(242,239,230,0.4)]">
                No announcements yet.
              </p>
            ) : null}
          </div>
        </OrnateFrame>
      </section>

      <section className="mt-12">
        <h2 className="hub-section-title mb-5">Clan Report</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {strongest ? (
            <OrnateFrame className="px-5 py-6">
              <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
                Strongest Clan
              </p>
              <p className="mt-4 font-display text-xl text-[#f0d060]">
                🛡 {strongest.name}
              </p>
              <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">
                {formatPower(strongest.totalPower)} Total Power
              </p>
              <Link href={`/dashboard/clans/${strongest.slug}`} className="mt-5 inline-flex hub-btn">
                View clan →
              </Link>
            </OrnateFrame>
          ) : null}
          {largest ? (
            <OrnateFrame className="px-5 py-6">
              <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
                Largest Clan
              </p>
              <p className="mt-4 font-display text-xl text-[#f0d060]">
                ⚔️ {largest.name}
              </p>
              <p className="mt-1 text-sm text-[rgba(242,239,230,0.5)]">
                {largest.players} Players
              </p>
              <Link href={`/dashboard/clans/${largest.slug}`} className="mt-5 inline-flex hub-btn">
                View clan →
              </Link>
            </OrnateFrame>
          ) : null}
        </div>

        <OrnateFrame className="mt-4 overflow-hidden">
          <div className="border-b border-[#d4af37]/2 px-5 py-3">
            <p className="font-display text-[10px] tracking-[0.22em] text-[#8a7028] uppercase">
              Top Clans by Power
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="hub-table min-w-[640px]">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Clan</th>
                  <th>Server</th>
                  <th>Players</th>
                  <th>Power</th>
                </tr>
              </thead>
              <tbody>
                {topClans.map((clan, i) => (
                  <tr key={clan.id}>
                    <td className="text-[rgba(242,239,230,0.35)]">{i + 1}</td>
                    <td>
                      <Link
                        href={`/dashboard/clans/${clan.slug}`}
                        className="text-[#f0d060] hover:underline"
                      >
                        {clan.name}
                      </Link>
                    </td>
                    <td>{clan.serverName}</td>
                    <td>{clan.players}</td>
                    <td className="font-display text-[#d4af37]">
                      {formatPower(clan.totalPower)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OrnateFrame>
      </section>

      {alliance ? (
        <section className="mt-12">
          <h2 className="hub-section-title mb-5">Latest Alliance Report</h2>
          <OrnateFrame className="px-5 py-6 sm:px-7">
            <p className="font-display text-xl tracking-wide text-[#f0d060]">
              {alliance.name}
            </p>
            <ul className="mt-4 space-y-2 border-l border-[#d4af37]/35 pl-4">
              {allianceClans.map((clan) => (
                <li key={clan.id} className="text-sm text-[rgba(242,239,230,0.7)]">
                  <Link
                    href={`/dashboard/clans/${clan.slug}`}
                    className="hover:text-[#f0d060]"
                  >
                    {clan.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[rgba(242,239,230,0.55)]">
              <p>
                <span className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Status
                </span>{" "}
                <span className="ml-2 text-[#f0d060] uppercase">{alliance.status}</span>
              </p>
              <p>
                <span className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Members
                </span>{" "}
                <span className="ml-2">{allianceClans.length} Clans</span>
              </p>
              <p>
                <span className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Total Power
                </span>{" "}
                <span className="ml-2 text-[#d4af37]">{formatPower(alliancePower)}</span>
              </p>
              <p>
                <span className="font-display text-[10px] tracking-widest text-[#8a7028] uppercase">
                  Last Updated
                </span>{" "}
                <span className="ml-2">{relativeTime(alliance.updatedAt)}</span>
              </p>
            </div>
          </OrnateFrame>
        </section>
      ) : null}
    </div>
  );
}
