"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { resolveAuthSecret, sanitizeAuthEnv } from "@/lib/auth-env";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function authErrorType(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const e = error as { type?: unknown; name?: unknown };
  if (typeof e.type === "string") return e.type;
  if (typeof e.name === "string" && e.name !== "Error") return e.name;
  return undefined;
}

function safeDebugDetail(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.replace(/\s+/g, " ").trim();
    // Keep short, never echo env values
    if (/invalid url/i.test(msg)) return "Invalid URL (AUTH_URL/NEXTAUTH_URL)";
    if (/DATABASE_UNAVAILABLE/i.test(msg)) return "database unavailable";
    if (msg.length > 120) return `${msg.slice(0, 117)}...`;
    return msg;
  }
  return "unknown error";
}

function errorFromSignInResult(result: unknown): string | null {
  // Client-style shape: { error, ok, url, ... }
  if (result && typeof result === "object") {
    const r = result as { error?: unknown; ok?: unknown; url?: unknown };
    if (r.ok === false || (typeof r.error === "string" && r.error)) {
      const err = typeof r.error === "string" ? r.error : "CredentialsSignin";
      if (err === "CredentialsSignin" || err === "credentials") {
        return "Invalid email or password.";
      }
      if (err === "Configuration") {
        return "Auth/configuration error. Check AUTH_URL (bare origin or delete it), AUTH_SECRET, and DATABASE_URL — then redeploy.";
      }
      return `Sign-in failed (${err}).`;
    }
    if (typeof r.url === "string") {
      return errorFromRedirectUrl(r.url);
    }
  }

  if (typeof result === "string") {
    return errorFromRedirectUrl(result);
  }

  return null;
}

function errorFromRedirectUrl(result: string): string | null {
  try {
    const url = new URL(result, process.env.AUTH_URL || "http://localhost");
    const err = url.searchParams.get("error");
    if (!err) return null;
    if (err === "CredentialsSignin" || err === "credentials") {
      return "Invalid email or password.";
    }
    if (err === "Configuration") {
      return "Auth/configuration error. Check AUTH_URL (bare origin or delete it), AUTH_SECRET, and DATABASE_URL — then redeploy.";
    }
    return `Sign-in failed (${err}).`;
  } catch {
    return null;
  }
}

export async function loginAction(formData: FormData) {
  sanitizeAuthEnv();

  if (!resolveAuthSecret()) {
    return {
      error:
        "Server misconfigured: AUTH_SECRET (or NEXTAUTH_SECRET) is missing. Set it on Vercel and redeploy.",
    };
  }

  try {
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });

    const signInError = errorFromSignInResult(result);
    if (signInError) {
      return { error: signInError };
    }

    return { ok: true as const };
  } catch (e) {
    if (isNextRedirect(e)) throw e;

    const type = authErrorType(e);
    // Duck-type AuthError — instanceof often fails across bundled @auth/core copies
    if (type === "CredentialsSignin") {
      return { error: "Invalid email or password." };
    }

    if (
      type === "MissingSecret" ||
      type === "UntrustedHost" ||
      type === "Configuration"
    ) {
      return {
        error: `Auth configuration error (${type}). Check AUTH_SECRET and AUTH_URL on Vercel, then redeploy.`,
      };
    }

    const detail = safeDebugDetail(e);
    if (/invalid url/i.test(detail)) {
      return {
        error:
          "Auth URL misconfigured (Invalid URL). On Vercel: delete AUTH_URL or set it to https://zenith-leeq-sooty.vercel.app with no quotes, then redeploy.",
      };
    }
    if (/DATABASE_UNAVAILABLE|database/i.test(detail)) {
      return {
        error:
          "Database unavailable. Check DATABASE_URL on Vercel and that the elder user exists (npm run db:ensure-elder).",
      };
    }

    if (e instanceof AuthError || type) {
      return { error: "Invalid email or password." };
    }

    console.error("[loginAction]", type ?? e);
    return {
      error: `Sign-in failed (${detail}).`,
    };
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
