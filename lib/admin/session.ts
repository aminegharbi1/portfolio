import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** For admin pages: sends logged-out visitors to the login page. */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

/**
 * For server actions. The proxy already guards /admin, but actions are endpoints of
 * their own, so each one checks the session again.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

/** Rebuilds every public page (home, project pages, sitemap) after a save. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
