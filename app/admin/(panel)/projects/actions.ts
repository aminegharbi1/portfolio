"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  assetUrl,
  bool,
  fieldErrors,
  json,
  lines,
  many,
  month,
  optional,
  optionalUrl,
  required,
  slugify,
  status,
  text,
  type ActionResult,
} from "@/lib/admin/forms";
import { requireAdmin, revalidateSite } from "@/lib/admin/session";
import { removeReplaced } from "@/lib/admin/storage";

const image = z.object({
  url: assetUrl.refine(Boolean, "Image manquante."),
  alt: z.string().trim().max(300),
});

const schema = z.object({
  title: required("Le titre", 120),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Adresse invalide : lettres minuscules, chiffres et tirets uniquement.")
    .max(80),
  summary: required("Le résumé", 400),
  description: required("La description", 20000),
  problem: optional(),
  solution: optional(),
  features: z.array(z.string().max(300)).max(30),
  context: required("Le contexte", 120),
  date: month("La date"),
  stack: z.array(z.string().max(60)).max(30),
  collaborators: z.array(z.string().max(120)).max(20),
  coverUrl: assetUrl,
  coverAlt: optional(300),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: z.boolean(),
  status,
  gallery: z.array(image).max(24, "24 images maximum."),
});

export async function saveProject(id: string | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();

  const title = text(fd, "title");
  const parsed = schema.safeParse({
    title,
    slug: slugify(text(fd, "slug") || title),
    summary: text(fd, "summary"),
    description: text(fd, "description"),
    problem: text(fd, "problem"),
    solution: text(fd, "solution"),
    features: lines(fd, "features"),
    context: text(fd, "context"),
    date: text(fd, "date"),
    stack: many(fd, "stack"),
    collaborators: many(fd, "collaborators"),
    coverUrl: text(fd, "coverUrl"),
    coverAlt: text(fd, "coverAlt"),
    repoUrl: text(fd, "repoUrl"),
    demoUrl: text(fd, "demoUrl"),
    featured: bool(fd, "featured"),
    status: text(fd, "status"),
    gallery: json(fd, "gallery") ?? [],
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const { gallery, ...data } = parsed.data;

  const clash = await db.project.findFirst({
    where: { slug: data.slug, NOT: id ? { id } : undefined },
    select: { id: true },
  });
  if (clash)
    return {
      ok: false,
      message: "Cette adresse est déjà prise.",
      errors: { slug: "Un autre projet utilise déjà cette adresse." },
    };

  const before = id
    ? await db.project.findUnique({ where: { id }, select: { coverUrl: true, images: { select: { url: true } } } })
    : null;
  if (id && !before) return { ok: false, message: "Ce projet n'existe plus." };

  const images = gallery.map((img, position) => ({ url: img.url!, alt: img.alt || data.title, position }));

  const saved = await db.$transaction(async (tx) => {
    if (id) {
      await tx.projectImage.deleteMany({ where: { projectId: id } });
      return tx.project.update({ where: { id }, data: { ...data, images: { create: images } } });
    }
    const last = await tx.project.aggregate({ _max: { position: true } });
    return tx.project.create({
      data: { ...data, position: (last._max.position ?? -1) + 1, images: { create: images } },
    });
  });

  if (before) {
    await removeReplaced(
      [before.coverUrl, ...before.images.map((i) => i.url)],
      [data.coverUrl, ...images.map((i) => i.url)],
    );
  }

  revalidateSite();
  return { ok: true, id: saved.id, message: id ? "Projet enregistré." : "Projet créé." };
}
