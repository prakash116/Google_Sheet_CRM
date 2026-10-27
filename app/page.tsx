import type { Metadata } from "next";

import About from "@/components/site/About";
import Contact from "@/components/site/Contact";
import Education from "@/components/site/Education";
import Experience from "@/components/site/Experience";
import HeroSection from "@/components/hero/HeroSection";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Nav, { type NavLink } from "@/components/site/Nav";
import { socialLinksFrom } from "@/components/site/SocialIcons";
import PackagesSection from "@/components/site/Packages";
import Services from "@/components/site/Services";
import Showreel from "@/components/site/Showreel";
import Skills from "@/components/site/Skills";
import Work from "@/components/site/Work";
import { getPortfolioPageData, getSiteContent } from "@/lib/portfolio/api";
import { localProfilePhoto } from "@/lib/portfolio/localPhoto";
import { bool, list, locationOf, mediaUrl, num, text, video } from "@/lib/portfolio/content";

export const revalidate = 300;

const HOME_PROJECT_LIMIT = 6;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent().catch(() => null);
  const name = text(site, "display_name") ?? text(site, "creator_name") ?? text(site, "site_name");
  const title = text(site, "seo_title") ?? ([name, text(site, "professional_title")].filter(Boolean).join(" — ") || "Portfolio");
  const description =
    text(site, "seo_description") ?? text(site, "hero_description") ?? text(site, "about_description") ?? undefined;
  const image = mediaUrl(text(site, "hero_image_url")) ?? mediaUrl(text(site, "profile_image_url"));

  return {
    title,
    description,
    openGraph: { title, description, type: "website", ...(image ? { images: [image] } : {}) },
  };
}

export default async function Home() {
  const { site, portfolio, services, packages, experience, education, skills } = await getPortfolioPageData();

  const creatorName = text(site, "creator_name");
  const displayName = text(site, "display_name") ?? creatorName;
  const brand = text(site, "display_name") ?? text(site, "site_name") ?? creatorName ?? "Portfolio";
  const showreel = video(site, "showreel_url");
  const about = text(site, "about_description");
  const profileImage = mediaUrl(text(site, "profile_image_url")) ?? localProfilePhoto();
  const location = locationOf(site);
  const stats = bool(site, "show_statistics")
    ? [
        { label: "Years experience", value: num(site, "stats_years_experience") },
        { label: "Projects completed", value: num(site, "stats_completed_projects") },
        { label: "Happy clients", value: num(site, "stats_happy_clients") },
      ].filter((s): s is { label: string; value: number } => s.value !== null)
    : null;
  const socials = socialLinksFrom(site);

  const hasWork = !!portfolio?.length;
  const links: NavLink[] = [
    hasWork && { href: "#work", label: "Work" },
    services?.length && { href: "#services", label: "Services" },
    packages?.length && { href: "#packages", label: "Packages" },
    { href: "/about", label: "About" },
    experience?.length && { href: "#experience", label: "Experience" },
    skills?.length && { href: "#skills", label: "Skills" },
  ].filter((l): l is NavLink => !!l);

  return (
    <>
      <Nav brand={brand} links={links} />
      <main>
        <HeroSection
          personFallbackUrl={profileImage}
          fallback={
            <Hero
              name={displayName}
              title={text(site, "professional_title")}
              headline={text(site, "hero_headline")}
              description={text(site, "hero_description")}
              imageUrl={mediaUrl(text(site, "hero_image_url")) ?? profileImage}
              availability={text(site, "availability")}
              showreel={showreel}
              resumeUrl={mediaUrl(text(site, "resume_url"))}
              hasWork={hasWork}
            />
          }
        />
        {showreel && <Showreel video={showreel} title={brand} />}
        {hasWork && <Work items={portfolio!} limit={HOME_PROJECT_LIMIT} viewAllHref="/projects" />}
        {!!services?.length && <Services services={services} />}
        {!!packages?.length && <PackagesSection />}
        {about && (
          <About
            description={about}
            name={displayName}
            imageUrl={profileImage}
            location={location}
            languages={list(site, "languages")}
            stats={stats}
          />
        )}
        {!!experience?.length && <Experience items={experience} />}
        {!!education?.length && <Education items={education} />}
        {!!skills?.length && <Skills skills={skills} />}
        <Contact
          email={text(site, "email")}
          businessEmail={text(site, "business_email")}
          phone={text(site, "phone")}
          whatsapp={text(site, "whatsapp_number")}
          location={location}
          socials={socials}
          services={services?.map((s) => s.title) ?? []}
          packages={packages?.map((p) => ({ id: p.id, name: p.name })) ?? []}
        />
      </main>
      <Footer />
    </>
  );
}
