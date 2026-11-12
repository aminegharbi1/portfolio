import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { ExperienceForm } from "./experience-form";

export const metadata: Metadata = { title: "Expérience" };

export default async function ExperienceEditPage({ params }: PageProps<"/admin/experience/[id]">) {
  const { id } = await params;
  const row = id === "new" ? null : await db.experience.findUnique({ where: { id } });
  if (id !== "new" && !row) notFound();

  return (
    <>
      <PageHeader
        title={row ? `${row.role} · ${row.company}` : "Nouvelle expérience"}
        back={{ href: "/admin/experience", label: "Expériences" }}
      />
      <ExperienceForm key={row?.id ?? "new"} row={row} />
    </>
  );
}
