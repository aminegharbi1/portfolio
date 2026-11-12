import type { Metadata } from "next";
import { CollectionList } from "@/components/admin/collection-list";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = { title: "Expériences" };

export default async function ExperiencePage() {
  const rows = await db.experience.findMany({ orderBy: [{ position: "asc" }, { startDate: "desc" }] });

  return (
    <>
      <PageHeader
        title="Expériences"
        description="Stages et expériences professionnelles."
        action={{ href: "/admin/experience/new", label: "+ Nouvelle expérience" }}
      />
      <CollectionList
        kind="experience"
        newHref="/admin/experience/new"
        emptyText="Aucune expérience pour l'instant."
        items={rows.map((e) => ({
          id: e.id,
          title: `${e.role} · ${e.company}`,
          subtitle: `${formatMonth(e.startDate)} → ${e.endDate ? formatMonth(e.endDate) : "aujourd'hui"} · ${e.location}`,
          status: e.status,
          href: `/admin/experience/${e.id}`,
        }))}
      />
    </>
  );
}
