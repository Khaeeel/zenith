"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import {
  ContactKind,
  EventCategory,
  EventRecurrence,
  AnnouncementIcon,
} from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function uploadMediaAction(formData: FormData) {
  const session = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await db.mediaAsset.create({
      data: {
        url: "/assets/logo.png",
        pathname: `local/${Date.now()}-${file.name}`,
        mimeType: file.type || "application/octet-stream",
        alt: file.name,
        uploadedBy: session.user.id,
      },
    });
    if (buffer.length < 80_000) {
      await db.mediaAsset.update({
        where: { id: asset.id },
        data: {
          url: `data:${file.type};base64,${buffer.toString("base64")}`.slice(
            0,
            1900,
          ),
        },
      });
    }
    revalidatePath("/admin/events");
    return;
  }

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  await db.mediaAsset.create({
    data: {
      url: blob.url,
      pathname: blob.pathname,
      mimeType: file.type || "application/octet-stream",
      alt: file.name,
      uploadedBy: session.user.id,
    },
  });
  revalidatePath("/admin/events");
}

export async function upsertEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const startsAtRaw = String(formData.get("startsAt") || "");
  const data = {
    clanId: String(formData.get("clanId") || "") || null,
    category: String(formData.get("category") || "featured") as EventCategory,
    title: String(formData.get("title") || "").trim(),
    subtitle: String(formData.get("subtitle") || "") || null,
    iconMediaId: String(formData.get("iconMediaId") || "") || null,
    startsAt: startsAtRaw ? new Date(startsAtRaw) : null,
    timezone: String(formData.get("timezone") || "Asia/Manila"),
    recurrence: String(formData.get("recurrence") || "none") as EventRecurrence,
    recurrenceNote: String(formData.get("recurrenceNote") || "") || null,
    badge: String(formData.get("badge") || "") || null,
    isMajor:
      formData.get("isMajor") === "on" || formData.get("isMajor") === "true",
    sortOrder: Number(formData.get("sortOrder") || 0),
    isPublished:
      formData.get("isPublished") === "on" ||
      formData.get("isPublished") === "true",
  };

  if (!data.title) return;

  if (id) {
    await db.event.update({ where: { id }, data });
  } else {
    await db.event.create({ data });
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
}

export async function softDeleteEventAction(id: string, _fd?: FormData) {
  await requireAdmin();
  await db.event.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
}

export async function upsertContactAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    kind: String(formData.get("kind") || "office") as ContactKind,
    title: String(formData.get("title") || "").trim(),
    personName: String(formData.get("personName") || "") || null,
    discordHandle: String(formData.get("discordHandle") || "") || null,
    email: String(formData.get("email") || "") || null,
    description: String(formData.get("description") || "") || null,
    href: String(formData.get("href") || "") || null,
    iconMediaId: String(formData.get("iconMediaId") || "") || null,
    clanId: String(formData.get("clanId") || "") || null,
    sortOrder: Number(formData.get("sortOrder") || 0),
    isPublished:
      formData.get("isPublished") === "on" ||
      formData.get("isPublished") === "true",
  };

  if (!data.title) return;

  if (id) {
    await db.contact.update({ where: { id }, data });
  } else {
    await db.contact.create({ data: { ...data, isPublished: true } });
  }

  revalidatePath("/admin/contacts");
  revalidatePath("/contact");
}

export async function softDeleteContactAction(id: string, _fd?: FormData) {
  await requireAdmin();
  await db.contact.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/contacts");
  revalidatePath("/contact");
}

export async function upsertAnnouncementAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    icon: String(formData.get("icon") || "bell") as AnnouncementIcon,
    createdBy: session.user.id,
  };
  if (!data.title || !data.body) return;

  if (id) {
    await db.announcement.update({ where: { id }, data });
  } else {
    await db.announcement.create({ data });
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function softDeleteAnnouncementAction(id: string, _fd?: FormData) {
  await requireAdmin();
  await db.announcement.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function upsertAllianceAction(formData: FormData) {
  const session = await requireAdmin();
  if (session.user.appRole !== "super_admin") return;

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const leaderClanId = String(formData.get("leaderClanId") || "");
  const clanIds = formData.getAll("clanIds").map(String);

  if (!name || !leaderClanId) return;

  if (id) {
    await db.alliance.update({
      where: { id },
      data: { name, leaderClanId },
    });
    await db.allianceClan.deleteMany({ where: { allianceId: id } });
    if (clanIds.length) {
      await db.allianceClan.createMany({
        data: clanIds.map((clanId) => ({ allianceId: id, clanId })),
      });
    }
  } else {
    await db.alliance.create({
      data: {
        name,
        leaderClanId,
        clans: {
          create: clanIds.map((clanId) => ({ clanId })),
        },
      },
    });
  }

  revalidatePath("/admin/alliances");
  revalidatePath("/dashboard");
}
