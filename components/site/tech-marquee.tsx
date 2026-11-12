/** Infinite, pause-on-hover marquee. Pure CSS; static (wrapped) with reduced motion. */
export function TechMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((name) => (
        <li key={name} className="flex items-center gap-10 font-mono text-sm whitespace-nowrap text-subtle">
          {name}
          <span className="text-accent/60" aria-hidden>
            ◆
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Technologies I use" className="border-y border-line bg-card/50 py-5">
      <div className="marquee-mask group flex overflow-hidden">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
