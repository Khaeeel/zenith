import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { sanitizeAuthEnv } from "@/lib/auth-env";

sanitizeAuthEnv();

/**
 * Edge proxy (Next.js 16 renamed middleware → proxy).
 * Use Auth.js `auth()` so session cookies are read with the correct
 * `__Secure-authjs.session-token` name/salt on HTTPS — unlike getToken()
 * which defaults to the non-secure cookie name when secureCookie is omitted.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // Never gate public auth entry points
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth")
  ) {
    return;
  }

  const needsAuth =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  if (!needsAuth) {
    return;
  }

  if (!req.auth) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const login = new URL(loginPath, req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return Response.redirect(login);
  }
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
