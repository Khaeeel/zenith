import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveAuthSecret, sanitizeAuthEnv } from "@/lib/auth-env";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never gate public auth entry points
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const needsAuth =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  if (!needsAuth) {
    return NextResponse.next();
  }

  sanitizeAuthEnv();
  let token = null;
  try {
    token = await getToken({
      req: request,
      secret: resolveAuthSecret(),
    });
  } catch (err) {
    // Missing/invalid AUTH_SECRET must not 500 protected routes — send to login
    console.error("[proxy] getToken failed:", err);
  }

  if (!token) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const login = new URL(loginPath, request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
