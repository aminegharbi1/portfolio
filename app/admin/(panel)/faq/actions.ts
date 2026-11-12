"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { fieldErrors, required, status, text, type ActionResult } from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";

const schema = z.object({
  question: required("La question", 200),
  answer: required("La réponse", 2000),
  source: required("La source", 120),
  status,
});

export async function saveFaq(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse({
    question: text(fd, "question"),
    answer: text(fd, "answer"),
    source: text(fd, "source"),
    status: text(fd, "status"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const saved = id
    ? await db.faq.update({ where: { id }, data: parsed.data })
    : await db.faq.create({
        data: {
          ...parsed.data,
          position: ((await db.faq.aggregate({ _max: { position: true } }))._max.position ?? -1) + 1,
        },
      });

  revalidateSite();
  return { ok: true, id: saved.id, message: id ? "Question enregistrée." : "Question créée." };
}
