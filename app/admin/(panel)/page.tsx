import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { db } from "@/lib/db";

export default async function AdminHome() {
  const [profile, projects, drafts, experience, timeline, groups, skills, faqs] = await Promise.all([
    db.profile.findUnique({
      where: { id: 1 },
      select: { email: true, cvUrl: true, cvUpdatedAt: true, photoUrl: true },
    }),
    db.project.count({ where: { status: "PUBLISHED" } }),
    db.project.count({ where: { status: "DRAFT" } }),
    db.experience.count(),
    db.timelineEvent.count(),
    db.skillGroup.count(),
    db.skill.count(),
    db.faq.count(),
  ]);

  const cards = [
    {
      href: "/admin/projects",
      label: "Projets",
      value: projects,
      note: drafts ? `+ ${drafts} brouillon(s)` : "publiés",
    },
    { href: "/admin/experience", label: "Expériences", value: experience },
    { href: "/admin/timeline", label: "Parcours", value: timeline, note: "entrées" },
    { href: "/admin/skills", label: "Compétences", value: skills, note: `${groups} groupes` },
    { href: "/admin/faq", label: "FAQ", value: faqs, note: "questions" },
  ];

  const todo = [
    !profile?.email && { href: "/admin/profile", text: "Ajouter ton email (sinon pas de bouton de contact)." },
    !profile?.cvUrl && {
      href: "/admin/profile",
      text: "Envoyer ton CV en PDF (le bouton « Télécharger le CV » apparaîtra).",
    },
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Chaque enregistrement met à jour le site public immédiatement."
      />

      {todo.length > 0 && (
        <section className="mb-8 rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <h2 className="font-display font-bold text-fg">À compléter</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {todo.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="text-muted underline-offset-4 hover:text-fg hover:underline">
                  → {t.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-2xl border border-line bg-card p-5 transition hover:border-accent/50"
            >
              <p className="text-sm text-muted">{c.label}</p>
              <p className="mt-1 font-display text-4xl font-bold text-fg">{c.value}</p>
              {c.note && <p className="mt-1 font-mono text-xs text-subtle">{c.note}</p>}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/admin/profile"
            className="block h-full rounded-2xl border border-line bg-card p-5 transition hover:border-accent/50"
          >
            <p className="text-sm text-muted">CV</p>
            <p className="mt-1 font-display text-xl font-bold text-fg">{profile?.cvUrl ? "En ligne" : "Aucun"}</p>
            {profile?.cvUpdatedAt && (
              <p className="mt-1 font-mono text-xs text-subtle">
                mis à jour le {profile.cvUpdatedAt.toLocaleDateString("fr-FR")}
              </p>
            )}
          </Link>
        </li>
      </ul>
    </>
  );
}
