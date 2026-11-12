import { Contact } from "@/components/site/contact";
import { Hero } from "@/components/site/hero";
import { Pipeline } from "@/components/site/pipeline";
import { TechMarquee } from "@/components/site/tech-marquee";
import { Timeline } from "@/components/site/timeline";
import { WorkGrid } from "@/components/site/work-grid";
import { siteUrl } from "@/lib/format";
import { getFaqs, getMarqueeSkills, getProfile, getProjects, getSkillGroups, getTimeline } from "@/lib/queries";

// ISR: rebuilt at most hourly, and immediately whenever the admin saves.
export const revalidate = 3600;

export default async function HomePage() {
  const [profile, faqs, skills, projects, groups, timeline] = await Promise.all([
    getProfile(),
    getFaqs(),
    getMarqueeSkills(),
    getProjects(),
    getSkillGroups(),
    getTimeline(),
  ]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    url: siteUrl(),
    image: new URL(profile.photoUrl || "/profile.png", siteUrl()).toString(),
    ...(profile.email && { email: `mailto:${profile.email}` }),
    address: { "@type": "PostalAddress", addressLocality: "Casablanca", addressCountry: "MA" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "EMSI Casablanca" },
    knowsAbout: skills,
    sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so content can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero profile={profile} faqs={faqs} />
      <TechMarquee items={skills} />
      <WorkGrid projects={projects} />
      <Pipeline groups={groups} />
      <Timeline events={timeline} />
      <Contact profile={profile} />
    </>
  );
}
