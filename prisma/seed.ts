import "dotenv/config";
import { PrismaClient, ClanRole, EventCategory, EventRecurrence, ContactKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ELDER_NAMES = [
  "ShadowVein", "GoldFang", "NightBloom", "IronPulse", "StormReed",
  "VoidLance", "CrimsonOwl", "SilverRune", "DawnBreaker",
];

const MP_NAMES = ["IronPulse", "StormReed", "VoidLance", "CrimsonOwl"];

const MEMBER_NAMES = [
  "AshWalker", "FrostBite", "MoonSlayer", "ThunderFox", "BladeDancer",
  "SoulForge", "NightHawk", "EmberLily", "StoneGuard", "WindReaper",
  "BloodOrchid", "StarPiercer", "DarkWarden", "LightSpear", "JadeTiger",
  "PhantomAxe", "CrystalFang", "RavenKing", "SolarFlint", "IceWarden",
  "FlameNest", "DustRider", "SkyHarpoon", "GraveSong", "LotusBlade",
  "IronPetal", "StormCrow", "SilentOath", "GoldTempest", "BlueMonk",
  "RedCinder", "PaleKnight", "ArcWarden", "MythSpear", "NovaFang",
  "ShadeHowl", "BrightCoil", "ObsidianFox", "TrueNorth", "ZenithRay",
];

async function main() {
  console.log("Seeding…");

  await db.joinApplication.deleteMany();
  await db.contact.deleteMany();
  await db.event.deleteMany();
  await db.announcement.deleteMany();
  await db.clanUnattackable.deleteMany();
  await db.allianceClan.deleteMany();
  await db.alliance.deleteMany();
  await db.user.deleteMany();
  await db.member.deleteMany();
  await db.clanResources.deleteMany();
  await db.clan.deleteMany();
  await db.server.deleteMany();
  await db.mediaAsset.deleteMany();

  const servers = await Promise.all(
    [
      { name: "ASIA-01", region: "Asia", status: "active" as const },
      { name: "ASIA-02", region: "Asia", status: "active" as const },
      { name: "ASIA-03", region: "Asia", status: "peace" as const },
      { name: "NA-01", region: "NA", status: "active" as const },
      { name: "NA-02", region: "NA", status: "peace" as const },
      { name: "EU-01", region: "EU", status: "active" as const },
      { name: "EU-02", region: "EU", status: "maintenance" as const },
      { name: "SEA-01", region: "SEA", status: "active" as const },
    ].map((s) => db.server.create({ data: s })),
  );

  const asia01 = servers.find((s) => s.name === "ASIA-01")!;
  const asia02 = servers.find((s) => s.name === "ASIA-02")!;

  const zenith = await db.clan.create({
    data: {
      slug: "zenith",
      name: "Zenith",
      serverId: asia01.id,
      resources: {
        create: {
          clanFund: 12_482_920n,
          darksteel: 8_421_300n,
          clanEnergy: 3_821_420n,
          energyCapacityPct: 82,
        },
      },
    },
  });

  const dragon = await db.clan.create({
    data: {
      slug: "dragonlegion",
      name: "DragonLegion",
      serverId: asia01.id,
      resources: {
        create: {
          clanFund: 9_210_400n,
          darksteel: 6_102_000n,
          clanEnergy: 3_100_000n,
          energyCapacityPct: 74,
        },
      },
    },
  });

  const immortal = await db.clan.create({
    data: {
      slug: "immortal",
      name: "Immortal",
      serverId: asia02.id,
      resources: {
        create: {
          clanFund: 7_540_000n,
          darksteel: 4_880_000n,
          clanEnergy: 2_640_000n,
          energyCapacityPct: 68,
        },
      },
    },
  });

  const phoenix = await db.clan.create({
    data: {
      slug: "phoenix",
      name: "Phoenix",
      serverId: asia01.id,
      resources: {
        create: {
          clanFund: 5_920_000n,
          darksteel: 3_740_000n,
          clanEnergy: 2_100_000n,
          energyCapacityPct: 61,
        },
      },
    },
  });

  for (const [slug, name, serverId, power] of [
    ["xyz", "XYZ", asia02.id, 16_800_000n],
    ["abc", "ABC", asia01.id, 15_900_000n],
  ] as const) {
    await db.clan.create({
      data: {
        slug,
        name,
        serverId,
        resources: {
          create: {
            clanFund: 8_000_000n,
            darksteel: 5_000_000n,
            clanEnergy: 2_800_000n,
            energyCapacityPct: 70,
          },
        },
        members: {
          create: [
            { name: `${name}Lead`, role: ClanRole.clan_leader, powerScore: power / 10n, classId: "warrior" },
            { name: `${name}Elder`, role: ClanRole.elder, powerScore: power / 12n, classId: "lancer" },
            { name: `${name}Mem`, role: ClanRole.member, powerScore: power / 15n, classId: "sorcerer" },
          ],
        },
      },
    });
  }

  const leader = await db.member.create({
    data: {
      clanId: zenith.id,
      name: "ApexPrime",
      role: ClanRole.clan_leader,
      powerScore: 1_842_420n,
      classId: "warrior",
    },
  });

  const elders = [];
  for (let i = 0; i < ELDER_NAMES.length; i++) {
    elders.push(
      await db.member.create({
        data: {
          clanId: zenith.id,
          name: ELDER_NAMES[i],
          role: ClanRole.elder,
          powerScore: BigInt(1_520_000 - i * 28_000),
          classId: "lancer",
        },
      }),
    );
  }

  for (let i = 0; i < MP_NAMES.length; i++) {
    await db.member.create({
      data: {
        clanId: zenith.id,
        name: `${MP_NAMES[i]}MP`,
        role: ClanRole.master_protector,
        powerScore: BigInt(1_280_000 - i * 20_000),
        classId: "taoist",
      },
    });
  }

  for (let i = 0; i < MEMBER_NAMES.length; i++) {
    await db.member.create({
      data: {
        clanId: zenith.id,
        name: MEMBER_NAMES[i],
        role: ClanRole.member,
        powerScore: BigInt(1_180_000 - i * 14_500),
        classId: "arbalist",
      },
    });
  }

  await db.member.create({
    data: {
      clanId: dragon.id,
      name: "DragonLord",
      role: ClanRole.clan_leader,
      powerScore: 1_710_200n,
      classId: "warrior",
    },
  });
  await db.member.create({
    data: {
      clanId: immortal.id,
      name: "EternalOne",
      role: ClanRole.clan_leader,
      powerScore: 1_520_000n,
      classId: "darkist",
    },
  });
  await db.member.create({
    data: {
      clanId: phoenix.id,
      name: "Reborn",
      role: ClanRole.clan_leader,
      powerScore: 1_340_000n,
      classId: "sorcerer",
    },
  });

  const alliance = await db.alliance.create({
    data: {
      name: "Zenith Alliance",
      leaderClanId: zenith.id,
      status: "active",
      clans: {
        create: [
          { clanId: zenith.id },
          { clanId: dragon.id },
          { clanId: immortal.id },
          { clanId: phoenix.id },
        ],
      },
    },
  });
  void alliance;

  await db.clanUnattackable.createMany({
    data: [
      { clanId: zenith.id, protectedClanId: phoenix.id, protectionType: "alliance" },
      { clanId: zenith.id, protectedClanId: immortal.id, protectionType: "peace" },
    ],
  });

  await db.announcement.createMany({
    data: [
      {
        title: "Server Maintenance — ASIA-01",
        body: "Scheduled maintenance on July 31, 2026",
        icon: "bell",
      },
      {
        title: "Alliance War Season Started",
        body: "New alliance rankings are now available.",
        icon: "war",
      },
    ],
  });

  const nextFriday = new Date();
  nextFriday.setDate(nextFriday.getDate() + ((5 - nextFriday.getDay() + 7) % 7 || 7));
  nextFriday.setHours(22, 0, 0, 0);

  await db.event.createMany({
    data: [
      {
        category: EventCategory.featured,
        title: "Valley War",
        subtitle: "Coalition valley defense operation",
        startsAt: nextFriday,
        timezone: "Asia/Manila",
        recurrence: EventRecurrence.weekly,
        recurrenceNote: "Friday · 10:00 PM PH Time",
        badge: "Upcoming",
        isMajor: true,
        sortOrder: 1,
      },
      {
        category: EventCategory.featured,
        title: "Alliance Raid",
        subtitle: "Coordinated raid night",
        startsAt: new Date(nextFriday.getTime() + 86400000 * 2),
        timezone: "Asia/Manila",
        recurrence: EventRecurrence.weekly,
        recurrenceNote: "Sunday · 9:00 PM PH Time",
        badge: "Weekly",
        isMajor: false,
        sortOrder: 2,
      },
      {
        category: EventCategory.featured,
        title: "Clan Sparring",
        startsAt: new Date(nextFriday.getTime() + 86400000),
        timezone: "Asia/Manila",
        recurrence: EventRecurrence.weekly,
        recurrenceNote: "Saturday · 8:00 PM PH Time",
        badge: "Weekly",
        sortOrder: 3,
      },
      {
        category: EventCategory.weekly,
        title: "World Boss",
        recurrence: EventRecurrence.daily,
        recurrenceNote: "Daily · 12:00 / 18:00 / 21:00 / 23:00 PH",
        badge: "Daily",
        sortOrder: 1,
      },
      {
        category: EventCategory.weekly,
        title: "Secret Peak",
        recurrence: EventRecurrence.daily,
        recurrenceNote: "Daily · reset windows",
        badge: "Daily",
        sortOrder: 2,
      },
      {
        category: EventCategory.weekly,
        title: "Energy Raid",
        recurrence: EventRecurrence.weekly,
        recurrenceNote: "Wed · 9:00 PM PH",
        badge: "Weekly",
        sortOrder: 3,
      },
      {
        category: EventCategory.weekly,
        title: "Darksteel Run",
        recurrence: EventRecurrence.weekly,
        recurrenceNote: "Thu · 10:00 PM PH",
        badge: "Weekly",
        sortOrder: 4,
      },
      {
        category: EventCategory.special,
        title: "Recruitment Drive",
        subtitle: "Grow our ranks. Stronger together.",
        recurrence: EventRecurrence.as_announced,
        recurrenceNote: "As Announced",
        badge: "Special",
        sortOrder: 1,
      },
      {
        category: EventCategory.special,
        title: "Alliance Summit",
        subtitle: "Leadership coordination meeting",
        recurrence: EventRecurrence.as_announced,
        recurrenceNote: "As Announced",
        badge: "Special",
        sortOrder: 2,
      },
    ],
  });

  await db.contact.createMany({
    data: [
      {
        kind: ContactKind.office,
        title: "1. RECRUITMENT OFFICE",
        personName: "ApexPrime",
        discordHandle: "apexprime",
        email: "recruit@arc-zenith.local",
        description: "Applications, tryouts, and new member onboarding.",
        sortOrder: 1,
      },
      {
        kind: ContactKind.office,
        title: "2. ALLIANCE DESK",
        personName: "ShadowVein",
        discordHandle: "shadowvein",
        email: "alliance@arc-zenith.local",
        description: "Alliance coordination, diplomacy, and war planning.",
        sortOrder: 2,
      },
      {
        kind: ContactKind.office,
        title: "3. EVENTS OFFICE",
        personName: "GoldFang",
        discordHandle: "goldfang",
        email: "events@arc-zenith.local",
        description: "Event schedules, sign-ups, and officer coordination.",
        sortOrder: 3,
      },
      {
        kind: ContactKind.office,
        title: "4. SUPPORT",
        personName: "NightBloom",
        discordHandle: "nightbloom",
        email: "support@arc-zenith.local",
        description: "General inquiries and member assistance.",
        sortOrder: 4,
      },
      {
        kind: ContactKind.channel,
        title: "Discord",
        description: "Join our Discord server.",
        href: "https://discord.gg/",
        sortOrder: 1,
      },
      {
        kind: ContactKind.channel,
        title: "Alliance Chat",
        description: "Connect with allied clans.",
        href: "#",
        sortOrder: 2,
      },
      {
        kind: ContactKind.channel,
        title: "Announcements",
        description: "Stay updated with news.",
        href: "/dashboard",
        sortOrder: 3,
      },
      {
        kind: ContactKind.channel,
        title: "Leadership Desk",
        description: "Message the leadership team.",
        href: "/contact",
        sortOrder: 4,
      },
    ],
  });

  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      email: "admin@arc-zenith.local",
      passwordHash,
      displayName: "Super Admin",
      appRole: "super_admin",
      memberId: leader.id,
      clanId: zenith.id,
    },
  });

  await db.user.create({
    data: {
      email: "zenith.leader@arc-zenith.local",
      passwordHash,
      displayName: "ApexPrime",
      appRole: "clan_admin",
      memberId: null,
      clanId: zenith.id,
    },
  });

  // Re-link second admin to an elder after unique member constraint
  await db.user.update({
    where: { email: "zenith.leader@arc-zenith.local" },
    data: { memberId: elders[0].id },
  });

  await db.user.create({
    data: {
      email: "zenith.elder@arc-zenith.local",
      passwordHash,
      displayName: "GoldFang",
      appRole: "clan_admin",
      memberId: elders[1].id,
      clanId: zenith.id,
    },
  });

  await db.user.create({
    data: {
      email: "dragon.admin@arc-zenith.local",
      passwordHash,
      displayName: "DragonLord",
      appRole: "clan_admin",
      clanId: dragon.id,
    },
  });

  console.log("Seed complete.");
  console.log("Admins (password from SEED_ADMIN_PASSWORD):");
  console.log("  admin@arc-zenith.local (super_admin)");
  console.log("  zenith.leader@arc-zenith.local");
  console.log("  zenith.elder@arc-zenith.local");
  console.log("  dragon.admin@arc-zenith.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
