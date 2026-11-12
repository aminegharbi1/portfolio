import type { NextAuthConfig } from "next-auth";

/**
 * Auth settings shared by `proxy.ts` and `lib/auth.ts`.
 * No database or bcrypt here: the proxy only needs to read the session cookie.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  // One admin, no database sessions: a signed JWT cookie is enough. 8 h, then log in again.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const loggedIn = Boolean(auth?.user);

      if (pathname === "/admin/login") {
        return loggedIn ? Response.redirect(new URL("/admin", request.nextUrl)) : true;
      }
      if (pathname.startsWith("/api/admin")) {
        return loggedIn || Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Anything else under /admin: false sends the visitor to the login page.
      return loggedIn;
    },
  },
} satisfies NextAuthConfig;
