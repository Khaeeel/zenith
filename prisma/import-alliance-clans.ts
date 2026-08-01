import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * Alliance clans from MIR4 screenshots (ASIA092).
 * "Zenith X" renamed to "Zenith Sza" per request.
 */
const ALLIANCE_CLANS: { slug: string; name: string; rank: number | null }[] = [
  { slug: "zenith-luna", name: "Zenith LUNA", rank: 78 },
  { slug: "tgo", name: "哥ⓉⒼⓄ", rank: 10 },
  { slug: "zenith-xeno", name: "Zenith XENO", rank: 9 },
  { slug: "brawlers", name: "名人堂 Brawlers", rank: null },
  { slug: "level-build", name: "Level Build", rank: 58 },
  { slug: "hofeless", name: "HOFeless", rank: 69 },
  { slug: "zenith-nova", name: "Zenith NOVA", rank: 8 },
  { slug: "mwantedph", name: "MWANTEDPH", rank: 4 },
  { slug: "nocturnus", name: "• Nocturnus② •", rank: 11 },
  { slug: "celestial", name: "神Celestial", rank: 7 },
  { slug: "zenith-sza", name: "Zenith Sza", rank: 6 }, // was Zenith X
];

async function main() {
  let server = await db.server.findFirst({ where: { name: "ASIA092" } });
  if (!server) {
    server = await db.server.create({
      data: { name: "ASIA092", region: "Asia", status: "active" },
    });
    console.log("Created server ASIA092");
  } else {
    console.log("Using server", server.name);
  }

  let zenith = await db.clan.findUnique({ where: { slug: "zenith" } });
  // Keep existing Zenith (HofGamer roster) — also ensure it's on ASIA092 if desired?
  // Leave Zenith on its current server; alliance clans go on ASIA092.

  const created: string[] = [];
  const updated: string[] = [];

  for (const row of ALLIANCE_CLANS) {
    const existing = await db.clan.findUnique({ where: { slug: row.slug } });
    if (existing) {
      await db.clan.update({
        where: { id: existing.id },
        data: {
          name: row.name,
          serverId: server.id,
          deletedAt: null,
        },
      });
      updated.push(row.name);
    } else {
      await db.clan.create({
        data: {
          slug: row.slug,
          name: row.name,
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
      created.push(row.name);
    }
  }

  // Attach to Zenith Alliance if it exists
  const alliance =
    (await db.alliance.findFirst({ where: { name: "Zenith Alliance" } })) ??
    (zenith
      ? await db.alliance.create({
          data: {
            name: "Zenith Alliance",
            leaderClanId: zenith.id,
            status: "active",
          },
        })
      : null);

  if (alliance) {
    const clans = await db.clan.findMany({
      where: {
        slug: { in: ALLIANCE_CLANS.map((c) => c.slug) },
        deletedAt: null,
      },
    });
    for (const clan of clans) {
      const link = await db.allianceClan.findUnique({
        where: {
          allianceId_clanId: {
            allianceId: alliance.id,
            clanId: clan.id,
          },
        },
      });
      if (!link) {
        await db.allianceClan.create({
          data: { allianceId: alliance.id, clanId: clan.id },
        });
      }
    }
    // Ensure main Zenith is in the alliance too
    if (zenith) {
      const zLink = await db.allianceClan.findUnique({
        where: {
          allianceId_clanId: {
            allianceId: alliance.id,
            clanId: zenith.id,
          },
        },
      });
      if (!zLink) {
        await db.allianceClan.create({
          data: { allianceId: alliance.id, clanId: zenith.id },
        });
      }
    }
  }

  console.log("Created:", created.length ? created.join(", ") : "(none)");
  console.log("Updated:", updated.length ? updated.join(", ") : "(none)");
  console.log("Note: Zenith X → Zenith Sza");
  console.log(`Total alliance clans on ASIA092: ${ALLIANCE_CLANS.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
