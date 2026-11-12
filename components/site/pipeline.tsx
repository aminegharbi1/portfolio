import type { getSkillGroups } from "@/lib/queries";
import { T } from "./providers";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Groups = Awaited<ReturnType<typeof getSkillGroups>>;

export function Pipeline({ groups }: { groups: Groups }) {
  return (
    <section id="stack" aria-labelledby="stack-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading id="stack-title" label={<T k="stack.label" />} title={<T k="stack.title" />} />
      <div className="relative">
      {/* Connector line on large screens */}
      <div aria-hidden className="absolute top-10 right-8 left-8 hidden h-px bg-linear-to-r from-accent/0 via-accent/50 to-accent/0 lg:block" />
      <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((g, i) => (
          <li key={g.id}>
            <Reveal delay={i * 0.08} className="h-full">
              <div className="relative flex h-full flex-col rounded-2xl border border-line bg-card p-6 transition hover:border-accent/50">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg border border-accent/40 bg-bg font-mono text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < groups.length - 1 && (
                    <span aria-hidden className="font-mono text-subtle lg:hidden">
                      ↓
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-fg">{g.title}</h3>
                {g.tagline && <p className="mt-1 font-mono text-xs text-subtle">{g.tagline}</p>}
                {g.description && <p className="mt-3 text-sm text-muted">{g.description}</p>}
                <ul className="mt-5 flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-md border border-line bg-card-2 px-2.5 py-1 font-mono text-xs text-muted"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}
