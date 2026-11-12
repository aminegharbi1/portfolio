import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { clientKey, isRateLimited, recordAttempt } from "@/lib/admin/rate-limit";

/** Shown as "too many attempts" on the login page. */
export class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

// Compared against when the email is wrong, so a bad email takes as long as a bad password.
const DUMMY_HASH = "$2b$12$C/hJshU07dal0VYy3WhBL.klN0sBE3e0JIbAasYlJt2/aywvTxAdC";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) {
          console.error("[auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set.");
          return null;
        }

        const key = clientKey(request.headers);
        if (await isRateLimited(key)) throw new RateLimitedError();

        const email = String(credentials.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials.password ?? "");
        const emailOk = email === adminEmail;
        const passwordOk = await bcrypt.compare(password, emailOk ? adminHash : DUMMY_HASH);
        const success = emailOk && passwordOk;

        await recordAttempt(key, success);
        return success ? { id: "admin", email: adminEmail, name: "Admin" } : null;
      },
    }),
  ],
});
