import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { AppRole } from "@prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

export function canAccessClan(
  appRole: AppRole,
  userClanId: string | null | undefined,
  targetClanId: string,
) {
  if (appRole === "super_admin") return true;
  return userClanId === targetClanId;
}
