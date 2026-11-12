import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { TimelineForm } from "./timeline-form";

export const metadata: Metadata = { title: "Parcours" };

export default async function TimelineEditPage({ params }: PageProps<"/admin/timeline/[id]">) {
  const { id } = await params;
  const row = id === "new" ? null : await db.timelineEvent.findUnique({ where: { id } });
  if (id !== "new" && !row) notFound();

  return (
    <>
      <PageHeader title={row ? row.title : "Nouvelle entrée"} back={{ href: "/admin/timeline", label: "Parcours" }} />
      <TimelineForm key={row?.id ?? "new"} row={row} />
    </>
  );
}
