import Link from "next/link";

import { getSiteContent } from "@/lib/portfolio/api";
import { text } from "@/lib/portfolio/content";

import Footer from "./Footer";
import Nav from "./Nav";

/** Placeholder layout for legal pages until the real copy is written. */
export default async function LegalPage({ title, accent }: { title: string; accent: string }) {
  const site = await getSiteContent().catch(() => null);
  const brand = text(site, "display_name") ?? text(site, "site_name") ?? text(site, "creator_name") ?? "Portfolio";
  const email = text(site, "footer_contact_email") ?? text(site, "email");

  return (
    <>
      <Nav brand={brand} links={[{ href: "/", label: "Home" }]} home="/" />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 pt-40 pb-24 md:px-10">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
          {title} <em className="text-accent">{accent}</em>
        </h1>
        <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted">
          <p>This page is being updated. The full text will be published here soon.</p>
          {email && (
            <p>
              For any questions in the meantime, write to{" "}
              <a href={`mailto:${email}`} className="text-fg underline decoration-accent/50 underline-offset-4 hover:text-accent">
                {email}
              </a>
              .
            </p>
          )}
        </div>
        <Link href="/" className="mt-12 inline-block rounded-full border border-line px-6 py-3 transition hover:border-fg/40">
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
