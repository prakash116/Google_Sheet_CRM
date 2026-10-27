import { GraduationCap } from "lucide-react";

import { yearRange } from "@/lib/portfolio/content";
import type { Education as EducationItem } from "@/lib/portfolio/types";

import Reveal from "./Reveal";

export default function Education({ items }: { items: EducationItem[] }) {
  return (
    <section id="education" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <Reveal className="mb-12 md:mb-16">
          <p className="eyebrow mb-4">Education</p>
          <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
            Where I <em className="text-accent">learned</em>
          </h2>
        </Reveal>
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((e, i) => {
            const years = yearRange(e.startYear, e.endYear);
            return (
              <li key={e.id}>
                <Reveal delay={(i % 2) * 0.08} className="h-full">
                  <article className="flex h-full gap-5 rounded-3xl border border-line bg-surface p-7">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-ink text-accent">
                      <GraduationCap className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      {years && <p className="eyebrow mb-2">{years}</p>}
                      <h3 className="font-display text-2xl leading-tight md:text-3xl">{e.qualification}</h3>
                      {e.institution && <p className="mt-1 text-accent">{e.institution}</p>}
                      {e.fieldOfStudy && <p className="mt-1 text-sm text-muted">{e.fieldOfStudy}</p>}
                      {e.description && (
                        <p className="mt-4 leading-relaxed text-muted whitespace-pre-line">{e.description}</p>
                      )}
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
