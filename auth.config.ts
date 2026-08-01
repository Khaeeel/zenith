import type { NextAuthConfig } from "next-auth";
import type { AppRole } from "@prisma/client";
import { resolveAuthSecret, sanitizeAuthEnv } from "@/lib/auth-env";

// Edge-safe Auth.js options (no Prisma / bcrypt). Used by proxy.ts.
const { secret: authSecret } = sanitizeAuthEnv();

export default {
  secret: authSecret ?? resolveAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // Providers are defined in auth.ts (Node). Empty here keeps the Edge bundle clean.
  providers: [],
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
        displayName: token.displayName as string,
        appRole: token.appRole as AppRole,
        clanId: token.clanId as string | null | undefined,
        memberId: token.memberId as string | null | undefined,
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
