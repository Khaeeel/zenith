"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { ClanRole, Prisma } from "@prisma/client";
import { requireAdmin, canAccessClan } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import {
  allocateIgnId,
  csvHeaderNames,
  parseCsv,
  MEMBER_CSV_ALLOWED_HEADERS,
  MEMBER_CSV_REQUIRED_HEADERS,
} from "@/lib/csv";
import { actionFail, actionOk, type ActionResult } from "@/lib/action-result";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Keep admin + public tracker in sync after clan mutations. */
function revalidateClanSurfaces(slugs: Array<string | null | undefined> = []) {
  revalidatePath("/admin/clans");
  revalidatePath("/admin/members");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clans");
  revalidatePath("/api/tracker/clans");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/dashboard/clans/${slug}`);
  }
}

const VALID_ROLES = new Set<string>([
  "clan_leader",
  "elder",
  "master_protector",
  "member",
]);

/** Normalize CSV class labels to preferred classId (case-insensitive). */
function toClassId(raw: string): string | null {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (!v) return null;
  // Common misspelling → project id used by MIR4_CLASSES / HofGamer roster
  if (v === "lionhart") return "lionheart";
  return v;
}

/** Whole number only; optional commas/spaces as thousand separators. */
function parsePowerScore(
  raw: unknown,
): { ok: true; value: bigint } | { ok: false } {
  const normalized = String(raw ?? "")
    .trim()
    .replace(/,/g, "")
    .replace(/\s/g, "");
  if (!normalized || !/^\d+$/.test(normalized)) {
    return { ok: false };
  }
  return { ok: true, value: BigInt(normalized) };
}

async function usedIgnIdsForClan(
  clanId: string,
  excludeMemberId?: string,
): Promise<Set<string>> {
  const rows = await db.member.findMany({
    where: {
      clanId,
      ignId: { not: null },
      ...(excludeMemberId ? { NOT: { id: excludeMemberId } } : {}),
    },
    select: { ignId: true },
  });
  return new Set(
    rows.map((r) => r.ignId).filter((id): id is string => Boolean(id)),
  );
}

async function findDuplicateIgn(
  clanId: string,
  ign: string,
  excludeMemberId?: string,
) {
  return db.member.findFirst({
    where: {
      clanId,
      deletedAt: null,
      ign: { equals: ign, mode: "insensitive" },
      ...(excludeMemberId ? { NOT: { id: excludeMemberId } } : {}),
    },
    select: { id: true, ign: true },
  });
}

function membersRedirect(
  clanId: string,
  params: Record<string, string>,
): never {
  const q = new URLSearchParams({ clanId, ...params });
  redirect(`/admin/members?${q.toString()}`);
}

export async function upsertClanAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const serverId = String(formData.get("serverId") || "");
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !serverId) {
    return actionFail("Clan name and server are required.");
  }
  if (!slug) {
    return actionFail("A valid slug is required.");
  }

  const server = await db.server.findUnique({ where: { id: serverId } });
  if (!server) {
    return actionFail("Selected server was not found.");
  }

  let previousSlug: string | null = null;

  try {
    if (id) {
      const clan = await db.clan.findUnique({ where: { id } });
      if (!clan || clan.deletedAt) {
        return actionFail("Clan not found.");
      }
      if (!canAccessClan(session.user.appRole, session.user.clanId, id)) {
        return actionFail("You cannot edit this clan.");
      }
      previousSlug = clan.slug;
      await db.clan.update({
        where: { id },
        data: { name, slug, serverId },
      });
    } else {
      if (session.user.appRole !== "super_admin") {
        return actionFail("Only super admins can create clans.");
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
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return actionFail("That clan slug is already in use. Choose another.");
    }
    throw e;
  }

  revalidateClanSurfaces([slug, previousSlug]);
  return actionOk();
}

export async function updateClanResourcesAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const clanId = String(formData.get("clanId") || "");
  if (!clanId) return actionFail("Clan is required.");
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    return actionFail("You cannot edit this clan’s resources.");
  }

  const clan = await db.clan.findFirst({
    where: { id: clanId, deletedAt: null },
    select: { slug: true },
  });
  if (!clan) return actionFail("Clan not found.");

  const clanFund = String(formData.get("clanFund") || "0").replace(/[^\d]/g, "") || "0";
  const darksteel = String(formData.get("darksteel") || "0").replace(/[^\d]/g, "") || "0";
  const clanEnergy = String(formData.get("clanEnergy") || "0").replace(/[^\d]/g, "") || "0";
  const energyCapacityPct = Math.min(
    100,
    Math.max(0, Number(formData.get("energyCapacityPct") || 0) || 0),
  );

  await db.clanResources.upsert({
    where: { clanId },
    create: {
      clanId,
      clanFund: BigInt(clanFund),
      darksteel: BigInt(darksteel),
      clanEnergy: BigInt(clanEnergy),
      energyCapacityPct,
    },
    update: {
      clanFund: BigInt(clanFund),
      darksteel: BigInt(darksteel),
      clanEnergy: BigInt(clanEnergy),
      energyCapacityPct,
    },
  });

  revalidateClanSurfaces([clan.slug]);
  return actionOk();
}

export async function softDeleteClanAction(
  clanId: string,
  _fd?: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.appRole !== "super_admin") {
    return actionFail("Only super admins can delete clans.");
  }
  const clan = await db.clan.findUnique({
    where: { id: clanId },
    select: { slug: true, deletedAt: true },
  });
  if (!clan || clan.deletedAt) {
    return actionFail("Clan not found.");
  }
  await db.clan.update({
    where: { id: clanId },
    data: { deletedAt: new Date() },
  });
  revalidateClanSurfaces([clan.slug]);
  return actionOk();
}

export async function setUnattackablesAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const clanId = String(formData.get("clanId") || "");
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    return actionFail("You cannot edit this clan.");
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
  return actionOk();
}

export async function upsertMemberAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const clanId = String(formData.get("clanId") || "");
  const ign = String(formData.get("ign") || "").trim();
  const role = String(formData.get("role") || "member") as ClanRole;
  const classId = String(formData.get("classId") || "") || null;
  const parsedPower = parsePowerScore(formData.get("powerScore"));

  if (!clanId || !ign) {
    return actionFail("Clan and IGN are required.");
  }
  if (!parsedPower.ok) {
    return actionFail("Power score must be a whole number.");
  }
  const powerScore = parsedPower.value;
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    return actionFail("You cannot edit members for this clan.");
  }

  const duplicate = await findDuplicateIgn(clanId, ign, id || undefined);
  if (duplicate) {
    return actionFail("A member with this IGN already exists in this clan.");
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
      return actionFail("This clan already has a clan leader.");
    }
  }

  if (id) {
    const current = await db.member.findUnique({ where: { id } });
    if (!current || current.deletedAt) {
      return actionFail("Member not found.");
    }
    const ignChanged = current.ign.toLowerCase() !== ign.toLowerCase();
    let nextIgnId = current.ignId;
    if (ignChanged || !nextIgnId) {
      const used = await usedIgnIdsForClan(clanId, id);
      nextIgnId = allocateIgnId(ign, used, id);
    }
    await db.member.update({
      where: { id },
      data: {
        ign,
        ignId: nextIgnId,
        role,
        powerScore,
        classId,
        clanId,
      },
    });
  } else {
    const used = await usedIgnIdsForClan(clanId);
    const ignId = allocateIgnId(ign, used);
    await db.member.create({
      data: { clanId, ign, ignId, role, powerScore, classId },
    });
  }

  revalidatePath("/admin/members");
  revalidatePath("/dashboard/clans");
  return actionOk();
}

export async function softDeleteMemberAction(
  memberId: string,
  _fd?: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member) return actionFail("Member not found.");
  if (!canAccessClan(session.user.appRole, session.user.clanId, member.clanId)) {
    return actionFail("You cannot delete this member.");
  }
  await db.member.update({
    where: { id: memberId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/members");
  revalidatePath("/dashboard/clans");
  return actionOk();
}

/**
 * Import members from CSV for the selected clan.
 * Headers must include: ign, role, power_score, class (or class_id).
 * ign_id is auto-generated from each IGN. Order flexible; extras rejected.
 */
export async function importMembersCsvAction(formData: FormData) {
  const session = await requireAdmin();
  const clanId = String(formData.get("clanId") || "");
  const replace = String(formData.get("replace") || "") === "1";
  const uploaded = formData.get("file");

  if (!clanId) {
    membersRedirect("missing", {
      importError: "Select a clan before importing.",
    });
  }
  if (!canAccessClan(session.user.appRole, session.user.clanId, clanId)) {
    membersRedirect(clanId, { importError: "You cannot import for this clan." });
  }

  // FormData file can be File or Blob depending on runtime — don't rely on instanceof File alone
  if (
    !uploaded ||
    typeof uploaded === "string" ||
    !("arrayBuffer" in uploaded) ||
    (uploaded as Blob).size === 0
  ) {
    membersRedirect(clanId, { importError: "Choose a CSV file to upload." });
  }

  const text = await (uploaded as Blob).text();
  if (!text.trim()) {
    membersRedirect(clanId, { importError: "CSV file is empty." });
  }

  const headers = csvHeaderNames(text);
  const required = MEMBER_CSV_REQUIRED_HEADERS as readonly string[];
  const allowed = MEMBER_CSV_ALLOWED_HEADERS as readonly string[];
  const headerSet = new Set(headers);

  const hasClass = headerSet.has("class") || headerSet.has("class_id");
  const missing = required.filter((h) => {
    if (h === "class") return !hasClass;
    return !headerSet.has(h);
  });
  if (missing.length) {
    membersRedirect(clanId, {
      importError: `Missing columns: ${missing.join(", ")}. Need: ${required.join(", ")}`,
    });
  }

  const unexpected = headers.filter((h) => h && !allowed.includes(h as (typeof allowed)[number]));
  if (unexpected.length) {
    membersRedirect(clanId, {
      importError: `Unknown columns: ${unexpected.join(", ")}. Only allow: ${required.join(", ")}`,
    });
  }

  const rows = parseCsv(text);
  if (rows.length === 0) {
    membersRedirect(clanId, { importError: "CSV has a header but no data rows." });
  }

  const members: {
    ign: string;
    ignId: string;
    role: ClanRole;
    powerScore: bigint;
    classId: string | null;
  }[] = [];

  const seenIgn = new Map<string, number>();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 2;
    const ign = (row.ign || "").trim();
    const roleRaw = (row.role || "member").trim().toLowerCase();
    const parsedPower = parsePowerScore(row.power_score);
    const classId = toClassId(row.class || row.class_id || "");

    if (!ign) {
      membersRedirect(clanId, {
        importError: `Row ${line}: ign is required.`,
      });
    }
    const ignKey = ign.toLowerCase();
    if (seenIgn.has(ignKey)) {
      membersRedirect(clanId, {
        importError: `Row ${line}: duplicate IGN "${ign}" (also on row ${seenIgn.get(ignKey)}).`,
      });
    }
    seenIgn.set(ignKey, line);
    if (!VALID_ROLES.has(roleRaw)) {
      membersRedirect(clanId, {
        importError: `Row ${line}: role must be clan_leader, elder, master_protector, or member.`,
      });
    }
    if (!parsedPower.ok) {
      membersRedirect(clanId, {
        importError: `Row ${line}: power_score must be a whole number.`,
      });
    }

    members.push({
      ign,
      ignId: "", // filled after roster replace / used-id load
      role: roleRaw as ClanRole,
      powerScore: parsedPower.value,
      classId,
    });
  }

  const leaders = members.filter((m) => m.role === "clan_leader");
  if (leaders.length > 1) {
    membersRedirect(clanId, {
      importError: `CSV has ${leaders.length} clan_leader rows; only one is allowed per clan.`,
    });
  }

  if (replace) {
    const existing = await db.member.findMany({
      where: { clanId },
      select: { id: true },
    });
    if (existing.length) {
      await db.user.updateMany({
        where: { memberId: { in: existing.map((m) => m.id) } },
        data: { memberId: null },
      });
      await db.member.deleteMany({ where: { clanId } });
    }
  } else {
    if (leaders.length === 1) {
      const existingLeader = await db.member.findFirst({
        where: { clanId, role: "clan_leader", deletedAt: null },
      });
      if (existingLeader) {
        membersRedirect(clanId, {
          importError:
            "Clan already has a clan_leader. Soft-delete them first, or check Replace roster.",
        });
      }
    }

    const existingMembers = await db.member.findMany({
      where: { clanId, deletedAt: null },
      select: { ign: true },
    });
    const existingKeys = new Set(
      existingMembers.map((m) => m.ign.toLowerCase()),
    );
    const conflicts = members
      .filter((m) => existingKeys.has(m.ign.toLowerCase()))
      .map((m) => m.ign);
    if (conflicts.length) {
      membersRedirect(clanId, {
        importError: `IGN already on roster: ${conflicts.join(", ")}. Soft-delete them first, or check Replace roster.`,
      });
    }
  }

  const used = replace ? new Set<string>() : await usedIgnIdsForClan(clanId);
  for (const m of members) {
    m.ignId = allocateIgnId(m.ign, used);
  }

  await db.member.createMany({
    data: members.map((m) => ({
      clanId,
      ign: m.ign,
      ignId: m.ignId,
      role: m.role,
      powerScore: m.powerScore,
      classId: m.classId,
    })),
  });

  revalidatePath("/admin/members");
  revalidatePath("/dashboard/clans");
  membersRedirect(clanId, { imported: String(members.length) });
}

export async function updateAccountAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const displayName = String(formData.get("displayName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const ign = String(formData.get("ign") || "").trim();
  const password = String(formData.get("password") || "");

  if (!displayName || !email) {
    return actionFail("Display name and email are required.");
  }

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
      data: { ign },
    });
  }

  revalidatePath("/admin/account");
  revalidatePath("/admin/members");
  return actionOk();
}
