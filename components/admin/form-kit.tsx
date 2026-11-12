"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useId,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import type { ActionResult } from "@/lib/admin/forms";
import { useToast } from "./providers";
import { buttonClass, inputClass } from "./styles";

type SaveAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

const FormState = createContext<{ errors: Record<string, string>; pending: boolean }>({ errors: {}, pending: false });

/**
 * Admin form: submits to a server action, shows a toast with the result and
 * field errors under each field. Submitting through a transition (instead of
 * `<form action>`) keeps what was typed when the server rejects the data.
 */
export function AdminForm({
  action,
  children,
  /** Where to go after a successful save (e.g. the edit page of a new item). */
  onSavedHref,
  className,
}: {
  action: SaveAction;
  children: ReactNode;
  onSavedHref?: (id: string | undefined) => string | undefined;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok ? "success" : "error");
    if (state.ok) {
      const href = onSavedHref?.(state.id);
      if (href) router.push(href);
    }
    // Only react to a new result from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  return (
    <FormState.Provider value={{ errors: state.errors ?? {}, pending }}>
      <form onSubmit={onSubmit} noValidate className={clsx("space-y-6", className)}>
        {children}
      </form>
    </FormState.Provider>
  );
}

export const useFormState = () => useContext(FormState);

/** Label + control + hint + error. `children` receives the id/aria props to spread. */
export function Field({
  label,
  name,
  hint,
  className,
  children,
}: {
  label: ReactNode;
  name: string;
  hint?: ReactNode;
  className?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const { errors } = useFormState();
  const error = errors[name];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {children({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = Omit<ComponentProps<"input">, "name"> & { label: ReactNode; name: string; hint?: ReactNode };

export function TextField({ label, name, hint, className, ...rest }: InputProps) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      {(p) => <input {...p} {...rest} className={inputClass} />}
    </Field>
  );
}

export function TextArea({
  label,
  name,
  hint,
  className,
  rows = 4,
  mono,
  ...rest
}: Omit<ComponentProps<"textarea">, "name"> & { label: ReactNode; name: string; hint?: ReactNode; mono?: boolean }) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      {(p) => <textarea {...p} {...rest} rows={rows} className={clsx(inputClass, "resize-y", mono && "font-mono")} />}
    </Field>
  );
}

export function SelectField({
  label,
  name,
  hint,
  options,
  className,
  ...rest
}: Omit<ComponentProps<"select">, "name"> & {
  label: ReactNode;
  name: string;
  hint?: ReactNode;
  options: { value: string; label: string }[];
}) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      {(p) => (
        <select {...p} {...rest} className={inputClass}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({
  label,
  name,
  hint,
  defaultChecked,
}: {
  label: ReactNode;
  name: string;
  hint?: ReactNode;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-[var(--accent)]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-xs text-subtle">{hint}</p>}
      </div>
    </div>
  );
}

/** Draft / published radio pair. */
export function StatusField({ defaultValue = "PUBLISHED" }: { defaultValue?: "DRAFT" | "PUBLISHED" }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-fg">Visibilité</legend>
      <div className="flex flex-wrap gap-2">
        {[
          { value: "PUBLISHED", label: "Publié", hint: "visible sur le site" },
          { value: "DRAFT", label: "Brouillon", hint: "masqué du site" },
        ].map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm has-checked:border-accent/70 has-checked:bg-accent/10"
          >
            <input
              type="radio"
              name="status"
              value={o.value}
              defaultChecked={defaultValue === o.value}
              className="accent-[var(--accent)]"
            />
            <span className="text-fg">{o.label}</span>
            <span className="text-xs text-subtle">· {o.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Group of fields with a title. */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-fg">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

/** Sticky bar with Save / Cancel. */
export function SaveBar({ cancelHref, label = "Enregistrer" }: { cancelHref?: string; label?: string }) {
  const { pending } = useFormState();
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
      {cancelHref && (
        <Link href={cancelHref} className={buttonClass("ghost")}>
          Annuler
        </Link>
      )}
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {pending ? "Enregistrement…" : label}
      </button>
    </div>
  );
}
