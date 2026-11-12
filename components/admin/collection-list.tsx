"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState, useTransition } from "react";
import { remove, reorder, setStatus, type Collection } from "@/lib/admin/collection-actions";
import { useConfirm, useToast } from "./providers";
import { SortableStack } from "./sortable";
import { buttonClass } from "./styles";

export type ListItem = {
  id: string;
  title: string;
  subtitle?: string;
  status: "DRAFT" | "PUBLISHED";
  href: string;
  badge?: string;
};

/** List page body: drag to reorder, publish/unpublish, edit, delete (with confirmation). */
export function CollectionList({
  kind,
  items,
  emptyText,
  newHref,
  deleteWarning,
}: {
  kind: Collection;
  items: ListItem[];
  emptyText: string;
  newHref: string;
  deleteWarning?: string;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [, startTransition] = useTransition();

  // Local copy for instant (optimistic) reordering; re-synced when the server sends new data.
  const [list, setList] = useState(items);
  const [source, setSource] = useState(items);
  if (items !== source) {
    setSource(items);
    setList(items);
  }

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, rollback?: () => void) =>
    startTransition(async () => {
      try {
        const res = await fn();
        if (res.message) toast(res.message, res.ok ? "success" : "error");
      } catch {
        rollback?.();
        toast("L'action a échoué. Recharge la page et réessaie.", "error");
      }
    });

  const onReorder = (next: ListItem[]) => {
    const previous = list;
    setList(next);
    run(
      () =>
        reorder(
          kind,
          next.map((i) => i.id),
        ),
      () => setList(previous),
    );
  };

  const onToggle = (item: ListItem) => {
    const value = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setList((l) => l.map((i) => (i.id === item.id ? { ...i, status: value } : i)));
    run(() => setStatus(kind, item.id, value));
  };

  const onDelete = async (item: ListItem) => {
    const ok = await confirm({
      title: `Supprimer « ${item.title} » ?`,
      body: deleteWarning ?? "Cette action est définitive.",
    });
    if (!ok) return;
    setList((l) => l.filter((i) => i.id !== item.id));
    run(() => remove(kind, item.id));
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-muted">{emptyText}</p>
        <Link href={newHref} className={buttonClass("primary", "mt-4")}>
          Ajouter
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-xs text-subtle">
        Glisse les lignes avec la poignée ⠿ pour changer l&apos;ordre d&apos;affichage sur le site.
      </p>
      <SortableStack
        items={list}
        onReorder={onReorder}
        renderItem={(item, handle) => (
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card p-2 pr-3 sm:gap-3">
            {handle}
            <div className="min-w-0 flex-1">
              <Link href={item.href} className="block truncate font-medium text-fg hover:text-accent">
                {item.title}
                {item.badge && (
                  <span className="ml-2 rounded border border-accent/40 px-1.5 py-0.5 align-middle font-mono text-[10px] text-accent">
                    {item.badge}
                  </span>
                )}
              </Link>
              {item.subtitle && <p className="truncate text-xs text-subtle">{item.subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={() => onToggle(item)}
              title={item.status === "PUBLISHED" ? "Cliquer pour masquer du site" : "Cliquer pour publier"}
              className={clsx(
                "shrink-0 rounded-full border px-2.5 py-1 font-mono text-xs transition",
                item.status === "PUBLISHED"
                  ? "border-ok/40 bg-ok/10 text-ok hover:bg-ok/20"
                  : "border-line bg-card-2 text-subtle hover:text-fg",
              )}
            >
              {item.status === "PUBLISHED" ? "publié" : "brouillon"}
            </button>
            <Link href={item.href} className={buttonClass("ghost", "hidden px-3 sm:inline-flex")}>
              Modifier
            </Link>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Supprimer ${item.title}`}
              className="grid size-9 shrink-0 place-items-center rounded-md text-subtle transition hover:bg-red-500/10 hover:text-red-400"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
              </svg>
            </button>
          </div>
        )}
      />
    </>
  );
}
