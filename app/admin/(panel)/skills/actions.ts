"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { fieldErrors, json, optional, required, status, text, type ActionResult } from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";

const schema = z.object({
  title: required("Le titre", 80),
  tagline: optional(120),
  description: optional(1000),
  status,
  skills: z
    .array(
      z.object({ name: z.string().trim().min(1, "Une compétence n'a pas de nom.").max(60), inMarquee: z.boolean() }),
    )
    .max(60, "60 compétences maximum.")
    .refine(
      (list) => new Set(list.map((s) => s.name.toLowerCase())).size === list.length,
      "Une compétence apparaît deux fois.",
    ),
});

export async function saveSkillGroup(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse({
    title: text(fd, "title"),
    tagline: text(fd, "tagline"),
    description: text(fd, "description"),
    status: text(fd, "status"),
    skills: json(fd, "skills") ?? [],
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const { skills, ...data } = parsed.data;
  const rows = skills.map((s, position) => ({ ...s, position }));

  const saved = await db.$transaction(async (tx) => {
    if (id) {
      // The skills list is replaced as a whole, in the order shown in the form.
      await tx.skill.deleteMany({ where: { groupId: id } });
      return tx.skillGroup.update({ where: { id }, data: { ...data, skills: { create: rows } } });
    }
    const last = await tx.skillGroup.aggregate({ _max: { position: true } });
    return tx.skillGroup.create({
      data: { ...data, position: (last._max.position ?? -1) + 1, skills: { create: rows } },
    });
  });

  revalidateSite();
  return { ok: true, id: saved.id, message: id ? "Groupe enregistré." : "Groupe créé." };
}
