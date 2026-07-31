import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { AppRole } from "@prisma/client";
import { db } from "@/lib/db";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

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
    signIn: "/admin/login",
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
  trustHost: true,
});
