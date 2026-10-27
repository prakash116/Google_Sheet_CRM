import {
  Camera,
  ChartNoAxesCombined,
  Check,
  Clapperboard,
  Layers,
  Megaphone,
  MonitorPlay,
  Scissors,
  Smartphone,
  Sparkles,
  Utensils,
  Video,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { mediaUrl } from "@/lib/portfolio/content";
import type { Service } from "@/lib/portfolio/types";

import Reveal from "./Reveal";
import ServiceCta from "./ServiceCta";

// Explicit allow-list of sheet icon names. lucide dropped brand icons, so "youtube" maps to MonitorPlay.
const ICONS: Record<string, LucideIcon> = {
  clapperboard: Clapperboard,
  video: Video,
  scissors: Scissors,
  camera: Camera,
  smartphone: Smartphone,
  "chart-no-axes-combined": ChartNoAxesCombined,
  megaphone: Megaphone,
  utensils: Utensils,
  layers: Layers,
  youtube: MonitorPlay,
};

const MAX_FEATURES = 4;
// Must match images.remotePatterns in next.config.ts; other hosts fall back to <img>.
const OPTIMIZED_HOSTS = new Set(["images.unsplash.com"]);

function iconFor(name: string | null): LucideIcon {
  return (name && ICONS[name.trim().toLowerCase()]) || Sparkles;
}

function ServiceImage({ src }: { src: string }) {
  const className = "object-cover transition duration-700 group-hover:scale-105";
  // alt="" — the card title right below names it.
  return OPTIMIZED_HOSTS.has(new URL(src).hostname) ? (
    <Image src={src} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className={className} />
  ) : (
    <img src={src} alt="" loading="lazy" className={`absolute inset-0 h-full w-full ${className}`} />
  );
}

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <Reveal className="mb-12 md:mb-16">
          <p className="eyebrow mb-4">Services</p>
          <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
            What I <em className="text-accent">create</em>
          </h2>
        </Reveal>

        <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = iconFor(s.icon);
            const image = mediaUrl(s.imageUrl);
            const features = s.features ?? [];
            const extra = features.length - MAX_FEATURES;
            return (
              <li key={s.id}>
                <Reveal delay={(i % 3) * 0.08} className="h-full">
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-fg/20">
                    <div className="relative aspect-16/10 overflow-hidden">
                      {image ? (
                        <>
                          <ServiceImage src={image} />
                          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface via-ink/30 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_14%,transparent),var(--surface-2)_70%)]">
                          <Icon className="h-14 w-14 text-accent/70" strokeWidth={1.25} aria-hidden />
                        </div>
                      )}
                    </div>

                    <div className="relative flex flex-1 flex-col px-7 pb-7">
                      <span className="-mt-7 mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-ink text-accent shadow-lg">
                        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                      </span>
                      {s.category && <p className="eyebrow mb-2">{s.category}</p>}
                      <h3 className="font-display text-3xl leading-tight">{s.title}</h3>
                      {s.description && (
                        <p className="mt-3 leading-relaxed text-muted whitespace-pre-line">{s.description}</p>
                      )}
                      {features.length > 0 && (
                        <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
                          {features.slice(0, MAX_FEATURES).map((f, j) => (
                            <li key={j} className="flex gap-3">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                              <span>{f}</span>
                            </li>
                          ))}
                          {extra > 0 && <li className="pl-7 text-muted">+{extra} more</li>}
                        </ul>
                      )}
                      <div className="mt-auto pt-7">
                        <ServiceCta title={s.title} />
                      </div>
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
