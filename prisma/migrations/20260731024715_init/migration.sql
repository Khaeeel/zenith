-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('super_admin', 'clan_admin');

-- CreateEnum
CREATE TYPE "ServerStatus" AS ENUM ('active', 'peace', 'maintenance');

-- CreateEnum
CREATE TYPE "ClanRole" AS ENUM ('clan_leader', 'elder', 'master_protector', 'member');

-- CreateEnum
CREATE TYPE "AllianceStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AnnouncementIcon" AS ENUM ('bell', 'war');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('featured', 'weekly', 'special');

-- CreateEnum
CREATE TYPE "EventRecurrence" AS ENUM ('none', 'daily', 'weekly', 'as_announced');

-- CreateEnum
CREATE TYPE "ContactKind" AS ENUM ('office', 'channel');

-- CreateEnum
CREATE TYPE "JoinApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "ProtectionType" AS ENUM ('alliance', 'peace', 'server', 'custom');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "app_role" "AppRole" NOT NULL,
    "clan_id" TEXT,
    "member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" "ServerStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clans" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "emblem_media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clan_resources" (
    "clan_id" TEXT NOT NULL,
    "clan_fund" BIGINT NOT NULL DEFAULT 0,
    "darksteel" BIGINT NOT NULL DEFAULT 0,
    "clan_energy" BIGINT NOT NULL DEFAULT 0,
    "energy_capacity_pct" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clan_resources_pkey" PRIMARY KEY ("clan_id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "clan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ClanRole" NOT NULL DEFAULT 'member',
    "power_score" BIGINT NOT NULL,
    "class_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alliances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leader_clan_id" TEXT NOT NULL,
    "status" "AllianceStatus" NOT NULL DEFAULT 'active',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alliance_clans" (
    "alliance_id" TEXT NOT NULL,
    "clan_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alliance_clans_pkey" PRIMARY KEY ("alliance_id","clan_id")
);

-- CreateTable
CREATE TABLE "clan_unattackables" (
    "id" TEXT NOT NULL,
    "clan_id" TEXT NOT NULL,
    "protected_clan_id" TEXT NOT NULL,
    "protection_type" "ProtectionType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clan_unattackables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" "AnnouncementIcon" NOT NULL DEFAULT 'bell',
    "clan_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "alt" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "clan_id" TEXT,
    "category" "EventCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "icon_media_id" TEXT,
    "starts_at" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Manila',
    "recurrence" "EventRecurrence" NOT NULL DEFAULT 'none',
    "recurrence_note" TEXT,
    "badge" TEXT,
    "is_major" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "kind" "ContactKind" NOT NULL,
    "title" TEXT NOT NULL,
    "person_name" TEXT,
    "discord_handle" TEXT,
    "email" TEXT,
    "description" TEXT,
    "href" TEXT,
    "icon_media_id" TEXT,
    "clan_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "join_applications" (
    "id" TEXT NOT NULL,
    "ign" TEXT NOT NULL,
    "discord" TEXT NOT NULL,
    "email" TEXT,
    "clan_id" TEXT NOT NULL,
    "power_score" BIGINT NOT NULL,
    "class_id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "hour_start" INTEGER NOT NULL,
    "hour_end" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "JoinApplicationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "join_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_member_id_key" ON "users"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "clans_slug_key" ON "clans"("slug");

-- CreateIndex
CREATE INDEX "members_clan_id_role_idx" ON "members"("clan_id", "role");

-- CreateIndex
CREATE INDEX "members_clan_id_name_idx" ON "members"("clan_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "clan_unattackables_clan_id_protected_clan_id_key" ON "clan_unattackables"("clan_id", "protected_clan_id");

-- CreateIndex
CREATE INDEX "events_category_sort_order_idx" ON "events"("category", "sort_order");

-- CreateIndex
CREATE INDEX "contacts_kind_sort_order_idx" ON "contacts"("kind", "sort_order");

-- CreateIndex
CREATE INDEX "join_applications_status_created_at_idx" ON "join_applications"("status", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clans" ADD CONSTRAINT "clans_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clans" ADD CONSTRAINT "clans_emblem_media_id_fkey" FOREIGN KEY ("emblem_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_resources" ADD CONSTRAINT "clan_resources_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliances" ADD CONSTRAINT "alliances_leader_clan_id_fkey" FOREIGN KEY ("leader_clan_id") REFERENCES "clans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_clans" ADD CONSTRAINT "alliance_clans_alliance_id_fkey" FOREIGN KEY ("alliance_id") REFERENCES "alliances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_clans" ADD CONSTRAINT "alliance_clans_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_unattackables" ADD CONSTRAINT "clan_unattackables_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clan_unattackables" ADD CONSTRAINT "clan_unattackables_protected_clan_id_fkey" FOREIGN KEY ("protected_clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_icon_media_id_fkey" FOREIGN KEY ("icon_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_icon_media_id_fkey" FOREIGN KEY ("icon_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_applications" ADD CONSTRAINT "join_applications_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
