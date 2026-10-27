import type { Skill } from "@/lib/portfolio/types";

import Reveal from "./Reveal";

/** Groups skills by category, keeping first-appearance order for both groups and skills. */
function groupSkills(skills: Skill[]): [string, Skill[]][] {
  const groups = new Map<string, Skill[]>();
  for (const s of skills) {
    const key = s.category?.trim() || "Other";
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return [...groups];
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const groups = groupSkills(skills);
  return (
    <section id="skills" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <Reveal className="mb-12 md:mb-16">
          <p className="eyebrow mb-4">Skills</p>
          <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
            What I&apos;m <em className="text-accent">good at</em>
          </h2>
        </Reveal>
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(([category, items], i) => (
            <Reveal key={category} delay={(i % 3) * 0.06}>
              <h3 className="eyebrow mb-4 border-b border-line pb-3">{category}</h3>
              <ul className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-full border border-line bg-surface px-4 py-2 text-sm transition-colors hover:border-accent/60 hover:text-accent"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
