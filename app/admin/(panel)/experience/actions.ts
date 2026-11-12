"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  fieldErrors,
  lines,
  many,
  month,
  optionalMonth,
  required,
  status,
  text,
  type ActionResult,
} from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";

const schema = z
  .object({
    role: required("Le poste", 160),
    company: required("L'entreprise", 160),
    location: required("Le lieu", 120),
    workMode: z.enum(["", "on-site", "remote", "hybrid"]).transform((v) => v || null),
    startDate: month("La date de début"),
    endDate: optionalMonth,
    summary: required("Le résumé", 5000),
    highlights: z.array(z.string().max(300)).max(20),
    stack: z.array(z.string().max(60)).max(30),
    status,
  })
  .refine((d) => !d.endDate || d.endDate >= d.startDate, {
    path: ["endDate"],
    message: "La fin doit être après le début.",
  });

export async function saveExperience(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse({
    role: text(fd, "role"),
    company: text(fd, "company"),
    location: text(fd, "location"),
    workMode: text(fd, "workMode"),
    startDate: text(fd, "startDate"),
    endDate: text(fd, "endDate"),
    summary: text(fd, "summary"),
    highlights: lines(fd, "highlights"),
    stack: many(fd, "stack"),
    status: text(fd, "status"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const saved = id
    ? await db.experience.update({ where: { id }, data: parsed.data })
    : await db.experience.create({
        data: {
          ...parsed.data,
          position: ((await db.experience.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1,
        },
      });

  revalidateSite();
  return { ok: true, id: saved.id, message: id ? "Expérience enregistrée." : "Expérience créée." };
}
