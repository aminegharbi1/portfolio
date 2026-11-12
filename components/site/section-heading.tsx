import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function SectionHeading({ id, label, title }: { id: string; label: ReactNode; title: ReactNode }) {
  return (
    <Reveal className="mb-10 sm:mb-14">
      <p className="font-mono text-sm text-accent">{label}</p>
      <h2 id={id} className="mt-3 font-display text-3xl font-bold tracking-tight text-fg sm:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
