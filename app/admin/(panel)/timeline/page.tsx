import type { Metadata } from "next";
import { CollectionList } from "@/components/admin/collection-list";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { formatMonth } from "@/lib/format";
import { KIND_LABELS } from "./kinds";

export const metadata: Metadata = { title: "Parcours" };

export default async function TimelinePage() {
  const rows = await db.timelineEvent.findMany({ orderBy: [{ position: "asc" }, { date: "desc" }] });

  return (
    <>
      <PageHeader
        title="Parcours"
        description="La section « journey » du site (formation, expériences, projets, certifications)."
        action={{ href: "/admin/timeline/new", label: "+ Nouvelle entrée" }}
      />
      <CollectionList
        kind="timeline"
        newHref="/admin/timeline/new"
        emptyText="Aucune entrée pour l'instant."
        items={rows.map((e) => ({
          id: e.id,
          title: e.title,
          subtitle: [KIND_LABELS[e.kind], e.org, e.dateLabel ?? formatMonth(e.date)].filter(Boolean).join(" · "),
          status: e.status,
          href: `/admin/timeline/${e.id}`,
        }))}
      />
    </>
  );
}
