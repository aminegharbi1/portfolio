import type { CSSProperties } from "react";
import { Footer } from "@/components/site/footer";
import { Nav } from "@/components/site/nav";
import { SiteProviders } from "@/components/site/providers";
import { getProfile } from "@/lib/queries";

const HEX = /^#[0-9a-f]{6}$/i;

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const profile = await getProfile();
  const accent = HEX.test(profile.accentColor) ? profile.accentColor : "#4C8DFF";

  return (
    <SiteProviders>
      <div style={{ "--accent": accent } as CSSProperties} className="relative flex min-h-dvh flex-col">
        <div aria-hidden className="page-glow pointer-events-none absolute inset-x-0 top-0 -z-0 h-[48rem]" />
        <a
          href="#main"
          className="sr-only z-[60] rounded-md bg-accent px-4 py-2 font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Nav hasCv={Boolean(profile.cvUrl)} />
        <main id="main" className="relative flex-1">
          {children}
        </main>
        <Footer profile={profile} />
      </div>
    </SiteProviders>
  );
}
