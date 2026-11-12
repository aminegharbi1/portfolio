"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { useLocale, useT } from "./providers";

const links = [
  { href: "/#work", label: "/work" },
  { href: "/#stack", label: "/stack" },
  { href: "/#journey", label: "/journey" },
];

export function Nav({ hasCv }: { hasCv: boolean }) {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation or with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const langToggle = (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "fr" : "en")}
      aria-label={t("nav.language")}
      className="inline-flex min-h-11 items-center rounded-md px-2 font-mono text-xs text-subtle transition hover:text-fg"
    >
      <span className={clsx(locale === "en" && "text-fg")}>EN</span>
      <span aria-hidden className="mx-1 text-line">/</span>
      <span className={clsx(locale === "fr" && "text-fg")}>FR</span>
    </button>
  );

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-md border border-accent/50 bg-accent/10 font-display text-sm font-bold text-accent transition group-hover:bg-accent group-hover:text-bg">
            AG
          </span>
          <span className="font-mono text-sm text-fg">
            amine.gharbi<span className="animate-blink text-accent">_</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 font-mono text-sm text-muted transition hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          {langToggle}
          {hasCv && (
            <a
              href="/resume.pdf"
              className="ml-2 inline-flex min-h-10 items-center rounded-lg border border-accent/50 bg-accent/10 px-3.5 font-mono text-sm text-fg transition hover:bg-accent hover:text-bg"
            >
              {t("nav.resume")}
            </a>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-muted md:hidden"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-mono text-base text-muted hover:text-fg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            {langToggle}
            {hasCv && (
              <a
                href="/resume.pdf"
                className="inline-flex min-h-11 items-center rounded-lg border border-accent/50 bg-accent/10 px-4 font-mono text-sm text-fg"
              >
                {t("nav.resume")}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
