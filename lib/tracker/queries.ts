import { cache } from "react";
import { db } from "@/lib/db";
import { formatPower, formatNumber, relativeTime } from "@/lib/tracker-format";

export { formatPower, formatNumber, relativeTime };

export type ClanListItem = {
  id: string;
  slug: string;
  name: string;
  region: string;
  serverName: string;
  serverId: string;
  allianceName: string | null;
  allianceId: string | null;
  players: number;
  totalPower: number;
};

/** Deduped within a single request — dashboard used to call this 3×. */
export const getClansForList = cache(async (): Promise<ClanListItem[]> => {
  const [clans, memberStats] = await Promise.all([
    db.clan.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        serverId: true,
        server: { select: { name: true, region: true } },
        allianceMemberships: {
          take: 1,
          select: {
            allianceId: true,
            alliance: { select: { name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    db.member.groupBy({
      by: ["clanId"],
      where: { deletedAt: null },
      _sum: { powerScore: true },
      _count: { _all: true },
    }),
  ]);

  const statsByClan = new Map(
    memberStats.map((s) => [
      s.clanId,
      {
        players: s._count._all,
        totalPower: Number(s._sum.powerScore ?? BigInt(0)),
      },
    ]),
  );

  return clans.map((c) => {
    const stats = statsByClan.get(c.id) ?? { players: 0, totalPower: 0 };
    const membership = c.allianceMemberships[0];
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      region: c.server.region,
      serverName: c.server.name,
      serverId: c.serverId,
      allianceName: membership?.alliance.name ?? null,
      allianceId: membership?.allianceId ?? null,
      players: stats.players,
      totalPower: stats.totalPower,
    };
  });
});

export const getDashboardStats = cache(async () => {
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
});

export async function getAnnouncements(limit = 10) {
  return db.announcement.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      body: true,
      icon: true,
      createdAt: true,
      image: { select: { id: true, url: true, alt: true } },
    },
  });
}

export type RoleMixItem = {
  role: "clan_leader" | "elder" | "master_protector" | "member";
  label: string;
  count: number;
};

const ROLE_LABELS: Record<RoleMixItem["role"], string> = {
  clan_leader: "Clan Leader",
  elder: "Elder",
  master_protector: "Master Protector",
  member: "Member",
};

const ROLE_ORDER: RoleMixItem["role"][] = [
  "clan_leader",
  "elder",
  "master_protector",
  "member",
];

export const getRoleMix = cache(async (): Promise<RoleMixItem[]> => {
  const rows = await db.member.groupBy({
    by: ["role"],
    where: { deletedAt: null },
    _count: { _all: true },
  });
  const byRole = new Map(rows.map((r) => [r.role, r._count._all]));
  return ROLE_ORDER.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    count: byRole.get(role) ?? 0,
  }));
});

/** One fetch for the dashboard overview — avoids 3× getClansForList. */
export async function getDashboardOverview() {
  const [stats, clans, alliance, announcements, roleMix] = await Promise.all([
    getDashboardStats(),
    getClansForList(),
    getLatestAlliance(),
    getAnnouncements(5),
    getRoleMix(),
  ]);

  const byPower = [...clans].sort((a, b) => b.totalPower - a.totalPower);
  const byPlayers = [...clans].sort((a, b) => b.players - a.players);

  return {
    stats,
    strongest: byPower[0] ?? null,
    largest: byPlayers[0] ?? null,
    topClans: byPower.slice(0, 5),
    chartClans: byPower.slice(0, 10),
    roleMix,
    alliance,
    announcements,
  };
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
      allianceMemberships: {
        take: 1,
        include: { alliance: true },
      },
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
        leader: { select: { id: true, name: true, slug: true } },
        clans: {
          include: {
            clan: {
              select: {
                id: true,
                name: true,
                slug: true,
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

  // Rank without loading every member row again
  const list = await getClansForList();
  const ranked = [...list].sort((a, b) => b.totalPower - a.totalPower);
  const rank = ranked.findIndex((c) => c.id === clan.id) + 1;

  return {
    ...clan,
    totalPower,
    players: clan.members.length,
    rank: rank || 0,
    alliance,
    hierarchyMembers: clan.members.map((m) => ({
      id: m.id,
      name: m.ign,
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
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
      clans: {
        select: {
          clan: {
            select: {
              id: true,
              name: true,
              slug: true,
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
  return db.alliance.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getClansForJoin() {
  return db.clan.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
