"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ACCEPT, MAX_UPLOAD_BYTES, type UploadKind } from "@/lib/admin/files";
import { useFormState } from "./form-kit";
import { useToast } from "./providers";
import { SortableStack } from "./sortable";
import { buttonClass, inputClass } from "./styles";

// ── Upload helper ────────────────────────────────────────────────────────────

async function uploadFile(kind: UploadKind, file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES[kind]) {
    throw new Error(`« ${file.name} » est trop lourd (max ${MAX_UPLOAD_BYTES[kind] / 1024 / 1024} Mo).`);
  }
  const body = new FormData();
  body.set("kind", kind);
  body.set("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.status === 401) throw new Error("Session expirée : reconnecte-toi.");
  if (!res.ok || !data.url) throw new Error(data.error ?? "L'envoi a échoué.");
  return data.url;
}

function FieldShell({
  label,
  name,
  hint,
  children,
}: {
  label: ReactNode;
  name: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  const { errors } = useFormState();
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-fg">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {errors[name] && <p className="mt-1.5 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );
}

// ── Tags (stack, collaborators) ──────────────────────────────────────────────

export function TagInput({
  label,
  name,
  hint,
  defaultValue = [],
  placeholder = "Tape puis Entrée",
}: {
  label: ReactNode;
  name: string;
  hint?: ReactNode;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const id = useId();
  const [tags, setTags] = useState(defaultValue);
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length)
      setTags((t) => [...t, ...parts.filter((p) => !t.some((x) => x.toLowerCase() === p.toLowerCase()))]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      setTags((t) => t.slice(0, -1));
    }
  };

  return (
    <FieldShell
      label={<label htmlFor={id}>{label}</label>}
      name={name}
      hint={hint ?? "Entrée ou virgule pour ajouter."}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-bg p-2 focus-within:border-accent/70">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-card-2 py-1 pr-1 pl-2 font-mono text-xs text-fg"
          >
            {t}
            <input type="hidden" name={name} value={t} />
            <button
              type="button"
              aria-label={`Retirer ${t}`}
              onClick={() => setTags((all) => all.filter((x) => x !== t))}
              className="grid size-5 place-items-center rounded text-subtle hover:bg-red-500/15 hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          placeholder={tags.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm text-fg outline-none placeholder:text-subtle/70"
        />
      </div>
    </FieldShell>
  );
}

// ── Single file (photo, cover, CV) ───────────────────────────────────────────

export function UploadField({
  label,
  name,
  kind,
  hint,
  defaultValue,
}: {
  label: ReactNode;
  name: string;
  kind: UploadKind;
  hint?: ReactNode;
  defaultValue?: string | null;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      setUrl(await uploadFile(kind, file));
      toast("Fichier envoyé. Pense à enregistrer.");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const max = `${MAX_UPLOAD_BYTES[kind] / 1024 / 1024} Mo max`;

  return (
    <FieldShell
      label={label}
      name={name}
      hint={hint ?? (kind === "cv" ? `PDF, ${max}.` : `PNG, JPEG, WebP, AVIF ou GIF, ${max}.`)}
    >
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-bg p-3">
        {url && kind === "image" && (
          // Plain <img>: admin preview only, works for local and Blob URLs alike.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-20 w-32 rounded-md border border-line object-cover" />
        )}
        {url && kind === "cv" && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-accent underline">
            Voir le PDF actuel ↗
          </a>
        )}
        {!url && <span className="text-sm text-subtle">Aucun fichier.</span>}
        <div className="ml-auto flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT[kind]}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={buttonClass("secondary")}
          >
            {busy ? "Envoi…" : url ? "Remplacer" : "Choisir un fichier"}
          </button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className={buttonClass("ghost")}>
              Retirer
            </button>
          )}
        </div>
      </div>
    </FieldShell>
  );
}

// ── Gallery (project screenshots) ────────────────────────────────────────────

type GalleryImage = { id: string; url: string; alt: string };

