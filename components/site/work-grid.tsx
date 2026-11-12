import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { formatMonth } from "@/lib/format";
import type { PublicProject } from "@/lib/queries";
import { ProjectVisual } from "./project-visual";
import { T } from "./providers";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const pad = (n: number) => String(n).padStart(2, "0");

function Meta({ project }: { project: PublicProject }) {
  return (
    <p className="font-mono text-xs text-subtle">
      {project.context} · <time dateTime={project.date.toISOString()}>{formatMonth(project.date)}</time>
    </p>
  );
}

function FeaturedCard({ project, index }: { project: PublicProject; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_60px_-25px_var(--accent)] md:grid-cols-2"
    >
      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-accent">{pad(index)}</span>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-accent">
            <T k="work.featured" />
          </span>
        </div>
        <h3 className="mt-5 font-display text-3xl font-bold text-fg sm:text-4xl">{project.title}</h3>
        <div className="mt-2">
          <Meta project={project} />
        </div>
        <p className="mt-5 leading-relaxed text-muted">{project.summary}</p>
        <p className="mt-6 font-mono text-xs leading-relaxed text-subtle">{project.stack.join(" · ")}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-fg">
          <T k="work.open" />
          <ArrowUpRightIcon className="text-accent transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      <ProjectVisual project={project} large priority className="min-h-64 border-t border-line md:border-t-0 md:border-l" />
    </Link>
  );
}

function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_50px_-25px_var(--accent)]"
    >
      <div className="relative">
        <ProjectVisual project={project} className="aspect-16/10 border-b border-line" />
        <span className="absolute top-3 left-3 rounded-md border border-line bg-bg/80 px-2 py-1 font-mono text-xs text-accent backdrop-blur">
          {pad(index)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold text-fg">{project.title}</h3>
          <ArrowUpRightIcon className="mt-1 shrink-0 text-subtle transition group-hover:text-accent" />
        </div>
        <div className="mt-1.5">
          <Meta project={project} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{project.summary}</p>
        <p className="mt-auto pt-5 font-mono text-xs leading-relaxed text-subtle">{project.stack.join(" · ")}</p>
      </div>
    </Link>
  );
}

export function WorkGrid({ projects }: { projects: PublicProject[] }) {
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => p !== featured);
  let n = 0;

  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading id="work-title" label={<T k="work.label" />} title={<T k="work.title" />} />
      <div className="space-y-6">
        {featured && (
          <Reveal>
            <FeaturedCard project={featured} index={++n} />
          </Reveal>
        )}
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={i * 0.06} className="h-full">
                <ProjectCard project={p} index={++n} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
