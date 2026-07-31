export type ServerStatus = "active" | "peace" | "maintenance";

export type TrackerServer = {
  id: string;
  name: string;
  region: string;
  status: ServerStatus;
};

export type TrackerAlliance = {
  id: string;
  name: string;
  leaderClanId: string;
  clanIds: string[];
  status: "active" | "inactive";
  updatedAt: string;
};

export type ClanRole =
  | "Clan Leader"
  | "Elder"
  | "Master Protector"
  | "Member";

export type TrackerPlayer = {
  id: string;
  name: string;
  power: number;
  role: ClanRole;
  /** Sub-title shown on elder cards (e.g. Master Protector) */
  title?: string;
  online?: boolean;
  photo?: string;
};

export type ClanResources = {
  clanFund: number;
  clanFundDelta: number;
  darksteel: number;
  darksteelDelta: number;
  clanEnergy: number;
  energyCapacityPct: number;
};

export type TrackerClan = {
  id: string;
  slug: string;
  name: string;
  region: string;
  serverId: string;
  allianceId: string | null;
  players: number;
  totalPower: number;
  rank: number;
  emblem?: string;
  members: TrackerPlayer[];
  resources: ClanResources;
  unattackableClanIds: string[];
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  icon: "bell" | "war";
  createdAt: string;
};

export const TRACKER_SERVERS: TrackerServer[] = [
  { id: "asia-01", name: "ASIA-01", region: "Asia", status: "active" },
  { id: "asia-02", name: "ASIA-02", region: "Asia", status: "active" },
  { id: "asia-03", name: "ASIA-03", region: "Asia", status: "peace" },
  { id: "na-01", name: "NA-01", region: "NA", status: "active" },
  { id: "na-02", name: "NA-02", region: "NA", status: "peace" },
  { id: "eu-01", name: "EU-01", region: "EU", status: "active" },
  { id: "eu-02", name: "EU-02", region: "EU", status: "maintenance" },
  { id: "sea-01", name: "SEA-01", region: "SEA", status: "active" },
];

function player(
  id: string,
  name: string,
  power: number,
  role: ClanRole,
  extra?: Partial<Pick<TrackerPlayer, "title" | "online">>,
): TrackerPlayer {
  return {
    id,
    name,
    power,
    role,
    online: extra?.online ?? true,
    title: extra?.title,
  };
}

const ELDER_NAMES = [
  "ShadowVein",
  "GoldFang",
  "NightBloom",
  "IronPulse",
  "StormReed",
  "VoidLance",
  "CrimsonOwl",
  "SilverRune",
  "DawnBreaker",
] as const;

const MEMBER_NAMES = [
  "AshWalker",
  "FrostBite",
  "MoonSlayer",
  "ThunderFox",
  "BladeDancer",
  "SoulForge",
  "NightHawk",
  "EmberLily",
  "StoneGuard",
  "WindReaper",
  "BloodOrchid",
  "StarPiercer",
  "DarkWarden",
  "LightSpear",
  "JadeTiger",
  "PhantomAxe",
  "CrystalFang",
  "RavenKing",
  "SolarFlint",
  "IceWarden",
  "FlameNest",
  "DustRider",
  "SkyHarpoon",
  "GraveSong",
  "LotusBlade",
  "IronPetal",
  "StormCrow",
  "SilentOath",
  "GoldTempest",
  "BlueMonk",
  "RedCinder",
  "PaleKnight",
  "ArcWarden",
  "MythSpear",
  "NovaFang",
  "ShadeHowl",
  "BrightCoil",
  "ObsidianFox",
  "TrueNorth",
  "ZenithRay",
] as const;

