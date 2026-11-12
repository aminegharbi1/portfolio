import clsx from "clsx";

/** Shared admin styles. Plain module (no "use client"), usable from server and client components. */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variant: ButtonVariant = "primary", extra?: string) {
  return clsx(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" && "bg-accent text-bg hover:brightness-110",
    variant === "secondary" && "border border-line bg-card-2 text-fg hover:border-accent/60",
    variant === "ghost" && "text-muted hover:bg-card-2 hover:text-fg",
    variant === "danger" && "bg-red-500 text-white hover:bg-red-400",
    extra,
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-subtle/70 transition focus:border-accent/70 focus:outline-none aria-[invalid=true]:border-red-500/70";

export const cardClass = "rounded-2xl border border-line bg-card p-5 sm:p-6";
