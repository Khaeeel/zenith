"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw e;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
