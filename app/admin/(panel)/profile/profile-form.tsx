"use client";

import { useState } from "react";
import type { Profile } from "@/generated/prisma/client";
import { AdminForm, Checkbox, SaveBar, Section, TextArea, TextField } from "@/components/admin/form-kit";
import { UploadField } from "@/components/admin/inputs";
import { inputClass } from "@/components/admin/styles";
import { saveProfile } from "./actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [accent, setAccent] = useState(profile.accentColor);

  return (
    <AdminForm action={saveProfile}>
      <Section title="Identité">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nom" name="name" defaultValue={profile.name} required />
          <TextField label="Titre" name="headline" defaultValue={profile.headline} required />
        </div>
        <TextField
          label="Phrase d'accroche"
          name="heroTitle"
          defaultValue={profile.heroTitle}
          hint="Entoure un mot d'astérisques pour le colorer : I turn *models* into products."
          required
        />
        <TextArea label="Introduction" name="intro" defaultValue={profile.intro} rows={3} required />
        <TextArea label="Bio (Markdown)" name="bio" defaultValue={profile.bio} rows={4} mono />
        <TextField label="Localisation" name="location" defaultValue={profile.location} required />
        <UploadField
          label="Photo de profil"
          name="photoUrl"
          kind="image"
          defaultValue={profile.photoUrl}
          hint="Carrée de préférence (ex. 800×800). PNG, JPEG, WebP, AVIF ou GIF, 4 Mo max."
        />
      </Section>

      <Section title="Disponibilité">
        <Checkbox
          label="Disponible"
          name="available"
          defaultChecked={profile.available}
          hint="Affiche le badge vert dans l'en-tête."
        />
        <TextField label="Texte du badge" name="availabilityText" defaultValue={profile.availabilityText} />
      </Section>

      <Section title="Contact & réseaux" description="Un champ vide masque le bouton correspondant sur le site.">
        <TextField label="Email" name="email" type="email" defaultValue={profile.email ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="GitHub"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/…"
            defaultValue={profile.githubUrl ?? ""}
          />
          <TextField
            label="LinkedIn"
            name="linkedinUrl"
            type="url"
            placeholder="https://www.linkedin.com/in/…"
            defaultValue={profile.linkedinUrl ?? ""}
          />
        </div>
      </Section>

      <Section
        title="CV"
        description="Tous les boutons « Télécharger le CV » du site pointent vers /resume.pdf, qui sert toujours le dernier PDF envoyé ici. Sans CV, ces boutons sont masqués."
      >
        <UploadField label="CV (PDF)" name="cvUrl" kind="cv" defaultValue={profile.cvUrl} />
      </Section>

      <Section title="Apparence">
        <div>
          <label htmlFor="accentColor" className="mb-1.5 block text-sm font-medium text-fg">
            Couleur d&apos;accent
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label="Choisir la couleur"
              value={/^#[0-9a-f]{6}$/i.test(accent) ? accent : "#4c8dff"}
              onChange={(e) => setAccent(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-bg p-1"
            />
            <input
              id="accentColor"
              name="accentColor"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className={`${inputClass} max-w-36 font-mono`}
            />
            <span className="rounded-lg px-3 py-2 text-sm font-medium text-bg" style={{ background: accent }}>
              Aperçu
            </span>
          </div>
        </div>
      </Section>

      <SaveBar />
    </AdminForm>
  );
}
