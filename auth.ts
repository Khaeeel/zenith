import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { AppRole } from "@prisma/client";
import { db } from "@/lib/db";
import { resolveAuthSecret, sanitizeAuthEnv } from "@/lib/auth-env";

// Must run before NextAuth reads AUTH_URL — invalid values cause TypeError: Invalid URL.
const { secret: authSecret } = sanitizeAuthEnv();

declare module "next-auth" {
  interface User {
    appRole: AppRole;
    clanId?: string | null;
    memberId?: string | null;
    displayName: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      displayName: string;
      appRole: AppRole;
      clanId?: string | null;
      memberId?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    appRole: AppRole;
    clanId?: string | null;
    memberId?: string | null;
    displayName: string;
  }
}

/**
 * Auth.js on Vercel:
 * - AUTH_SECRET (or NEXTAUTH_SECRET) required
 * - Prefer AUTH_TRUST_HOST=true and a valid AUTH_URL origin, OR omit AUTH_URL
 *   (we fall back to https://$VERCEL_URL). Never set AUTH_URL to "" or quoted values.
 * - trustHost: true so reverse-proxy hosts are accepted
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret ?? resolveAuthSecret(),
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        let user;
        try {
          user = await db.user.findUnique({ where: { email } });
        } catch (err) {
          console.error("[auth] database error during authorize:", err);
          throw new Error("DATABASE_UNAVAILABLE");
        }
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (err) {
          // Non-fatal — login can still proceed
          console.error("[auth] failed to update lastLoginAt:", err);
        }

        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          appRole: user.appRole,
          clanId: user.clanId,
          memberId: user.memberId,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email;
        token.appRole = user.appRole;
        token.clanId = user.clanId;
        token.memberId = user.memberId;
        token.displayName = user.displayName;
      }
      return token;
    },
    session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).user = {
        id: token.id,
        email: typeof token.email === "string" ? token.email : "",
        displayName: token.displayName,
        appRole: token.appRole,
        clanId: token.clanId,
        memberId: token.memberId,
      };
      return session;
    },
  },
});
