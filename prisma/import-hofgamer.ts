import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { loadHofGamerPlayers, toMemberCreates } from "./hofgamer-roster";

const db = new PrismaClient();

async function ensureZenithClan() {
  let clan = await db.clan.findUnique({ where: { slug: "zenith" } });
  if (clan) return clan;

  let server = await db.server.findFirst({ where: { name: "ASIA-01" } });
  if (!server) {
    server = await db.server.create({
      data: { name: "ASIA-01", region: "Asia", status: "active" },
    });
  }

  clan = await db.clan.create({
    data: {
      slug: "zenith",
      name: "Zenith",
      serverId: server.id,
      resources: {
        create: {
          clanFund: 0n,
          darksteel: 0n,
          clanEnergy: 0n,
          energyCapacityPct: 0,
        },
      },
    },
  });
  return clan;
}

async function main() {
  const players = loadHofGamerPlayers();
  console.log(`Parsed ${players.length} players from HofGamer CSV`);
  console.log("(Alliance column ignored — left blank on members)");

  const clan = await ensureZenithClan();
  console.log(`Target clan: ${clan.name} (${clan.slug})`);

  const existing = await db.member.findMany({
    where: { clanId: clan.id },
    select: { id: true },
  });

  if (existing.length > 0) {
    await db.user.updateMany({
      where: { memberId: { in: existing.map((m) => m.id) } },
      data: { memberId: null },
    });
    await db.member.deleteMany({ where: { clanId: clan.id } });
    console.log(`Cleared ${existing.length} previous Zenith members`);
  }

  await db.member.createMany({
    data: toMemberCreates(clan.id, players),
  });

  const count = await db.member.count({ where: { clanId: clan.id } });
  const top = players[0];
  console.log(`Imported ${count} members`);
  console.log(
    `Leader (highest CP): ${top.ign} · ${top.classId} · ${top.powerScore.toString()}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