export function GalleryField({ name, defaultValue }: { name: string; defaultValue: { url: string; alt: string }[] }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>(() =>
    defaultValue.map((img, i) => ({ ...img, id: `img-${i}-${img.url}` })),
  );
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile("image", file);
        setImages((all) => [...all, { id: `img-${Date.now()}-${url}`, url, alt: "" }]);
      } catch (err) {
        toast((err as Error).message, "error");
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FieldShell
      label="Galerie"
      name={name}
      hint="Captures affichées sur la page du projet. Glisse pour réordonner ; décris chaque image (accessibilité)."
    >
      <input type="hidden" name={name} value={JSON.stringify(images.map(({ url, alt }) => ({ url, alt })))} />
      {images.length > 0 && (
        <SortableStack
          items={images}
          onReorder={setImages}
          className="mb-3"
          renderItem={(img, handle) => (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-bg p-2">
              {handle}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-14 w-24 shrink-0 rounded border border-line object-cover" />
              <input
                aria-label="Description de l'image"
                placeholder="Description de l'image"
                value={img.alt}
                onChange={(e) =>
                  setImages((all) => all.map((x) => (x.id === img.id ? { ...x, alt: e.target.value } : x)))
                }
                className={inputClass}
              />
              <button
                type="button"
                aria-label="Retirer l'image"
                onClick={() => setImages((all) => all.filter((x) => x.id !== img.id))}
                className="grid size-9 shrink-0 place-items-center rounded-md text-subtle hover:bg-red-500/10 hover:text-red-400"
              >
                ×
              </button>
            </div>
          )}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT.image}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => onFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={buttonClass("secondary")}
      >
        {busy ? "Envoi…" : "+ Ajouter des images"}
      </button>
    </FieldShell>
  );
}

// ── Skills of a group ────────────────────────────────────────────────────────

type SkillRow = { id: string; name: string; inMarquee: boolean };

export function SkillsField({ name, defaultValue }: { name: string; defaultValue: SkillRow[] }) {
  const [skills, setSkills] = useState(defaultValue);
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value || skills.some((s) => s.name.toLowerCase() === value.toLowerCase())) return setDraft("");
    setSkills((all) => [...all, { id: `new-${Date.now()}`, name: value, inMarquee: true }]);
    setDraft("");
  };
  const patch = (id: string, change: Partial<SkillRow>) =>
    setSkills((all) => all.map((s) => (s.id === id ? { ...s, ...change } : s)));

  return (
    <FieldShell
      label="Compétences"
      name={name}
      hint="« Bandeau » = la compétence défile aussi dans le bandeau animé de la page d'accueil."
    >
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(skills.map(({ name, inMarquee }) => ({ name, inMarquee })))}
      />
      {skills.length > 0 && (
        <SortableStack
          items={skills}
          onReorder={setSkills}
          className="mb-3"
          renderItem={(s, handle) => (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-bg p-2">
              {handle}
              <input
                aria-label="Nom de la compétence"
                value={s.name}
                onChange={(e) => patch(s.id, { name: e.target.value })}
                className={inputClass}
              />
              <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={s.inMarquee}
                  onChange={(e) => patch(s.id, { inMarquee: e.target.checked })}
                  className="accent-[var(--accent)]"
                />
                Bandeau
              </label>
              <button
                type="button"
                aria-label={`Retirer ${s.name}`}
                onClick={() => setSkills((all) => all.filter((x) => x.id !== s.id))}
                className="grid size-9 shrink-0 place-items-center rounded-md text-subtle hover:bg-red-500/10 hover:text-red-400"
              >
                ×
              </button>
            </div>
          )}
        />
      )}
      <div className="flex gap-2">
        <input
          aria-label="Nouvelle compétence"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Nouvelle compétence (ex. Pandas)"
          className={inputClass}
        />
        <button type="button" onClick={add} className={buttonClass("secondary", "shrink-0")}>
          Ajouter
        </button>
      </div>
    </FieldShell>
  );
}
