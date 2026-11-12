"use client";

import type { TimelineEvent } from "@/generated/prisma/client";
import {
  AdminForm,
  SaveBar,
  Section,
  SelectField,
  StatusField,
  TextArea,
  TextField,
} from "@/components/admin/form-kit";
import { toMonthInput } from "@/lib/admin/forms";
import { saveTimelineEvent } from "../actions";
import { KIND_LABELS } from "../kinds";

export function TimelineForm({ row }: { row: TimelineEvent | null }) {
  return (
    <AdminForm
      action={saveTimelineEvent.bind(null, row?.id ?? null)}
      onSavedHref={() => (row ? undefined : "/admin/timeline")}
    >
      <Section title="Entrée">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Type"
            name="kind"
            defaultValue={row?.kind ?? "EDUCATION"}
            options={Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <TextField label="Organisation" name="org" defaultValue={row?.org ?? ""} placeholder="ex. EMSI Casablanca" />
        </div>
        <TextField label="Titre" name="title" defaultValue={row?.title} required />
        <TextArea label="Description" name="description" defaultValue={row?.description ?? ""} rows={3} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Date"
            name="date"
            type="month"
            defaultValue={toMonthInput(row?.date)}
            hint="Sert au tri par date."
            required
          />
          <TextField
            label="Date affichée"
            name="dateLabel"
            defaultValue={row?.dateLabel ?? ""}
            placeholder="ex. 2023 – 2028"
            hint="Optionnel : remplace la date à l'affichage."
          />
        </div>
        <TextField label="Lien" name="link" type="url" defaultValue={row?.link ?? ""} placeholder="https://…" />
        <StatusField defaultValue={row?.status ?? "PUBLISHED"} />
      </Section>
      <SaveBar cancelHref="/admin/timeline" label={row ? "Enregistrer" : "Créer"} />
    </AdminForm>
  );
}
