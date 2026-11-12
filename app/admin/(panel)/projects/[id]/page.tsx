import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { ProjectForm } from "./project-form";

export const metadata: Metadata = { title: "Projet" };

export default async function ProjectEditPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project =
    id === "new"
      ? null
      : await db.project.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } });
  if (id !== "new" && !project) notFound();

  return (
    <>
      <PageHeader
        title={project ? project.title : "Nouveau projet"}
        back={{ href: "/admin/projects", label: "Projets" }}
        description={
          project?.status === "PUBLISHED" ? (
            <a href={`/projects/${project.slug}`} target="_blank" className="font-mono text-accent hover:underline">
              /projects/{project.slug} ↗
            </a>
          ) : undefined
        }
      />
      {/* key: reset the form state when switching between projects */}
      <ProjectForm key={project?.id ?? "new"} project={project} />
    </>
  );
}
