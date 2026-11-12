"use client";

import type { Skill, SkillGroup } from "@/generated/prisma/client";
import { AdminForm, SaveBar, Section, StatusField, TextArea, TextField } from "@/components/admin/form-kit";
import { SkillsField } from "@/components/admin/inputs";
import { saveSkillGroup } from "../actions";

export function SkillGroupForm({ group }: { group: (SkillGroup & { skills: Skill[] }) | null }) {
  return (
    <AdminForm
      action={saveSkillGroup.bind(null, group?.id ?? null)}
      onSavedHref={() => (group ? undefined : "/admin/skills")}
    >
      <Section title="Groupe">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Titre" name="title" defaultValue={group?.title} placeholder="ex. Data" required />
          <TextField
            label="Sous-titre"
            name="tagline"
            defaultValue={group?.tagline ?? ""}
            placeholder="ex. store & query"
          />
        </div>
        <TextArea label="Description" name="description" defaultValue={group?.description ?? ""} rows={2} />
        <StatusField defaultValue={group?.status ?? "PUBLISHED"} />
      </Section>
      <Section title="Compétences du groupe">
        <SkillsField
          name="skills"
          defaultValue={group?.skills.map((s) => ({ id: s.id, name: s.name, inMarquee: s.inMarquee })) ?? []}
        />
      </Section>
      <SaveBar cancelHref="/admin/skills" label={group ? "Enregistrer" : "Créer"} />
    </AdminForm>
  );
}
