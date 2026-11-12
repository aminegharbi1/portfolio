"use client";

import type { Faq } from "@/generated/prisma/client";
import { AdminForm, SaveBar, Section, StatusField, TextArea, TextField } from "@/components/admin/form-kit";
import { saveFaq } from "../actions";

export function FaqForm({ row }: { row: Faq | null }) {
  return (
    <AdminForm action={saveFaq.bind(null, row?.id ?? null)} onSavedHref={() => (row ? undefined : "/admin/faq")}>
      <Section title="Question">
        <TextField
          label="Question"
          name="question"
          defaultValue={row?.question}
          placeholder="ex. What are you looking for?"
          required
        />
        <TextArea label="Réponse" name="answer" defaultValue={row?.answer} rows={4} required />
        <TextField
          label="Source"
          name="source"
          defaultValue={row?.source}
          placeholder="ex. linkedin"
          hint="Affichée sous la réponse : « ↳ source: … »."
          required
        />
        <StatusField defaultValue={row?.status ?? "PUBLISHED"} />
      </Section>
      <SaveBar cancelHref="/admin/faq" label={row ? "Enregistrer" : "Créer"} />
    </AdminForm>
  );
}