function buildZenithRoster(): TrackerPlayer[] {
  const leader = player("zenith-leader", "ApexPrime", 1_842_420, "Clan Leader", {
    online: true,
  });

  const elders = ELDER_NAMES.map((name, i) =>
    player(`zenith-elder-${i + 1}`, name, 1_520_000 - i * 28_000, "Elder", {
      title: i < 4 ? "Master Protector" : "Elder",
      online: i % 5 !== 3,
    }),
  );

  const members = MEMBER_NAMES.map((name, i) =>
    player(
      `zenith-member-${i + 1}`,
      name,
      1_180_000 - i * 14_500,
      "Member",
      { online: i % 4 !== 2 },
    ),
  );

  return [leader, ...elders, ...members];
}

export const TRACKER_CLANS: TrackerClan[] = [
  {
    id: "zenith",
    slug: "zenith",
    name: "Zenith",
    region: "Asia",
    serverId: "asia-01",
    allianceId: "zenith-alliance",
    players: 50,
    totalPower: 18_400_000,
    rank: 1,
    resources: {
      clanFund: 12_482_920,
      clanFundDelta: 124_200,
      darksteel: 8_421_300,
      darksteelDelta: 52_400,
      clanEnergy: 3_821_420,
      energyCapacityPct: 82,
    },
    unattackableClanIds: ["phoenix", "immortal"],
    members: buildZenithRoster(),
  },
  {
    id: "dragonlegion",
    slug: "dragonlegion",
    name: "DragonLegion",
    region: "Asia",
    serverId: "asia-01",
    allianceId: "zenith-alliance",
    players: 78,
    totalPower: 17_200_000,
    rank: 2,
    resources: {
      clanFund: 9_210_400,
      clanFundDelta: 88_100,
      darksteel: 6_102_000,
      darksteelDelta: 41_200,
      clanEnergy: 3_100_000,
      energyCapacityPct: 74,
    },
    unattackableClanIds: ["phoenix"],
    members: [
      player("dl-1", "DragonLord", 1_710_200, "Clan Leader"),
      player("dl-2", "ScaleBreaker", 1_390_000, "Elder"),
      player("dl-3", "EmberWing", 1_250_000, "Master Protector"),
      player("dl-4", "AshRider", 1_080_000, "Member"),
    ],
  },
  {
    id: "immortal",
    slug: "immortal",
    name: "Immortal",
    region: "Asia",
    serverId: "asia-02",
    allianceId: "zenith-alliance",
    players: 51,
    totalPower: 13_800_000,
    rank: 3,
    resources: {
      clanFund: 7_540_000,
      clanFundDelta: 42_000,
      darksteel: 4_880_000,
      darksteelDelta: 22_100,
      clanEnergy: 2_640_000,
      energyCapacityPct: 68,
    },
    unattackableClanIds: [],
    members: [
      player("im-1", "EternalOne", 1_520_000, "Clan Leader"),
      player("im-2", "Timeless", 1_210_000, "Elder"),
      player("im-3", "Forever", 980_000, "Member"),
    ],
  },
  {
    id: "phoenix",
    slug: "phoenix",
    name: "Phoenix",
    region: "Asia",
    serverId: "asia-01",
    allianceId: "zenith-alliance",
    players: 44,
    totalPower: 11_600_000,
    rank: 4,
    resources: {
      clanFund: 5_920_000,
      clanFundDelta: 31_500,
      darksteel: 3_740_000,
      darksteelDelta: 18_400,
      clanEnergy: 2_100_000,
      energyCapacityPct: 61,
    },
    unattackableClanIds: [],
    members: [
      player("ph-1", "Reborn", 1_340_000, "Clan Leader"),
      player("ph-2", "Ashwing", 1_050_000, "Elder"),
      player("ph-3", "FlameNest", 890_000, "Member"),
    ],
  },
  {
    id: "xyz",
    slug: "xyz",
    name: "XYZ",
    region: "Asia",
    serverId: "asia-02",
    allianceId: null,
    players: 65,
    totalPower: 16_800_000,
    rank: 5,
    resources: {
      clanFund: 8_100_000,
      clanFundDelta: 55_000,
      darksteel: 5_200_000,
      darksteelDelta: 29_000,
      clanEnergy: 2_900_000,
      energyCapacityPct: 70,
    },
    unattackableClanIds: [],
    members: [
      player("xyz-1", "UnknownX", 1_620_000, "Clan Leader"),
      player("xyz-2", "Ypsilon", 1_180_000, "Elder"),
      player("xyz-3", "Zeta", 940_000, "Member"),
    ],
  },
  {
    id: "abc",
    slug: "abc",
    name: "ABC",
    region: "Asia",
    serverId: "asia-01",
    allianceId: null,
    players: 61,
    totalPower: 15_900_000,
    rank: 6,
    resources: {
      clanFund: 7_800_000,
      clanFundDelta: 48_000,
      darksteel: 4_950_000,
      darksteelDelta: 27_500,
      clanEnergy: 2_750_000,
      energyCapacityPct: 66,
    },
    unattackableClanIds: [],
    members: [
      player("abc-1", "AlphaLead", 1_580_000, "Clan Leader"),
      player("abc-2", "BetaGuard", 1_120_000, "Elder"),
      player("abc-3", "Gamma", 910_000, "Member"),
    ],
  },
];

