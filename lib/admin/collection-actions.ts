"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";
import { removeFile } from "@/lib/admin/storage";

/** Content types that share the list behaviour (ordering, draft/published, delete). */
const collection = z.enum(["project", "experience", "timeline", "skillGroup", "faq"]);
export type Collection = z.infer<typeof collection>;

const ids = z.array(z.string().min(1).max(64)).max(500);
const id = z.string().min(1).max(64);
const status = z.enum(["DRAFT", "PUBLISHED"]);

/** Saves a new order: position = index in `orderedIds`. */
export async function reorder(kind: Collection, orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const k = collection.parse(kind);
  const list = ids.parse(orderedIds);

  await db.$transaction(
    list.map((rowId, position) => {
      const args = { where: { id: rowId }, data: { position } };
      switch (k) {
        case "project":
          return db.project.update(args);
        case "experience":
          return db.experience.update(args);
        case "timeline":
          return db.timelineEvent.update(args);
        case "skillGroup":
          return db.skillGroup.update(args);
        case "faq":
          return db.faq.update(args);
      }
    }),
  );
  revalidateSite();
  return { ok: true, message: "Ordre enregistré." };
}

export async function setStatus(kind: Collection, rowId: string, value: "DRAFT" | "PUBLISHED"): Promise<ActionResult> {
  await requireAdmin();
  const k = collection.parse(kind);
  const args = { where: { id: id.parse(rowId) }, data: { status: status.parse(value) } };

  switch (k) {
    case "project":
      await db.project.update(args);
      break;
    case "experience":
      await db.experience.update(args);
      break;
    case "timeline":
      await db.timelineEvent.update(args);
      break;
    case "skillGroup":
      await db.skillGroup.update(args);
      break;
    case "faq":
      await db.faq.update(args);
      break;
  }
  revalidateSite();
  return { ok: true, message: value === "PUBLISHED" ? "Publié sur le site." : "Passé en brouillon (masqué du site)." };
}

export async function remove(kind: Collection, rowId: string): Promise<ActionResult> {
  await requireAdmin();
  const k = collection.parse(kind);
  const where = { id: id.parse(rowId) };

  switch (k) {
    case "project": {
      const project = await db.project.delete({ where, include: { images: true } });
      await Promise.all([removeFile(project.coverUrl), ...project.images.map((img) => removeFile(img.url))]);
      break;
    }
    case "experience":
      await db.experience.delete({ where });
      break;
    case "timeline":
      await db.timelineEvent.delete({ where });
      break;
    case "skillGroup":
      await db.skillGroup.delete({ where }); // its skills are deleted by the cascade
      break;
    case "faq":
      await db.faq.delete({ where });
      break;
  }
  revalidateSite();
  return { ok: true, message: "Supprimé." };
}
