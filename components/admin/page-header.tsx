import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "./styles";

export function PageHeader({
  title,
  description,
  back,
  action,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  action?: { href: string; label: string };
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="font-mono text-sm text-subtle hover:text-fg">
          ← {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-fg">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
        </div>
        {action && (
          <Link href={action.href} className={buttonClass("primary")}>
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}
