import type { Metadata } from "next";
import { CollectionList } from "@/components/admin/collection-list";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Compétences" };

export default async function SkillsPage() {
  const groups = await db.skillGroup.findMany({
    orderBy: { position: "asc" },
    include: { skills: { orderBy: { position: "asc" }, select: { name: true } } },
  });

  return (
    <>
      <PageHeader
        title="Compétences"
        description="Chaque groupe est une étape du pipeline Data → Model → API → Interface. Les compétences sont gérées dans chaque groupe."
        action={{ href: "/admin/skills/new", label: "+ Nouveau groupe" }}
      />
      <CollectionList
        kind="skillGroup"
        newHref="/admin/skills/new"
        emptyText="Aucun groupe pour l'instant."
        deleteWarning="Le groupe et toutes ses compétences seront supprimés définitivement."
        items={groups.map((g) => ({
          id: g.id,
          title: g.title,
          subtitle: g.skills.map((s) => s.name).join(" · ") || "aucune compétence",
          status: g.status,
          href: `/admin/skills/${g.id}`,
        }))}
      />
    </>
  );
}
