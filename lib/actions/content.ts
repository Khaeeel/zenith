"use server";

import { revalidatePath } from "next/cache";
import {
  ContactKind,
  EventCategory,
  EventRecurrence,
  AnnouncementIcon,
} from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { saveUploadedImage } from "@/lib/media-upload";
import { actionFail, actionOk, type ActionResult } from "@/lib/action-result";

function revalidateAnnouncements() {
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/announcements");
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return actionFail("Choose an image file to upload.");
  }

  try {
    await saveUploadedImage(file, session.user.id);
  } catch (e) {
    return actionFail(
      e instanceof Error ? e.message : "Upload failed.",
    );
  }
  revalidatePath("/admin/events");
  revalidateAnnouncements();
  return actionOk();
}

export async function upsertEventAction(
  formData: FormData,
): Promise<ActionResult> {
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

  if (!data.title) return actionFail("Title is required.");

  if (id) {
    await db.event.update({ where: { id }, data });
  } else {
    await db.event.create({ data });
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
  return actionOk();
}

export async function softDeleteEventAction(
  id: string,
  _fd?: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  await db.event.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
  return actionOk();
}

export async function setEventVisibilityAction(
  id: string,
  isPublished: boolean,
  _fd?: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  await db.event.update({
    where: { id },
    data: { isPublished },
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
  return actionOk();
}

export async function upsertContactAction(
  formData: FormData,
): Promise<ActionResult> {
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

  if (!data.title) return actionFail("Title is required.");

  if (id) {
    await db.contact.update({ where: { id }, data });
  } else {
    await db.contact.create({ data: { ...data, isPublished: true } });
  }

  revalidatePath("/admin/contacts");
  revalidatePath("/contact");
  return actionOk();
}

export async function softDeleteContactAction(
  id: string,
  _fd?: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  await db.contact.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/contacts");
  revalidatePath("/contact");
  return actionOk();
}

export async function upsertAnnouncementAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const clearImage =
    formData.get("clearImage") === "on" || formData.get("clearImage") === "1";
  const imageFile = formData.get("image");

  let imageMediaId: string | null | undefined;
  if (clearImage) {
    imageMediaId = null;
  } else if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const asset = await saveUploadedImage(imageFile, session.user.id);
      imageMediaId = asset.id;
    } catch (e) {
      return actionFail(
        e instanceof Error ? e.message : "Image upload failed.",
      );
    }
  }

  const data = {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    icon: String(formData.get("icon") || "bell") as AnnouncementIcon,
    createdBy: session.user.id,
    ...(imageMediaId !== undefined ? { imageMediaId } : {}),
  };
  if (!data.title || !data.body) {
    return actionFail("Title and body are required.");
  }

  if (id) {
    await db.announcement.update({ where: { id }, data });
  } else {
    await db.announcement.create({ data });
  }

  revalidateAnnouncements();
  return actionOk();
}

export async function softDeleteAnnouncementAction(
  id: string,
  _fd?: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  await db.announcement.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidateAnnouncements();
  return actionOk();
}

export async function setAnnouncementVisibilityAction(
  id: string,
  isPublished: boolean,
  _fd?: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  await db.announcement.update({
    where: { id },
    data: { isPublished },
  });
  revalidateAnnouncements();
  return actionOk();
}

export async function upsertAllianceAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.appRole !== "super_admin") {
    return actionFail("Only super admins can manage alliances.");
  }

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const leaderClanId = String(formData.get("leaderClanId") || "");
  const clanIds = formData.getAll("clanIds").map(String);

  if (!name || !leaderClanId) {
    return actionFail("Alliance name and leader clan are required.");
  }

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
  return actionOk();
}
