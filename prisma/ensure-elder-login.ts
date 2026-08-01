/**
 * Upserts the dashboard elder login without a full seed.
 * Usage: npx tsx prisma/ensure-elder-login.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const EMAIL = "elders.zenith@local.com";
const PASSWORD = process.env.SEED_ELDER_PASSWORD || "zenith2026!";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const zenith = await db.clan.findFirst({
    where: { OR: [{ slug: "zenith" }, { name: { equals: "ZENITH", mode: "insensitive" } }] },
    select: { id: true },
  });

  await db.user.upsert({
    where: { email: EMAIL },
    update: {
      passwordHash,
      displayName: "Zenith Elders",
      appRole: "clan_admin",
      ...(zenith ? { clanId: zenith.id } : {}),
    },
    create: {
      email: EMAIL,
      passwordHash,
      displayName: "Zenith Elders",
      appRole: "clan_admin",
      clanId: zenith?.id ?? null,
    },
  });

  console.log(`Upserted dashboard login: ${EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
