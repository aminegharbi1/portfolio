import type { Profile } from "@/generated/prisma/client";
import { T } from "./providers";

export function Footer({ profile }: { profile: Profile }) {
  const links = [
    profile.githubUrl && { href: profile.githubUrl, label: "GitHub" },
    profile.linkedinUrl && { href: profile.linkedinUrl, label: "LinkedIn" },
    profile.email && { href: `mailto:${profile.email}`, label: "Email" },
    profile.cvUrl && { href: "/resume.pdf", label: "resume.pdf" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-mono text-sm text-fg">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="mt-1 text-xs text-subtle">
            {profile.location} · <T k="footer.built" />
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-mono text-sm text-muted transition hover:text-accent"
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
