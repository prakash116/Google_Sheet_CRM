import type { Metadata } from "next";
import Link from "next/link";

import Education from "@/components/site/Education";
import Experience from "@/components/site/Experience";
import Footer from "@/components/site/Footer";
import Nav, { type NavLink } from "@/components/site/Nav";
import { socialLinksFrom } from "@/components/site/SocialIcons";
import ProfileHeader from "@/components/site/ProfileHeader";
import Reveal from "@/components/site/Reveal";
import Skills from "@/components/site/Skills";
import Work from "@/components/site/Work";
import { getEducation, getExperience, getPortfolio, getSiteContent, getSkills } from "@/lib/portfolio/api";
import { localProfilePhoto } from "@/lib/portfolio/localPhoto";
import { bool, list, locationOf, mediaUrl, num, text } from "@/lib/portfolio/content";

export const revalidate = 300;

const PROFILE_PROJECT_LIMIT = 6;

function safe<T>(label: string, promise: Promise<T>): Promise<T | null> {
  return promise.catch((err) => {
    console.error(`[portfolio] ${label} failed:`, err instanceof Error ? err.message : err);
    return null;
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent().catch(() => null);
  const name = text(site, "display_name") ?? text(site, "creator_name");
  const title = name ? `About — ${name}` : "About";
  const description = text(site, "about_description") ?? text(site, "seo_description") ?? undefined;
  const image = mediaUrl(text(site, "profile_image_url")) ?? mediaUrl(text(site, "hero_image_url"));
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", ...(image ? { images: [image] } : {}) },
  };
}

export default async function AboutPage() {
  const [site, skills, portfolio, experience, education] = await Promise.all([
    safe("getSiteContent", getSiteContent()),
    safe("getSkills", getSkills()),
    safe("getPortfolio", getPortfolio()),
    safe("getExperience", getExperience()),
    safe("getEducation", getEducation()),
  ]);

  const creatorName = text(site, "creator_name");
  const displayName = text(site, "display_name") ?? creatorName;
  const brand = text(site, "display_name") ?? text(site, "site_name") ?? creatorName ?? "Portfolio";
  const socials = socialLinksFrom(site);
  const stats = bool(site, "show_statistics")
    ? [
        { label: "Years experience", value: num(site, "stats_years_experience") },
        { label: "Projects completed", value: num(site, "stats_completed_projects") },
        { label: "Happy clients", value: num(site, "stats_happy_clients") },
      ].filter((s): s is { label: string; value: number } => s.value !== null)
    : null;

  const links: NavLink[] = [
    { href: "/", label: "Home" },
    skills?.length && { href: "#skills", label: "Skills" },
    portfolio?.length && { href: "#work", label: "Work" },
    experience?.length && { href: "#experience", label: "Experience" },
    education?.length && { href: "#education", label: "Education" },
  ].filter((l): l is NavLink => !!l);

  return (
    <>
      <Nav brand={brand} links={links} home="/" />
      <main>
        <ProfileHeader
          name={displayName}
          title={text(site, "professional_title")}
          imageUrl={mediaUrl(text(site, "profile_image_url")) ?? mediaUrl(text(site, "hero_image_url")) ?? localProfilePhoto()}
          availability={text(site, "availability")}
          location={locationOf(site)}
          languages={list(site, "languages")}
          email={text(site, "email")}
          resumeUrl={mediaUrl(text(site, "resume_url"))}
          description={text(site, "about_description")}
          stats={stats}
          socials={socials}
        />
        {!!skills?.length && <Skills skills={skills} />}
        {!!portfolio?.length && (
          <div className="border-t border-line">
            <Work items={portfolio} limit={PROFILE_PROJECT_LIMIT} viewAllHref="/projects" />
          </div>
        )}
        {!!experience?.length && <Experience items={experience} />}
        {!!education?.length && <Education items={education} />}

        <section className="border-t border-line">
          <Reveal className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-end md:justify-between md:px-10">
            <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
              Have a project <em className="text-accent">in mind?</em>
            </h2>
            <Link
              href="/#contact"
              className="shrink-0 rounded-full bg-accent px-8 py-4 font-medium text-accent-ink transition hover:brightness-110"
            >
              Let&apos;s talk
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
