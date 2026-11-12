import Link from "next/link";
import { AdminNav } from "@/components/admin/nav";
import { AdminProviders } from "@/components/admin/providers";
import { buttonClass } from "@/components/admin/styles";
import { signOut } from "@/lib/auth";
import { requireAdminPage } from "@/lib/admin/session";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdminPage();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <AdminProviders>
      <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="border-b border-line bg-card/80 backdrop-blur lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
          <div className="flex h-full flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href="/admin" className="font-mono text-sm text-fg">
                amine.gharbi<span className="text-accent">/admin</span>
              </Link>
              <Link href="/" target="_blank" className="font-mono text-xs text-subtle hover:text-fg lg:hidden">
                site ↗
              </Link>
            </div>
            <AdminNav />
            <div className="mt-auto hidden space-y-2 border-t border-line pt-4 lg:block">
              <p className="truncate text-xs text-subtle" title={session.user?.email ?? ""}>
                {session.user?.email}
              </p>
              <Link href="/" target="_blank" className={buttonClass("ghost", "w-full justify-start px-2")}>
                Voir le site ↗
              </Link>
              <form action={logout}>
                <button type="submit" className={buttonClass("ghost", "w-full justify-start px-2")}>
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
          <form action={logout} className="px-4 pb-8 lg:hidden">
            <button type="submit" className={buttonClass("secondary", "w-full")}>
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </AdminProviders>
  );
}
