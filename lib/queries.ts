import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Public read functions. They only ever return PUBLISHED content.
 * Pages using them are statically rendered (ISR) and revalidated by admin saves.
 */

export const getProfile = cache(async () => {
  const profile = await db.profile.findUnique({ where: { id: 1 } });
  if (!profile) throw new Error("Profile row missing: run `npm run db:seed`.");
  return profile;
});

export const getProjects = cache(() =>
  db.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ position: "asc" }, { date: "desc" }],
  }),
);

export const getProjectBySlug = cache((slug: string) =>
  db.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { images: { orderBy: { position: "asc" } } },
  }),
);

export const getSkillGroups = cache(() =>
  db.skillGroup.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { position: "asc" },
    include: { skills: { orderBy: { position: "asc" } } },
  }),
);

export const getTimeline = cache(() =>
  db.timelineEvent.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ position: "asc" }, { date: "desc" }],
  }),
);

export const getFaqs = cache(() =>
  db.faq.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { position: "asc" },
    select: { id: true, question: true, answer: true, source: true },
  }),
);

/** Unique skill names for the marquee, in pipeline order. */
export async function getMarqueeSkills() {
  const groups = await getSkillGroups();
  return [...new Set(groups.flatMap((g) => g.skills.filter((s) => s.inMarquee).map((s) => s.name)))];
}

export type PublicProject = Awaited<ReturnType<typeof getProjects>>[number];
export type PublicFaq = Awaited<ReturnType<typeof getFaqs>>[number];
