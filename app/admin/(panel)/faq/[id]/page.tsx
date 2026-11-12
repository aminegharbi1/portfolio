import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { FaqForm } from "./faq-form";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqEditPage({ params }: PageProps<"/admin/faq/[id]">) {
  const { id } = await params;
  const row = id === "new" ? null : await db.faq.findUnique({ where: { id } });
  if (id !== "new" && !row) notFound();

  return (
    <>
      <PageHeader
        title={row ? "Modifier la question" : "Nouvelle question"}
        back={{ href: "/admin/faq", label: "FAQ" }}
      />
      <FaqForm key={row?.id ?? "new"} row={row} />
    </>
  );
}
