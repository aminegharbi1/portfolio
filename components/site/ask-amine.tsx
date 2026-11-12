"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import clsx from "clsx";
import type { PublicFaq } from "@/lib/queries";
import { useT } from "./providers";

/** Typewriter effect; shows the full text at once when reduced motion is on. */
function useTyped(text: string, enabled: boolean) {
  const [state, setState] = useState({ text, count: 0 });
  // Reset the counter when the text changes (render-time state adjustment).
  if (state.text !== text) setState({ text, count: 0 });

  useEffect(() => {
    if (!enabled || !text) return;
    const id = window.setInterval(() => {
      setState((s) => (s.count >= s.text.length ? s : { ...s, count: s.count + 2 }));
    }, 16);
    return () => window.clearInterval(id);
  }, [text, enabled]);

  const done = !enabled || state.count >= text.length;
  return { shown: done ? text : text.slice(0, state.count), done };
}

export function AskAmine({ faqs }: { faqs: PublicFaq[] }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = faqs.find((f) => f.id === activeId) ?? null;
  const { shown, done } = useTyped(active?.answer ?? "", !reduceMotion);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl"
      />
      <section
        aria-label="ask-amine, a question and answer terminal"
        className="overflow-hidden rounded-xl border border-line bg-card/95 shadow-2xl shadow-black/50"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-card-2 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBC2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
          </div>
          <p className="flex-1 text-center font-mono text-xs text-subtle">ask-amine · local RAG</p>
          <span className="w-12" aria-hidden />
        </div>

        {/* Output */}
        <div className="min-h-56 space-y-3 px-5 py-5 font-mono text-[13px] leading-relaxed sm:min-h-60">
          <p className="text-subtle">
            <span className="text-ok">➜</span> <span className="text-accent">~</span> ask-amine --interactive
          </p>
          {active ? (
            <>
              <p className="text-fg">
                <span className="text-accent">&gt;</span> {active.question}
              </p>
              <p className="text-muted" aria-hidden>
                {shown}
                {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent" />}
              </p>
              {done && (
                <p className="text-subtle" aria-hidden>
                  ↳ source: <span className="text-accent">{active.source}</span>
                  <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">
              {t("ask.idle")}
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
            </p>
          )}
          {/* Screen readers get the whole answer at once instead of the typewriter. */}
          <p className="sr-only" aria-live="polite">
            {active ? `${active.answer} Source: ${active.source}` : ""}
          </p>
        </div>

        {/* Question chips */}
        <div className="border-t border-line px-4 py-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-subtle">{t("ask.hint")}</p>
          <ul className="flex flex-wrap gap-2" aria-label={t("ask.questions")}>
            {faqs.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  aria-pressed={f.id === activeId}
                  onClick={() => setActiveId(f.id)}
                  className={clsx(
                    "min-h-9 rounded-full border px-3 py-1.5 text-left text-xs transition",
                    f.id === activeId
                      ? "border-accent bg-accent/15 text-fg"
                      : "border-line bg-bg/60 text-muted hover:border-accent/60 hover:text-fg",
                  )}
                >
                  {f.question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
