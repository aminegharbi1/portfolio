import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { SkillGroupForm } from "./skill-group-form";

export const metadata: Metadata = { title: "Compétences" };

export default async function SkillGroupEditPage({ params }: PageProps<"/admin/skills/[id]">) {
  const { id } = await params;
  const group =
    id === "new"
      ? null
      : await db.skillGroup.findUnique({ where: { id }, include: { skills: { orderBy: { position: "asc" } } } });
  if (id !== "new" && !group) notFound();

  return (
    <>
      <PageHeader
        title={group ? group.title : "Nouveau groupe"}
        back={{ href: "/admin/skills", label: "Compétences" }}
      />
      <SkillGroupForm key={group?.id ?? "new"} group={group} />
    </>
  );
}
