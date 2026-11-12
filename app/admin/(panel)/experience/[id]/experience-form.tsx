"use client";

import type { Experience } from "@/generated/prisma/client";
import {
  AdminForm,
  SaveBar,
  Section,
  SelectField,
  StatusField,
  TextArea,
  TextField,
} from "@/components/admin/form-kit";
import { TagInput } from "@/components/admin/inputs";
import { toMonthInput } from "@/lib/admin/forms";
import { saveExperience } from "../actions";

export function ExperienceForm({ row }: { row: Experience | null }) {
  return (
    <AdminForm
      action={saveExperience.bind(null, row?.id ?? null)}
      onSavedHref={() => (row ? undefined : "/admin/experience")}
    >
      <Section title="Poste">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Poste"
            name="role"
            defaultValue={row?.role}
            placeholder="ex. Full-Stack Developer Intern"
            required
          />
          <TextField label="Entreprise" name="company" defaultValue={row?.company} required />
          <TextField
            label="Lieu"
            name="location"
            defaultValue={row?.location}
            placeholder="ex. Casablanca, Morocco"
            required
          />
          <SelectField
            label="Mode de travail"
            name="workMode"
            defaultValue={row?.workMode ?? ""}
            options={[
              { value: "", label: "Non précisé" },
              { value: "on-site", label: "Sur site" },
              { value: "remote", label: "À distance" },
              { value: "hybrid", label: "Hybride" },
            ]}
          />
          <TextField label="Début" name="startDate" type="month" defaultValue={toMonthInput(row?.startDate)} required />
          <TextField
            label="Fin"
            name="endDate"
            type="month"
            defaultValue={toMonthInput(row?.endDate)}
            hint="Vide = en cours."
          />
        </div>
        <StatusField defaultValue={row?.status ?? "PUBLISHED"} />
      </Section>

      <Section title="Contenu">
        <TextArea label="Résumé (Markdown)" name="summary" defaultValue={row?.summary} rows={4} mono required />
        <TextArea
          label="Points forts"
          name="highlights"
          defaultValue={row?.highlights.join("\n")}
          rows={4}
          hint="Un point par ligne."
        />
        <TagInput label="Stack technique" name="stack" defaultValue={row?.stack} />
      </Section>

      <SaveBar cancelHref="/admin/experience" label={row ? "Enregistrer" : "Créer"} />
    </AdminForm>
  );
}
