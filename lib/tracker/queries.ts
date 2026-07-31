import { db } from "@/lib/db";
import { formatPower, formatNumber, relativeTime } from "@/lib/tracker-format";

export { formatPower, formatNumber, relativeTime };

export async function getDashboardStats() {
  const [clans, servers, members, powerAgg, activeServers, peaceServers] =
    await Promise.all([
      db.clan.count({ where: { deletedAt: null } }),
      db.server.count(),
      db.member.count({ where: { deletedAt: null } }),
      db.member.aggregate({
        where: { deletedAt: null },
        _sum: { powerScore: true },
      }),
      db.server.count({ where: { status: "active" } }),
      db.server.count({ where: { status: "peace" } }),
    ]);

  return {
    totalPlayers: members,
    totalClans: clans,
    totalServers: servers,
    activeServers,
    peaceServers,
    totalPower: Number(powerAgg._sum.powerScore ?? BigInt(0)),
  };
}

export async function getAnnouncements(limit = 10) {
  return db.announcement.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getClansForList() {
  const clans = await db.clan.findMany({
    where: { deletedAt: null },
    include: {
      server: true,
      allianceMemberships: { include: { alliance: true } },
      members: { where: { deletedAt: null }, select: { powerScore: true } },
    },
    orderBy: { name: "asc" },
  });

  return clans.map((c) => {
    const totalPower = c.members.reduce((s, m) => s + Number(m.powerScore), 0);
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      region: c.server.region,
      serverName: c.server.name,
      serverId: c.serverId,
      allianceName: c.allianceMemberships[0]?.alliance.name ?? null,
      allianceId: c.allianceMemberships[0]?.allianceId ?? null,
      players: c.members.length,
      totalPower,
    };
  });
}

export async function getClanBySlug(slug: string) {
  const clan = await db.clan.findFirst({
    where: { slug, deletedAt: null },
    include: {
      server: true,
      resources: true,
      members: {
        where: { deletedAt: null },
        orderBy: [{ powerScore: "desc" }],
      },
      allianceMemberships: { include: { alliance: true } },
      unattackables: {
        include: { protectedClan: { include: { server: true } } },
      },
    },
  });
  if (!clan) return null;

  const totalPower = clan.members.reduce((s, m) => s + Number(m.powerScore), 0);
  const allianceId = clan.allianceMemberships[0]?.allianceId ?? null;
  let alliance = null;
  if (allianceId) {
    alliance = await db.alliance.findUnique({
      where: { id: allianceId },
      include: {
        leader: true,
        clans: {
          include: {
            clan: {
              include: {
                members: {
                  where: { deletedAt: null },
                  select: { powerScore: true },
                },
              },
            },
          },
        },
      },
    });
  }

  const allClans = await getClansForList();
  const ranked = [...allClans].sort((a, b) => b.totalPower - a.totalPower);
  const rank = ranked.findIndex((c) => c.id === clan.id) + 1;

  return {
    ...clan,
    totalPower,
    players: clan.members.length,
    rank: rank || 0,
    alliance,
    hierarchyMembers: clan.members.map((m) => ({
      id: m.id,
      name: m.name,
      power: Number(m.powerScore),
      role:
        m.role === "clan_leader"
          ? ("Clan Leader" as const)
          : m.role === "elder"
            ? ("Elder" as const)
            : m.role === "master_protector"
              ? ("Master Protector" as const)
              : ("Member" as const),
      online: true,
    })),
  };
}

export async function getTopClansByPower(limit = 5) {
  const list = await getClansForList();
  return [...list].sort((a, b) => b.totalPower - a.totalPower).slice(0, limit);
}

export async function getStrongestClan() {
  return (await getTopClansByPower(1))[0] ?? null;
}

export async function getLargestClan() {
  const list = await getClansForList();
  return [...list].sort((a, b) => b.players - a.players)[0] ?? null;
}

export async function getLatestAlliance() {
  return db.alliance.findFirst({
    where: { status: "active" },
    include: {
      clans: {
        include: {
          clan: {
            include: {
              members: {
                where: { deletedAt: null },
                select: { powerScore: true },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedEvents() {
  return db.event.findMany({
    where: { deletedAt: null, isPublished: true },
    include: { icon: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getPublishedContacts() {
  return db.contact.findMany({
    where: { deletedAt: null, isPublished: true },
    include: { icon: true },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getServersAndRegions() {
  const servers = await db.server.findMany({ orderBy: { name: "asc" } });
  const regions = [...new Set(servers.map((s) => s.region))];
  return { servers, regions };
}

export async function getAlliancesForFilter() {
  return db.alliance.findMany({ orderBy: { name: "asc" } });
}

export async function getClansForJoin() {
  return db.clan.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
