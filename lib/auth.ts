import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { createHash } from "node:crypto";
import { query } from "./db";
import { verifyPassword, hashPassword } from "./password";
import { authSecret } from "./auth-secret";
const input = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(128),
});
const dummyHash = hashPassword("invalid-password-for-timing-only");
export const { handlers, auth } = NextAuth({
  secret: authSecret(),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = input.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const key = createHash("sha256").update(email).digest("hex");
        const rate = await query<{ count: number }>(
          `INSERT INTO studio_attempts(key,count,window_start) VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN studio_attempts.window_start<now()-interval '15 minutes' THEN 1 ELSE studio_attempts.count+1 END,window_start=CASE WHEN studio_attempts.window_start<now()-interval '15 minutes' THEN now() ELSE studio_attempts.window_start END RETURNING count`,
          [key],
        );
        if (rate.rows[0].count > 20) return null;
        const result = await query<{
          id: string;
          email: string;
          password_hash: string;
        }>("SELECT id,email,password_hash FROM studio_users WHERE email=$1", [
          email,
        ]);
        const user = result.rows[0];
        const valid = verifyPassword(
          parsed.data.password,
          user?.password_hash || dummyHash,
        );
        if (!user || !valid) return null;
        await query("DELETE FROM studio_attempts WHERE key=$1", [key]);
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: { signIn: "/" },
});
