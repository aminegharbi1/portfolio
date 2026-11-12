"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/profile", label: "Profil & CV" },
  { href: "/admin/projects", label: "Projets" },
  { href: "/admin/experience", label: "Expériences" },
  { href: "/admin/timeline", label: "Parcours" },
  { href: "/admin/skills", label: "Compétences" },
  { href: "/admin/faq", label: "FAQ (ask-amine)" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "block rounded-lg px-3 py-2 text-sm whitespace-nowrap transition",
                  active ? "bg-accent/15 font-medium text-fg" : "text-muted hover:bg-card-2 hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