export const TRACKER_ALLIANCES: TrackerAlliance[] = [
  {
    id: "zenith-alliance",
    name: "Zenith Alliance",
    leaderClanId: "zenith",
    clanIds: ["zenith", "dragonlegion", "immortal", "phoenix"],
    status: "active",
    updatedAt: "2026-07-30T21:00:00.000Z",
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Server Maintenance — ASIA-01",
    body: "Scheduled maintenance on July 31, 2026",
    icon: "bell",
    createdAt: "2026-07-30T21:30:00.000Z",
  },
  {
    id: "a2",
    title: "Alliance War Season Started",
    body: "New alliance rankings are now available.",
    icon: "war",
    createdAt: "2026-07-30T18:30:00.000Z",
  },
];

export function formatPower(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${m.toFixed(1)}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function getServer(id: string) {
  return TRACKER_SERVERS.find((s) => s.id === id);
}

export function getAlliance(id: string | null) {
  if (!id) return null;
  return TRACKER_ALLIANCES.find((a) => a.id === id) ?? null;
}

export function getClanBySlug(slug: string) {
  return TRACKER_CLANS.find((c) => c.slug === slug);
}

export function getClanById(id: string) {
  return TRACKER_CLANS.find((c) => c.id === id);
}

export function getDashboardStats() {
  const totalPlayers = TRACKER_CLANS.reduce((sum, c) => sum + c.players, 0);
  const totalClans = TRACKER_CLANS.length;
  const totalServers = TRACKER_SERVERS.length;
  const activeServers = TRACKER_SERVERS.filter((s) => s.status === "active")
    .length;
  const peaceServers = TRACKER_SERVERS.filter((s) => s.status === "peace")
    .length;
  const totalPower = TRACKER_CLANS.reduce((sum, c) => sum + c.totalPower, 0);

  return {
    totalPlayers,
    totalClans,
    totalServers,
    activeServers,
    peaceServers,
    totalPower,
  };
}

export function getTopClansByPower(limit = 5) {
  return [...TRACKER_CLANS]
    .sort((a, b) => b.totalPower - a.totalPower)
    .slice(0, limit);
}

export function getStrongestClan() {
  return getTopClansByPower(1)[0];
}

export function getLargestClan() {
  return [...TRACKER_CLANS].sort((a, b) => b.players - a.players)[0];
}

export function getLatestAlliance() {
  return TRACKER_ALLIANCES[0];
}

export function relativeTime(iso: string, now = new Date("2026-07-30T23:30:00.000Z")) {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  return `${hours}h ago`;
}

export const REGIONS = ["Asia", "NA", "EU", "SEA"] as const;
