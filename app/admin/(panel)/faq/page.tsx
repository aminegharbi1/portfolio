import type { Metadata } from "next";
import { CollectionList } from "@/components/admin/collection-list";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const rows = await db.faq.findMany({ orderBy: { position: "asc" } });

  return (
    <>
      <PageHeader
        title="FAQ (ask-amine)"
        description="Les questions cliquables du terminal « ask-amine » dans l'en-tête du site."
        action={{ href: "/admin/faq/new", label: "+ Nouvelle question" }}
      />
      <CollectionList
        kind="faq"
        newHref="/admin/faq/new"
        emptyText="Aucune question pour l'instant."
        items={rows.map((f) => ({
          id: f.id,
          title: f.question,
          subtitle: f.answer,
          status: f.status,
          href: `/admin/faq/${f.id}`,
        }))}
      />
    </>
  );
}
