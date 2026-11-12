import Image from "next/image";
import type { Profile } from "@/generated/prisma/client";
import { ButtonLink, IconLink } from "@/components/ui/button";
import { ArrowRightIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { splitAccent } from "@/lib/format";
import type { PublicFaq } from "@/lib/queries";
import { AskAmine } from "./ask-amine";
import { T } from "./providers";

export function Hero({ profile, faqs }: { profile: Profile; faqs: PublicFaq[] }) {
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 lg:pt-24 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Image
              src={profile.photoUrl || "/profile.png"}
              alt={profile.name}
              width={64}
              height={64}
              priority
              className="size-16 rounded-full border border-line object-cover ring-2 ring-accent/40 ring-offset-2 ring-offset-bg"
            />
            {profile.available && (
              <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card/80 px-3 py-1.5 font-mono text-xs text-muted">
                <span className="size-2 animate-pulse-dot rounded-full bg-ok" aria-hidden />
                {profile.availabilityText}
              </p>
            )}
          </div>

          <h1
            id="hero-title"
            className="font-display text-5xl leading-[0.95] font-bold tracking-tight text-fg sm:text-6xl lg:text-7xl"
          >
            {splitAccent(profile.heroTitle).map((part, i) =>
              part.accent ? (
                <span key={i} className="text-accent">
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{profile.intro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="#work" icon={<ArrowRightIcon />}>
              <T k="hero.work" />
            </ButtonLink>
            {profile.cvUrl && (
              <ButtonLink href="/resume.pdf" variant="secondary" icon={<DownloadIcon />}>
                <T k="hero.cv" />
              </ButtonLink>
            )}
            {profile.githubUrl && (
              <IconLink href={profile.githubUrl} label="GitHub profile (opens in a new tab)">
                <GitHubIcon />
              </IconLink>
            )}
            {profile.linkedinUrl && (
              <IconLink href={profile.linkedinUrl} label="LinkedIn profile (opens in a new tab)">
                <LinkedInIcon />
              </IconLink>
            )}
          </div>
        </div>

        {faqs.length > 0 && <AskAmine faqs={faqs} />}
      </div>
    </section>
  );
}
