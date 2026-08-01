"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function submitJoinApplicationAction(formData: FormData) {
  const ign = String(formData.get("ign") || "").trim();
  const discord = String(formData.get("discord") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const clanId = String(formData.get("clanId") || "");
  const powerScore = BigInt(
    String(formData.get("powerScore") || "0").replace(/,/g, ""),
  );
  const classId = String(formData.get("classId") || "");
  const timezone = String(formData.get("timezone") || "UTC+8");
  const hourStart = Number(formData.get("hourStart") || 0);
  const hourEnd = Number(formData.get("hourEnd") || 0);
  const reason = String(formData.get("reason") || "").trim();

  if (!ign || !discord || !clanId || !classId || !reason) {
    return { error: "Please fill all required fields." };
  }

  const clan = await db.clan.findFirst({
    where: { id: clanId, deletedAt: null },
  });
  if (!clan) return { error: "Clan not found." };

  const app = await db.joinApplication.create({
    data: {
      ign,
      discord,
      email,
      clanId,
      powerScore,
      classId,
      timezone,
      hourStart,
      hourEnd,
      reason,
    },
  });

  const admins = await db.user.findMany({
    where: {
      OR: [
        { appRole: "super_admin" },
        { appRole: "clan_admin", clanId },
      ],
    },
    select: { email: true },
  });

  const to = admins.map((a) => a.email).filter(Boolean);
  if (process.env.RESEND_API_KEY && to.length) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "ARC Tracker <onboarding@resend.dev>",
        to,
        subject: `[ARC] New join application: ${ign} → ${clan.name}`,
        html: `
          <h2>New Join Application</h2>
          <p><b>IGN:</b> ${ign}</p>
          <p><b>Discord:</b> ${discord}</p>
          <p><b>Email:</b> ${email || "—"}</p>
          <p><b>Clan:</b> ${clan.name}</p>
          <p><b>Power:</b> ${powerScore.toString()}</p>
          <p><b>Class:</b> ${classId}</p>
          <p><b>Timezone:</b> ${timezone} (${hourStart}:00–${hourEnd}:00)</p>
          <p><b>Reason:</b> ${reason}</p>
          <p>Application ID: ${app.id}</p>
        `,
      });
    } catch (e) {
      console.error("Resend failed", e);
    }
  } else {
    console.info("[join] application stored; Resend skipped (no API key or recipients)", app.id);
  }

  revalidatePath("/admin/applications");
  return { ok: true };
}

export async function updateApplicationStatusAction(
  id: string,
  status: "pending" | "accepted" | "rejected",
  _fd?: FormData,
) {
  await requireAdmin();
  await db.joinApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/applications");
  revalidatePath("/admin/contacts");
  return { ok: true as const };
}
