import type { Profile } from "@/generated/prisma/client";
import { ButtonLink } from "@/components/ui/button";
import { DownloadIcon, MailIcon } from "@/components/ui/icons";
import { T } from "./providers";
import { Reveal } from "./reveal";

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
          <p className="relative font-mono text-sm text-accent">
            <T k="contact.label" />
          </p>
          <h2
            id="contact-title"
            className="relative mx-auto mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-fg sm:text-6xl"
          >
            <T k="contact.title" />
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-muted">
            <T k="contact.text" />
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            {profile.email && (
              <ButtonLink href={`mailto:${profile.email}`} icon={<MailIcon />}>
                <T k="contact.hello" />
              </ButtonLink>
            )}
            {profile.cvUrl && (
              <ButtonLink href="/resume.pdf" variant="secondary" icon={<DownloadIcon />}>
                <T k="hero.cv" />
              </ButtonLink>
            )}
            {!profile.email && profile.linkedinUrl && (
              <ButtonLink href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </ButtonLink>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
