"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  fieldErrors,
  month,
  optional,
  optionalUrl,
  required,
  status,
  text,
  type ActionResult,
} from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";

const schema = z.object({
  kind: z.enum(["EDUCATION", "EXPERIENCE", "PROJECT", "CERTIFICATION"], "Type invalide."),
  title: required("Le titre", 200),
  org: optional(160),
  description: optional(2000),
  date: month("La date"),
  dateLabel: optional(60),
  link: optionalUrl,
  status,
});

export async function saveTimelineEvent(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse({
    kind: text(fd, "kind"),
    title: text(fd, "title"),
    org: text(fd, "org"),
    description: text(fd, "description"),
    date: text(fd, "date"),
    dateLabel: text(fd, "dateLabel"),
    link: text(fd, "link"),
    status: text(fd, "status"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const saved = id
    ? await db.timelineEvent.update({ where: { id }, data: parsed.data })
    : await db.timelineEvent.create({
        data: {
          ...parsed.data,
          position: ((await db.timelineEvent.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1,
        },
      });

  revalidateSite();
  return { ok: true, id: saved.id, message: id ? "Entrée enregistrée." : "Entrée créée." };
}
