import { Download, Languages, Mail, MapPin } from "lucide-react";
import Link from "next/link";

import SmartImage from "@/components/media/SmartImage";

import { SocialIconList, type SocialLink } from "./SocialIcons";
import Reveal from "./Reveal";
import StatsRow from "./StatsRow";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** Last word of the name in the italic accent, matching the site's headings. */
function AccentName({ name }: { name: string }) {
  const words = name.split(/\s+/);
  const last = words.pop();
  return (
    <>
      {words.join(" ")}
      {words.length > 0 && " "}
      <em className="text-accent">{last}</em>
    </>
  );
}

export default function ProfileHeader({
  name,
  title,
  imageUrl,
  availability,
  location,
  languages,
  email,
  resumeUrl,
  description,
  stats,
  socials,
}: {
  name: string | null;
  title: string | null;
  imageUrl: string | null;
  availability: string | null;
  location: string | null;
  languages: string[];
  email: string | null;
  resumeUrl: string | null;
  description: string | null;
  stats: { label: string; value: number }[] | null;
  socials: SocialLink[];
}) {
  return (
    <section id="top" className="relative overflow-hidden pt-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_30%_0%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 md:px-10 md:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16">
          <Reveal>
            <div className="relative mx-auto w-full max-w-xs md:mx-0">
              <div className="relative aspect-4/5 overflow-hidden rounded-4xl border border-line bg-surface">
                {imageUrl ? (
                  <SmartImage src={imageUrl} alt={name ?? "Profile photo"} sizes="20rem" priority />
                ) : (
                  <div
                    className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_16%,transparent),var(--surface-2)_70%)]"
                    aria-hidden
                  >
                    <span className="font-display text-8xl text-accent/80 italic">{name ? initials(name) : "★"}</span>
                  </div>
                )}
              </div>
              <div className="absolute -right-3 -bottom-3 -z-10 h-full w-full rounded-4xl border border-accent/30" aria-hidden />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mb-5 flex flex-wrap items-center gap-4">
              {title && <p className="eyebrow">{title}</p>}
              {availability && (
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {availability}
                </span>
              )}
            </div>

            <h1 className="font-display text-5xl leading-[0.98] tracking-tight md:text-7xl lg:text-8xl">
              {name ? <AccentName name={name} /> : <>About <em className="text-accent">me</em></>}
            </h1>

            {(location || languages.length > 0) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
                {location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" aria-hidden />
                    <span className="sr-only">Location: </span>
                    {location}
                  </span>
                )}
                {languages.length > 0 && (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <Languages className="h-4 w-4 text-accent" aria-hidden />
                    <span className="sr-only">Languages: </span>
                    {languages.map((l) => (
                      <span key={l} className="rounded-full border border-line px-3 py-0.5 text-xs text-fg">
                        {l}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/#contact"
                className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition hover:brightness-110"
              >
                Work with me
              </Link>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm transition hover:border-fg/40"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {email}
                </a>
              )}
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm transition hover:border-fg/40"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download resume
                </a>
              )}
              <SocialIconList socials={socials} className="md:ml-2" />
            </div>
          </Reveal>
        </div>

        {(description || (stats && stats.length > 0)) && (
          <div className="mt-20 grid gap-10 border-t border-line pt-14 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16">
            <Reveal>
              <p className="eyebrow">About</p>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col gap-10">
              {description && (
                <p className="font-display text-2xl leading-snug text-fg/90 whitespace-pre-line md:text-3xl">{description}</p>
              )}
              {stats && stats.length > 0 && <StatsRow stats={stats} />}
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
