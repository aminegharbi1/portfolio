import Image from "next/image";
import clsx from "clsx";
import { formatMonth } from "@/lib/format";
import type { PublicProject } from "@/lib/queries";

/**
 * Cover image when one is uploaded; otherwise a generated, code-styled panel
 * built from the project's own data (used for TicketFlow and until screenshots exist).
 */
export function ProjectVisual({
  project,
  large = false,
  priority = false,
  className,
}: {
  project: Pick<PublicProject, "slug" | "title" | "stack" | "context" | "date" | "coverUrl" | "coverAlt">;
  large?: boolean;
  priority?: boolean;
  className?: string;
}) {
  if (project.coverUrl) {
    return (
      <div className={clsx("relative overflow-hidden bg-card-2", className)}>
        <Image
          src={project.coverUrl}
          alt={project.coverAlt ?? `${project.title} screenshot`}
          fill
          priority={priority}
          sizes={large ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const shown = project.stack.slice(0, large ? 6 : 4);
  return (
    <div
      aria-hidden
      className={clsx(
        "relative overflow-hidden bg-card-2 font-mono",
        large ? "p-6 text-[13px] sm:p-8" : "p-5 text-xs",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(76,141,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(76,141,255,0.07)_1px,transparent_1px)] bg-size-[28px_28px]" />
      <div className="absolute -top-16 -right-16 size-56 rounded-full bg-accent/20 blur-3xl transition duration-500 group-hover:bg-accent/30" />
      <div className="relative space-y-1.5 leading-relaxed">
        <p className="text-subtle">
          <span className="text-ok">➜</span> <span className="text-accent">~/{project.slug}</span> cat stack.txt
        </p>
        {shown.map((s) => (
          <p key={s} className="text-muted">
            <span className="text-accent/70">→</span> {s}
          </p>
        ))}
        {project.stack.length > shown.length && <p className="text-subtle">… +{project.stack.length - shown.length}</p>}
        <p className="pt-2 text-subtle">
          # {project.context} · {formatMonth(project.date)}
        </p>
      </div>
    </div>
  );
}
