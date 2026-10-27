import { ArrowRight, Languages, MapPin } from "lucide-react";
import Link from "next/link";

import SmartImage from "@/components/media/SmartImage";

import Reveal from "./Reveal";
import StatsRow from "./StatsRow";

export default function About({
  description,
  name,
  imageUrl,
  location,
  languages,
  stats,
}: {
  description: string;
  name: string | null;
  imageUrl: string | null;
  location: string | null;
  languages: string[];
  stats: { label: string; value: number }[] | null;
}) {
  return (
    <section id="about" className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[1fr_2fr] md:gap-16 md:px-10">
        <Reveal>
          <p className="eyebrow mb-4">About</p>
          <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">
            {name ? (
              <>
                Hi, I&apos;m <em className="text-accent">{name}</em>
              </>
            ) : (
              <>
                About <em className="text-accent">me</em>
              </>
            )}
          </h2>
          {imageUrl && (
            <div className="relative mt-8 aspect-4/5 max-w-xs overflow-hidden rounded-3xl border border-line">
              {/* alt="" — the heading beside it names the person. */}
              <SmartImage src={imageUrl} alt="" sizes="20rem" />
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-8">
          <p className="font-display text-2xl leading-snug text-fg/90 whitespace-pre-line md:text-3xl">{description}</p>

          {(location || languages.length > 0) && (
            <div className="flex flex-col gap-4 text-sm">
              {location && (
                <p className="flex items-center gap-2.5 text-muted">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden />
                  <span className="sr-only">Location: </span>
                  {location}
                </p>
              )}
              {languages.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Languages className="mr-0.5 h-4 w-4 text-accent" aria-hidden />
                  <span className="sr-only">Languages: </span>
                  <ul className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <li key={l} className="rounded-full border border-line px-3 py-1 text-xs">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {stats && stats.length > 0 && <StatsRow stats={stats} />}

          <Link
            href="/about"
            className="group inline-flex items-center gap-2 self-start font-mono text-[0.72rem] tracking-[0.18em] text-accent uppercase"
          >
            View full profile
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
