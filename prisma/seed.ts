import "dotenv/config";
import { PrismaClient, EventCategory, EventRecurrence, ContactKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loadHofGamerPlayers, toMemberCreates } from "./hofgamer-roster";

const db = new PrismaClient();

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

  // Real Zenith roster from HofGamer export (no fake sample members)
  const hofPlayers = loadHofGamerPlayers();
  await db.member.createMany({
    data: toMemberCreates(zenith.id, hofPlayers),
  });
  const leader = await db.member.findFirst({
    where: { clanId: zenith.id, role: "clan_leader" },
  });
  if (!leader) throw new Error("Zenith leader missing after HofGamer import");
  console.log(
    `Zenith members: ${hofPlayers.length} (leader ${leader.ign})`,
  );

  const alliance = await db.alliance.create({
    data: {
      name: "Zenith Alliance",
      leaderClanId: zenith.id,
      status: "active",
      clans: {
        create: [{ clanId: zenith.id }],
      },
    },
  });
  void alliance;

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
    ],
  });

  await db.contact.createMany({
    data: [
      {
        kind: ContactKind.office,
        title: "1. RECRUITMENT OFFICE",
        personName: leader.ign,
        discordHandle: "recruitment",
        email: "recruit@arc-zenith.local",
        description: "Applications, tryouts, and new member onboarding.",
        sortOrder: 1,
      },
      {
        kind: ContactKind.office,
        title: "2. ALLIANCE DESK",
        personName: "Alliance Desk",
        discordHandle: "alliance",
        email: "alliance@arc-zenith.local",
        description: "Alliance coordination, diplomacy, and war planning.",
        sortOrder: 2,
      },
      {
        kind: ContactKind.office,
        title: "3. EVENTS OFFICE",
        personName: "Events Desk",
        discordHandle: "events",
        email: "events@arc-zenith.local",
        description: "Event schedules, sign-ups, and officer coordination.",
        sortOrder: 3,
      },
      {
        kind: ContactKind.office,
        title: "4. SUPPORT",
        personName: "Support Desk",
        discordHandle: "support",
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
      displayName: leader.ign,
      appRole: "clan_admin",
      clanId: zenith.id,
    },
  });

  console.log("Seed complete.");
  console.log("Admins (password from SEED_ADMIN_PASSWORD):");
  console.log("  admin@arc-zenith.local (super_admin)");
  console.log("  zenith.leader@arc-zenith.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
