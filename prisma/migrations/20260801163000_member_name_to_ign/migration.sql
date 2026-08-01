-- Rename members.name → members.ign
DROP INDEX IF EXISTS "members_clan_id_name_idx";
ALTER TABLE "members" RENAME COLUMN "name" TO "ign";
CREATE INDEX "members_clan_id_ign_idx" ON "members"("clan_id", "ign");
