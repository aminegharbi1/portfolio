"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  assetUrl,
  bool,
  fieldErrors,
  optional,
  optionalUrl,
  required,
  text,
  type ActionResult,
} from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";
import { removeReplaced } from "@/lib/admin/storage";

const schema = z.object({
  name: required("Le nom", 120),
  headline: required("Le titre", 160),
  heroTitle: required("La phrase d'accroche", 160),
  intro: required("L'introduction", 600),
  bio: optional(5000).transform((v) => v ?? ""),
  location: required("La localisation", 120),
  available: z.boolean(),
  availabilityText: optional(160).transform((v) => v ?? ""),
  email: z
    .string()
    .trim()
    .refine((v) => !v || z.email().safeParse(v).success, "Email invalide.")
    .transform((v) => v || null),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format #RRGGBB)."),
  photoUrl: assetUrl,
  cvUrl: assetUrl,
});

export async function saveProfile(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse({
    name: text(fd, "name"),
    headline: text(fd, "headline"),
    heroTitle: text(fd, "heroTitle"),
    intro: text(fd, "intro"),
    bio: text(fd, "bio"),
    location: text(fd, "location"),
    available: bool(fd, "available"),
    availabilityText: text(fd, "availabilityText"),
    email: text(fd, "email"),
    githubUrl: text(fd, "githubUrl"),
    linkedinUrl: text(fd, "linkedinUrl"),
    accentColor: text(fd, "accentColor"),
    photoUrl: text(fd, "photoUrl"),
    cvUrl: text(fd, "cvUrl"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const data = parsed.data;

  const before = await db.profile.findUnique({ where: { id: 1 }, select: { photoUrl: true, cvUrl: true } });
  const cvChanged = before?.cvUrl !== data.cvUrl;

  await db.profile.update({
    where: { id: 1 },
    data: { ...data, ...(cvChanged && { cvUpdatedAt: data.cvUrl ? new Date() : null }) },
  });
  // Old photo / CV files are deleted once the new ones are saved.
  await removeReplaced([before?.photoUrl, before?.cvUrl], [data.photoUrl, data.cvUrl]);

  revalidateSite();
  return {
    ok: true,
    message: cvChanged && data.cvUrl ? "Profil enregistré. Nouveau CV en ligne." : "Profil enregistré.",
  };
}
