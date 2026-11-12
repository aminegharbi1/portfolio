import NextAuth from "next-auth";
import type { NextFetchEvent, NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

// The rules (login page, 401 for the API, redirect to login) live in `authConfig.callbacks.authorized`.
const guard = auth(() => undefined);

/**
 * Guards /admin and /api/admin. Server actions and the upload route also check the
 * session themselves.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  return guard(request, event as never);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
