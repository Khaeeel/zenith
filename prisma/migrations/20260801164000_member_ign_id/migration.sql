-- Add members.ign_id (optional external character id)
ALTER TABLE "members" ADD COLUMN "ign_id" TEXT;
CREATE UNIQUE INDEX "members_clan_id_ign_id_key" ON "members"("clan_id", "ign_id");
