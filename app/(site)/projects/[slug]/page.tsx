import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, GitHubIcon } from "@/components/ui/icons";
import { Markdown } from "@/components/site/markdown";
import { ProjectVisual } from "@/components/site/project-visual";
import { T } from "@/components/site/providers";
import { Reveal } from "@/components/site/reveal";
import { formatMonth } from "@/lib/format";
import { getProjectBySlug, getProjects } from "@/lib/queries";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      ...(project.coverUrl && { images: [{ url: project.coverUrl, alt: project.coverAlt ?? project.title }] }),
    },
  };
}

function Block({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="border-t border-line pt-8">
        <h2 className="font-mono text-sm text-accent">{title}</h2>
        <div className="mt-4">{children}</div>
      </section>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProjectBySlug(slug), getProjects()]);
  if (!project) notFound();

  const idx = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pt-16">
      <Link
        href="/#work"
        className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-muted transition hover:text-fg"
      >
        <ArrowLeftIcon /> <T k="project.back" />
      </Link>

      <header className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="font-mono text-sm text-subtle">
            {project.context} · <time dateTime={project.date.toISOString()}>{formatMonth(project.date)}</time>
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-fg sm:text-6xl">{project.title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{project.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {project.demoUrl && (
              <ButtonLink href={project.demoUrl} target="_blank" rel="noopener noreferrer" icon={<ArrowUpRightIcon />}>
                <T k="project.demo" />
              </ButtonLink>
            )}
            {project.repoUrl && (
              <ButtonLink
                href={project.repoUrl}
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
                icon={<GitHubIcon />}
              >
                <T k="project.source" />
              </ButtonLink>
            )}
          </div>
        </div>
        <ProjectVisual
          project={project}
          large
          priority
          className="aspect-16/10 rounded-2xl border border-line"
        />
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          <Block title={<T k="project.overview" />}>
            <Markdown>{project.description}</Markdown>
          </Block>
          {project.problem && (
            <Block title={<T k="project.problem" />}>
              <Markdown>{project.problem}</Markdown>
            </Block>
          )}
          {project.solution && (
            <Block title={<T k="project.solution" />}>
              <Markdown>{project.solution}</Markdown>
            </Block>
          )}
          {project.features.length > 0 && (
            <Block title={<T k="project.features" />}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-3 rounded-xl border border-line bg-card p-4 text-sm text-muted">
                    <span aria-hidden className="font-mono text-ok">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {project.images.length > 0 && (
            <Block title={<T k="project.gallery" />}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {project.images.map((img) => (
                  <li key={img.id} className="relative aspect-16/10 overflow-hidden rounded-xl border border-line bg-card-2">
                    <Image src={img.url} alt={img.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="font-mono text-sm text-accent">
              <T k="project.stack" />
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s} className="rounded-md border border-line bg-card-2 px-2.5 py-1 font-mono text-xs text-muted">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {project.collaborators.length > 0 && (
            <div>
              <h2 className="font-mono text-sm text-accent">
                <T k="project.with" />
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {project.collaborators.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {next && next.id !== project.id && (
        <Link
          href={`/projects/${next.slug}`}
          className="group mt-20 flex items-center justify-between gap-6 rounded-2xl border border-line bg-card p-6 transition hover:border-accent/50 sm:p-8"
        >
          <div>
            <p className="font-mono text-xs text-subtle">
              <T k="project.next" />
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-fg">{next.title}</p>
          </div>
          <ArrowRightIcon className="size-6 text-accent transition group-hover:translate-x-1" />
        </Link>
      )}
    </article>
  );
}
