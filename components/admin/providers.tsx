"use client";

import clsx from "clsx";
import { buttonClass } from "./styles";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

// ── Toasts ───────────────────────────────────────────────────────────────────

type Toast = { id: number; tone: "success" | "error"; text: string };
type ToastFn = (text: string, tone?: Toast["tone"]) => void;

const ToastContext = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastContext);

// ── Confirmation dialog ──────────────────────────────────────────────────────

type ConfirmOptions = { title: string; body?: string; confirmLabel?: string };
type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);
/** `if (await confirm({ title: "Supprimer ?" })) …` */
export const useConfirm = () => useContext(ConfirmContext);

export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback<ToastFn>((text, tone = "success") => {
    const id = ++nextId.current;
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 3500);
  }, []);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setConfirmOpts(opts);
    dialogRef.current?.showModal();
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    dialogRef.current?.close();
  };

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        <dialog
          ref={dialogRef}
          onClose={() => settle(false)}
          aria-labelledby="confirm-title"
          className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line bg-card p-6 text-fg shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        >
          <h2 id="confirm-title" className="font-display text-xl font-bold">
            {confirmOpts?.title}
          </h2>
          {confirmOpts?.body && <p className="mt-2 text-sm leading-relaxed text-muted">{confirmOpts.body}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => settle(false)} className={buttonClass("secondary")} autoFocus>
              Annuler
            </button>
            <button type="button" onClick={() => settle(true)} className={buttonClass("danger")}>
              {confirmOpts?.confirmLabel ?? "Supprimer"}
            </button>
          </div>
        </dialog>

        <ol
          aria-live="polite"
          className="fixed right-4 bottom-4 z-[100] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2"
        >
          {toasts.map((t) => (
            <li
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className={clsx(
                "flex items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-xl",
                t.tone === "success" ? "border-ok/40" : "border-red-500/50",
              )}
            >
              <span aria-hidden className={t.tone === "success" ? "text-ok" : "text-red-400"}>
                {t.tone === "success" ? "✓" : "!"}
              </span>
              <span className="flex-1 text-fg">{t.text}</span>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                className="text-subtle hover:text-fg"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}
