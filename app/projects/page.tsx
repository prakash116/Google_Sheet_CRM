import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/site/Footer";
import Nav, { type NavLink } from "@/components/site/Nav";
import Work from "@/components/site/Work";
import { getPortfolio, getSiteContent } from "@/lib/portfolio/api";
import { text } from "@/lib/portfolio/content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent().catch(() => null);
  const name = text(site, "creator_name") ?? text(site, "site_name");
  const title = name ? `Projects — ${name}` : "Projects";
  const description = text(site, "seo_description") ?? undefined;
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function ProjectsPage() {
  const [site, portfolio] = await Promise.all([
    getSiteContent().catch(() => null),
    getPortfolio().catch((err) => {
      console.error("[portfolio] getPortfolio failed:", err instanceof Error ? err.message : err);
      return null;
    }),
  ]);

  const creatorName = text(site, "creator_name");
  const brand = text(site, "display_name") ?? text(site, "site_name") ?? creatorName ?? "Portfolio";
  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
  ];

  return (
    <>
      <Nav brand={brand} links={links} home="/" />
      <main className="min-h-[70vh] pt-16">
        {portfolio?.length ? (
          <Work items={portfolio} headingLevel="h1" />
        ) : (
          <section className="mx-auto max-w-7xl px-5 py-32 md:px-10">
            <p className="eyebrow mb-4">Work</p>
            <h1 className="font-display text-4xl md:text-6xl">
              Selected <em className="text-accent">projects</em>
            </h1>
            <p className="mt-6 text-muted">No projects to show right now.</p>
            <Link href="/" className="mt-8 inline-block rounded-full border border-line px-6 py-3 transition hover:border-fg/40">
              Back to home
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
