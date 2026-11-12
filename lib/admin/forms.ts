import { z } from "zod";

/** What every admin save action returns to its form. */
export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Id of the created/updated row, so the form can navigate to it. */
  id?: string;
};

// ── Reading FormData ─────────────────────────────────────────────────────────

export const text = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();
export const bool = (fd: FormData, name: string) => fd.get(name) === "on" || fd.get(name) === "true";
/** Repeated fields (tag inputs render one hidden input per value). */
export const many = (fd: FormData, name: string) =>
  fd
    .getAll(name)
    .map((v) => String(v).trim())
    .filter(Boolean);
/** One item per line (textarea). */
export const lines = (fd: FormData, name: string) =>
  text(fd, name)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
export const json = (fd: FormData, name: string): unknown => {
  try {
    return JSON.parse(String(fd.get(name) ?? "null"));
  } catch {
    return null;
  }
};

// ── Field schemas (messages in French: they are shown in the admin) ──────────

export const required = (label: string, max = 300) =>
  z.string().trim().min(1, `${label} est obligatoire.`).max(max, `${label} : ${max} caractères maximum.`);

export const optional = (max = 20000) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum.`)
    .transform((v) => v || null);

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

/** Optional external link (http/https only, never javascript:). */
export const optionalUrl = z
  .string()
  .trim()
  .refine((v) => !v || isHttpUrl(v), "Lien invalide : il doit commencer par https://")
  .transform((v) => v || null);

/** URL returned by the upload route: a site path (/uploads/…) or an https URL. */
export const assetUrl = z
  .string()
  .trim()
  .refine((v) => !v || /^\/(?!\/)/.test(v) || v.startsWith("https://"), "Fichier invalide.")
  .transform((v) => v || null);

export const status = z.enum(["DRAFT", "PUBLISHED"]);

/** <input type="month"> value "YYYY-MM" → first day of that month (UTC). */
export const month = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, `${label} est obligatoire.`)
    .transform((v) => new Date(`${v}-01T00:00:00.000Z`));

export const optionalMonth = z
  .string()
  .refine((v) => !v || /^\d{4}-(0[1-9]|1[0-2])$/.test(v), "Date invalide.")
  .transform((v) => (v ? new Date(`${v}-01T00:00:00.000Z`) : null));

/** Date → "YYYY-MM" for <input type="month">. */
export const toMonthInput = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 7) : "");

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Turns a failed zod parse into { field: first message }. */
export function fieldErrors(error: z.ZodError): ActionResult {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { ok: false, message: "Certains champs sont à corriger.", errors };
}
