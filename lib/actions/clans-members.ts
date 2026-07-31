"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { ClanRole } from "@prisma/client";
import { requireAdmin, canAccessClan } from "@/lib/admin-auth";
import { db } from "@/lib/db";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertClanAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const serverId = String(formData.get("serverId") || "");
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugInput || slugify(name);

  if (!name || !serverId) return;

  if (id) {
    const clan = await db.clan.findUnique({ where: { id } });
    if (!clan || clan.deletedAt) return;
    if (!canAccessClan(session.user.appRole, session.user.clanId, id)) {
      return;
    }
    await db.clan.update({
      where: { id },
      data: { name, slug, serverId },
    });
  } else {
    if (session.user.appRole !== "super_admin") {
      return;
    }
    await db.clan.create({
      data: {
        name,
        slug,
        serverId,
        resources: {
          create: {
            clanFund: BigInt(0),
            darksteel: BigInt(0),
            clanEnergy: BigInt(0),
            energyCapacityPct: 0,
          },
        },
      },
    });
  }

  revalidatePath("/admin/clans");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clans");
  return;
}

export async function updateClanResourcesAction(formData: FormData) {
  const session = await requireAdmin();
  const clanId = String(formData.get("clanId") || "");
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    return;
  }

  await db.clanResources.upsert({
    where: { clanId },
    create: {
      clanId,
      clanFund: BigInt(String(formData.get("clanFund") || "0")),
      darksteel: BigInt(String(formData.get("darksteel") || "0")),
      clanEnergy: BigInt(String(formData.get("clanEnergy") || "0")),
      energyCapacityPct: Number(formData.get("energyCapacityPct") || 0),
    },
    update: {
      clanFund: BigInt(String(formData.get("clanFund") || "0")),
      darksteel: BigInt(String(formData.get("darksteel") || "0")),
      clanEnergy: BigInt(String(formData.get("clanEnergy") || "0")),
      energyCapacityPct: Number(formData.get("energyCapacityPct") || 0),
    },
  });

  revalidatePath("/admin/clans");
  revalidatePath(`/dashboard/clans`);
  return;
}

export async function softDeleteClanAction(clanId: string, _fd?: FormData) {
  const session = await requireAdmin();
  if (session.user.appRole !== "super_admin") return;
  await db.clan.update({
    where: { id: clanId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/clans");
  revalidatePath("/dashboard/clans");
}

export async function setUnattackablesAction(formData: FormData) {
  const session = await requireAdmin();
  const clanId = String(formData.get("clanId") || "");
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    return;
  }
  const protectedIds = formData.getAll("protectedClanId").map(String);

  await db.clanUnattackable.deleteMany({ where: { clanId } });
  if (protectedIds.length) {
    await db.clanUnattackable.createMany({
      data: protectedIds.map((protectedClanId) => ({
        clanId,
        protectedClanId,
        protectionType: "custom" as const,
      })),
    });
  }

  revalidatePath("/admin/clans");
  revalidatePath(`/dashboard/clans`);
  return;
}

export async function upsertMemberAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const clanId = String(formData.get("clanId") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "member") as ClanRole;
  const powerScore = BigInt(String(formData.get("powerScore") || "0"));
  const classId = String(formData.get("classId") || "") || null;

  if (!clanId || !name) return;
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    return;
  }

  if (role === "clan_leader") {
    const existing = await db.member.findFirst({
      where: {
        clanId,
        role: "clan_leader",
        deletedAt: null,
        ...(id ? { NOT: { id } } : {}),
      },
    });
    if (existing) {
      return;
    }
  }

  if (id) {
    await db.member.update({
      where: { id },
      data: { name, role, powerScore, classId, clanId },
    });
  } else {
    await db.member.create({
      data: { clanId, name, role, powerScore, classId },
    });
  }

  revalidatePath("/admin/members");
  revalidatePath("/dashboard/clans");
  return;
}

export async function softDeleteMemberAction(memberId: string, _fd?: FormData) {
  const session = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member) return;
  if (!canAccessClan(session.user.appRole, session.user.clanId, member.clanId)) {
    return;
  }
  await db.member.update({
    where: { id: memberId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/members");
  revalidatePath("/dashboard/clans");
}

export async function updateAccountAction(formData: FormData) {
  const session = await requireAdmin();
  const displayName = String(formData.get("displayName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const ign = String(formData.get("ign") || "").trim();
  const password = String(formData.get("password") || "");

  if (!displayName || !email) return;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      displayName,
      email,
      ...(password
        ? { passwordHash: await bcrypt.hash(password, 10) }
        : {}),
    },
  });

  if (session.user.memberId && ign) {
    await db.member.update({
      where: { id: session.user.memberId },
      data: { name: ign },
    });
  }

  revalidatePath("/admin/account");
  revalidatePath("/admin/members");
  return;
}
