import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  // Dark text on the accent keeps contrast ≥ 4.5:1 for any reasonably bright accent.
  primary: "bg-accent text-bg hover:brightness-110 shadow-[0_0_0_1px_var(--accent),0_8px_30px_-8px_var(--accent)]",
  secondary: "border border-line bg-card text-fg hover:border-accent/60 hover:bg-card-2",
  ghost: "text-muted hover:text-fg",
};

type Props = {
  href: string;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">;

/** Link styled as a button. External / file links render a plain <a>. */
export function ButtonLink({ href, variant = "primary", icon, className, children, ...rest }: Props) {
  const cls = clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition duration-200",
    styles[variant],
    className,
  );
  const isInternalPage = href.startsWith("/") && !href.endsWith(".pdf");
  if (isInternalPage || href.startsWith("#")) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
        {icon}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...rest}>
      {children}
      {icon}
    </a>
  );
}

/** Square icon-only link; `label` is required for screen readers. */
export function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-card text-muted transition hover:border-accent/60 hover:text-fg"
    >
      {children}
    </a>
  );
}
