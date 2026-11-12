import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/** At most MAX_FAILURES failed logins per client within WINDOW_MS. */
export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

/** Hashed client IP, so raw IPs are never stored. */
export function clientKey(headers: Headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export async function isRateLimited(key: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const failures = await db.loginAttempt.count({
    where: { key, success: false, createdAt: { gte: since } },
  });
  return failures >= MAX_FAILURES;
}

export async function recordAttempt(key: string, success: boolean) {
  await db.loginAttempt.create({ data: { key, success } });
  if (success) {
    // A successful login clears the counter for this client.
    await db.loginAttempt.deleteMany({ where: { key, success: false } });
  }
  // Housekeeping: keep one day of history.
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
}
