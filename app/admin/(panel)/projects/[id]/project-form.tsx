"use client";

import type { Project, ProjectImage } from "@/generated/prisma/client";
import { AdminForm, Checkbox, SaveBar, Section, StatusField, TextArea, TextField } from "@/components/admin/form-kit";
import { GalleryField, TagInput, UploadField } from "@/components/admin/inputs";
import { toMonthInput } from "@/lib/admin/forms";
import { saveProject } from "../actions";

export function ProjectForm({ project }: { project: (Project & { images: ProjectImage[] }) | null }) {
  const action = saveProject.bind(null, project?.id ?? null);

  return (
    <AdminForm action={action} onSavedHref={(id) => (!project && id ? `/admin/projects/${id}` : undefined)}>
      <Section title="L'essentiel">
        <TextField label="Titre" name="title" defaultValue={project?.title} required />
        <TextField
          label="Adresse de la page"
          name="slug"
          defaultValue={project?.slug}
          placeholder="générée depuis le titre si vide"
          hint="Le projet sera visible sur /projects/<adresse>."
        />
        <TextArea
          label="Résumé"
          name="summary"
          defaultValue={project?.summary}
          rows={2}
          hint="Une ou deux phrases, affichées sur la carte."
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Contexte"
            name="context"
            defaultValue={project?.context}
            placeholder="ex. EMSI end-of-year project"
            required
          />
          <TextField label="Date" name="date" type="month" defaultValue={toMonthInput(project?.date)} required />
        </div>
        <StatusField defaultValue={project?.status ?? "DRAFT"} />
        <Checkbox
          label="À la une"
          name="featured"
          defaultChecked={project?.featured}
          hint="Affiché en grand en haut de la section projets."
        />
      </Section>

      <Section
        title="Étude de cas"
        description="Markdown accepté : **gras**, *italique*, [lien](https://…), listes avec « - »."
      >
        <TextArea label="Description" name="description" defaultValue={project?.description} rows={6} mono required />
        <TextArea
          label="Problème"
          name="problem"
          defaultValue={project?.problem ?? ""}
          rows={4}
          mono
          hint="Optionnel : pourquoi ce projet ?"
        />
        <TextArea label="Solution" name="solution" defaultValue={project?.solution ?? ""} rows={4} mono />
        <TextArea
          label="Fonctionnalités"
          name="features"
          defaultValue={project?.features.join("\n")}
          rows={4}
          hint="Une fonctionnalité par ligne."
        />
      </Section>

      <Section title="Stack & équipe">
        <TagInput label="Stack technique" name="stack" defaultValue={project?.stack} placeholder="ex. FastAPI" />
        <TagInput
          label="Collaborateurs"
          name="collaborators"
          defaultValue={project?.collaborators}
          placeholder="ex. Salma Bourzg"
        />
      </Section>

      <Section title="Liens" description="Un champ vide masque le bouton sur la page du projet.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Code source (GitHub)"
            name="repoUrl"
            type="url"
            placeholder="https://github.com/…"
            defaultValue={project?.repoUrl ?? ""}
          />
          <TextField
            label="Démo en ligne"
            name="demoUrl"
            type="url"
            placeholder="https://…"
            defaultValue={project?.demoUrl ?? ""}
          />
        </div>
      </Section>

      <Section
        title="Images"
        description="Sans image de couverture, la carte affiche un visuel généré à partir de la stack."
      >
        <UploadField label="Image de couverture" name="coverUrl" kind="image" defaultValue={project?.coverUrl} />
        <TextField
          label="Description de la couverture"
          name="coverAlt"
          defaultValue={project?.coverAlt ?? ""}
          hint="Lue par les lecteurs d'écran, ex. « Tableau de bord admin avec les scores de fraude »."
        />
        <GalleryField name="gallery" defaultValue={project?.images.map((i) => ({ url: i.url, alt: i.alt })) ?? []} />
      </Section>

      <SaveBar cancelHref="/admin/projects" label={project ? "Enregistrer" : "Créer le projet"} />
    </AdminForm>
  );
}
