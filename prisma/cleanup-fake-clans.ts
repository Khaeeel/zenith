import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** Fake seed clans that should not appear in the live roster. */
const FAKE_SLUGS = ["xyz", "abc", "dragonlegion", "immortal", "phoenix"];

async function main() {
  const clans = await db.clan.findMany({
    where: { slug: { in: FAKE_SLUGS } },
    select: { id: true, slug: true, name: true },
  });

  if (clans.length === 0) {
    console.log("No fake clans found.");
    return;
  }

  const ids = clans.map((c) => c.id);
  console.log(
    "Removing:",
    clans.map((c) => c.name).join(", "),
  );

  await db.user.updateMany({
    where: { clanId: { in: ids } },
    data: { clanId: null, memberId: null },
  });

  const members = await db.member.findMany({
    where: { clanId: { in: ids } },
    select: { id: true },
  });
  if (members.length) {
    await db.user.updateMany({
      where: { memberId: { in: members.map((m) => m.id) } },
      data: { memberId: null },
    });
    await db.member.deleteMany({ where: { clanId: { in: ids } } });
  }

  await db.allianceClan.deleteMany({ where: { clanId: { in: ids } } });
  await db.clanUnattackable.deleteMany({
    where: { OR: [{ clanId: { in: ids } }, { protectedClanId: { in: ids } }] },
  });
  await db.clanResources.deleteMany({ where: { clanId: { in: ids } } });
  await db.joinApplication.deleteMany({ where: { clanId: { in: ids } } });
  await db.event.updateMany({
    where: { clanId: { in: ids } },
    data: { clanId: null },
  });
  await db.contact.updateMany({
    where: { clanId: { in: ids } },
    data: { clanId: null },
  });
  await db.announcement.updateMany({
    where: { clanId: { in: ids } },
    data: { clanId: null },
  });

  // If any of these lead an alliance, reassign or leave (Zenith should lead)
  const zenith = await db.clan.findUnique({ where: { slug: "zenith" } });
  await db.alliance.updateMany({
    where: { leaderClanId: { in: ids } },
    data: { leaderClanId: zenith?.id ?? undefined },
  });

  const deleted = await db.clan.deleteMany({ where: { id: { in: ids } } });
  console.log(`Deleted ${deleted.count} clans`);

  const remaining = await db.clan.findMany({
    where: { deletedAt: null },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });
  console.log("Remaining clans:");
  for (const c of remaining) console.log(`  - ${c.name} (${c.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
