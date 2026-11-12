"use client";

import { MotionConfig } from "motion/react";
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { dictionary, type Locale, type MessageKey } from "@/lib/i18n";

const STORAGE_KEY = "locale";
const listeners = new Set<() => void>();
let memoryLocale: Locale = "en";

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") return stored;
  } catch {
    /* storage unavailable: fall back to memory */
  }
  return memoryLocale;
}

function writeLocale(locale: Locale) {
  memoryLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: "en",
  setLocale: () => {},
});

export function SiteProviders({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => "en" as Locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: writeLocale }}>
      {/* "user": honours prefers-reduced-motion (transforms are disabled, fades stay). */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);

export function useT() {
  const { locale } = useLocale();
  return (key: MessageKey) => dictionary[locale][key];
}

/** Translated interface string, usable from server components. */
export function T({ k }: { k: MessageKey }) {
  return useT()(k);
}
