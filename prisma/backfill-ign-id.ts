import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { allocateIgnId } from "../lib/csv";

const db = new PrismaClient();

async function main() {
  const members = await db.member.findMany({
    where: { deletedAt: null },
    select: { id: true, clanId: true, ign: true, ignId: true },
    orderBy: [{ clanId: "asc" }, { ign: "asc" }],
  });

  console.log(`Members found: ${members.length}`);

  const used = new Map<string, Set<string>>();
  for (const m of members) {
    if (!m.ignId) continue;
    const set = used.get(m.clanId) ?? new Set();
    set.add(m.ignId);
    used.set(m.clanId, set);
  }

  let updated = 0;
  for (const m of members) {
    if (m.ignId) continue;

    const set = used.get(m.clanId) ?? new Set();
    const candidate = allocateIgnId(m.ign, set, m.id);
    used.set(m.clanId, set);

    await db.member.update({
      where: { id: m.id },
      data: { ignId: candidate },
    });
    updated += 1;
    console.log(`  ${m.ign} → ${candidate}`);
  }

  console.log(`Updated ${updated} members with ign_id`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
