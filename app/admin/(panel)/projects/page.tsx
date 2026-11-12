import type { Metadata } from "next";
import { CollectionList } from "@/components/admin/collection-list";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsPage() {
  const projects = await db.project.findMany({ orderBy: [{ position: "asc" }, { date: "desc" }] });

  return (
    <>
      <PageHeader
        title="Projets"
        description="« À la une » affiche le projet en grand en haut de la section. Les brouillons sont invisibles sur le site."
        action={{ href: "/admin/projects/new", label: "+ Nouveau projet" }}
      />
      <CollectionList
        kind="project"
        newHref="/admin/projects/new"
        emptyText="Aucun projet pour l'instant."
        deleteWarning="Le projet, sa page et ses images seront supprimés définitivement."
        items={projects.map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: `${p.context} · ${formatMonth(p.date)} · /projects/${p.slug}`,
          status: p.status,
          href: `/admin/projects/${p.id}`,
          badge: p.featured ? "à la une" : undefined,
        }))}
      />
    </>
  );
}
