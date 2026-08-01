-- AlterTable
ALTER TABLE "announcements" ADD COLUMN "image_media_id" TEXT;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
