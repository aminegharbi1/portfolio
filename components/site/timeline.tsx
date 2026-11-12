import Link from "next/link";
import type { TimelineEvent } from "@/generated/prisma/client";
import { formatMonth, shortHash } from "@/lib/format";
import { T } from "./providers";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const kindLabel: Record<TimelineEvent["kind"], string> = {
  EDUCATION: "edu",
  EXPERIENCE: "work",
  PROJECT: "project",
  CERTIFICATION: "cert",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section id="journey" aria-labelledby="journey-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading
        id="journey-title"
        label={<T k="journey.label" />}
        title={
          <span className="font-mono text-2xl sm:text-4xl">
            <span className="text-ok">$</span> git log --me
          </span>
        }
      />
      <ol className="relative max-w-3xl border-l border-line pl-6 sm:pl-10">
        {events.map((e, i) => (
          <li key={e.id} className="relative pb-10 last:pb-0">
            <span
              aria-hidden
              className={`absolute top-1.5 -left-[31px] size-3 rounded-full border-2 sm:-left-[47px] ${
                i === 0 ? "border-accent bg-accent shadow-[0_0_14px_var(--accent)]" : "border-accent/60 bg-bg"
              }`}
            />
            <Reveal delay={Math.min(i, 4) * 0.05}>
              <p className="font-mono text-xs text-subtle">
                <span className="text-[#E5C07B]">commit {shortHash(e.id)}</span>
                {i === 0 && (
                  <span>
                    {" "}
                    (<span className="text-ok">HEAD</span> → <span className="text-accent">main</span>)
                  </span>
                )}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rounded border border-line bg-card px-1.5 py-0.5 font-mono text-[11px] text-accent">
                  {kindLabel[e.kind]}
                </span>
                <time dateTime={e.date.toISOString()} className="font-mono text-xs text-subtle">
                  {e.dateLabel ?? formatMonth(e.date)}
                </time>
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-fg">
                {e.link?.startsWith("/") ? (
                  <Link href={e.link} className="transition hover:text-accent">
                    {e.title}
                  </Link>
                ) : e.link ? (
                  <a href={e.link} target="_blank" rel="noopener noreferrer" className="transition hover:text-accent">
                    {e.title}
                  </a>
                ) : (
                  e.title
                )}
              </h3>
              {e.org && <p className="mt-0.5 text-sm text-muted">{e.org}</p>}
              {e.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{e.description}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
