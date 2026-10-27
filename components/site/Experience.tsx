import { MapPin } from "lucide-react";

import { formatDateRange, mediaUrl } from "@/lib/portfolio/content";
import type { Experience as ExperienceItem } from "@/lib/portfolio/types";

import Reveal from "./Reveal";

export default function Experience({ items }: { items: ExperienceItem[] }) {
  return (
    <section id="experience" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <Reveal className="mb-12 md:mb-16">
          <p className="eyebrow mb-4">Experience</p>
          <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
            Where I&apos;ve <em className="text-accent">worked</em>
          </h2>
        </Reveal>
        <ol className="relative ml-2 border-l border-line">
          {items.map((e, i) => {
            const logo = mediaUrl(e.logoUrl);
            const range = formatDateRange(e.startDate, e.endDate, e.isCurrent);
            const responsibilities = (e.responsibilities ?? []).filter((r) => r.trim());
            return (
              <li key={e.id} className="relative pb-14 pl-8 last:pb-0 md:pl-12">
                <span
                  className={`absolute -left-1.25 top-2 h-2.5 w-2.5 rounded-full ${e.isCurrent ? "bg-accent ring-4 ring-accent/20" : "bg-muted"}`}
                  aria-hidden
                />
                <Reveal delay={Math.min(i, 5) * 0.05} className="grid gap-4 md:grid-cols-[12rem_1fr] md:gap-10">
                  {range && <p className="eyebrow pt-1.5">{range}</p>}
                  <div className="flex gap-4">
                    {logo && (
                      <img
                        src={logo}
                        alt={`${e.company} logo`}
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-xl border border-line bg-surface object-contain p-1.5"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xl font-medium">
                        {e.role} <span className="text-muted">—</span> <span className="text-accent">{e.company}</span>
                      </h3>
                      {(e.employmentType || e.location) && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                          {e.employmentType && (
                            <span className="rounded-full border border-line px-3 py-0.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase">
                              {e.employmentType}
                            </span>
                          )}
                          {e.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" aria-hidden />
                              {e.location}
                            </span>
                          )}
                        </div>
                      )}
                      {e.description && (
                        <p className="mt-4 max-w-2xl leading-relaxed text-muted whitespace-pre-line">{e.description}</p>
                      )}
                      {responsibilities.length > 0 && (
                        <ul className="mt-4 max-w-2xl list-disc space-y-1.5 pl-5 text-sm text-fg/85 marker:text-accent/70">
                          {responsibilities.map((r, j) => (
                            <li key={j}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
