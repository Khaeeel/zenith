import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const zenith = await db.clan.findUnique({ where: { slug: "zenith" } });
  if (!zenith) throw new Error("Zenith clan not found");

  const fake = await db.member.findMany({
    where: { clanId: { not: zenith.id }, deletedAt: null },
    select: { id: true, name: true },
  });

  console.log(
    "Non-Zenith members to remove:",
    fake.length,
    fake.map((m) => m.ign).join(", ") || "(none)",
  );

  if (fake.length > 0) {
    await db.user.updateMany({
      where: { memberId: { in: fake.map((m) => m.id) } },
      data: { memberId: null },
    });
    const res = await db.member.deleteMany({
      where: { id: { in: fake.map((m) => m.id) } },
    });
    console.log("Deleted", res.count);
  }

  // Also drop empty demo clans that only existed for sample members (xyz/abc)
  for (const slug of ["xyz", "abc"]) {
    const clan = await db.clan.findUnique({ where: { slug } });
    if (!clan) continue;
    await db.clanResources.deleteMany({ where: { clanId: clan.id } });
    await db.member.deleteMany({ where: { clanId: clan.id } });
    await db.clan.delete({ where: { id: clan.id } });
    console.log("Removed demo clan:", slug);
  }

  const left = await db.member.groupBy({ by: ["clanId"], _count: true });
  for (const row of left) {
    const c = await db.clan.findUnique({ where: { id: row.clanId } });
    console.log(`${c?.slug}: ${row._count} members`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
