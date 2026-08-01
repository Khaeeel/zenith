"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function loginAction(formData: FormData) {
  if (!process.env.AUTH_SECRET) {
    return {
      error:
        "Server misconfigured: AUTH_SECRET is missing. Set it on Vercel and redeploy.",
    };
  }
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
    console.error("[loginAction]", e);
    return { error: "Sign-in failed. Check server auth configuration." };
  }
}

export async function logoutAction(redirectTo = "/login") {
  const safe =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "/login";
  await signOut({ redirectTo: safe });
}
