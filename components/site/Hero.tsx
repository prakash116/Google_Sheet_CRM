"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Play } from "lucide-react";
import { useState } from "react";

import SmartImage from "@/components/media/SmartImage";
import VideoModal from "@/components/media/VideoModal";
import HeroSceneLazy from "@/components/three/HeroSceneLazy";
import type { VideoValue } from "@/lib/portfolio/types";

const ease = [0.22, 1, 0.36, 1] as const;

/** Splits off the last 1–2 words so they can be set in the italic accent. */
function splitHeadline(headline: string): [string, string] {
  const words = headline.split(/\s+/);
  const n = words.length >= 4 ? 2 : words.length >= 2 ? 1 : 0;
  return [words.slice(0, words.length - n).join(" "), words.slice(words.length - n).join(" ")];
}

export default function Hero({
  name,
  title,
  headline,
  description,
  imageUrl,
  availability,
  showreel,
  resumeUrl,
  hasWork,
}: {
  name: string | null;
  title: string | null;
  headline: string | null;
  description: string | null;
  imageUrl: string | null;
  availability: string | null;
  showreel: VideoValue | null;
  resumeUrl: string | null;
  hasWork: boolean;
}) {
  const [reelOpen, setReelOpen] = useState(false);
  const heading = headline ?? name;
  const [lead, accent] = heading ? splitHeadline(heading) : ["", ""];

  return (
    <section id="top" className="relative flex min-h-svh items-center overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 opacity-90 md:left-1/3" aria-hidden>
        <HeroSceneLazy />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,transparent_0%,var(--ink)_75%)]" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-20 md:grid-cols-[1.35fr_1fr] md:px-10">
        <div>
          <motion.div
            className="mb-6 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            {title && <p className="eyebrow">{title}</p>}
            {availability && (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs backdrop-blur">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {availability}
              </span>
            )}
          </motion.div>

          {heading && (
            <motion.h1
              className="font-display text-5xl leading-[0.98] tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease }}
            >
              {lead}
              {lead && accent && " "}
              {accent && <em className="text-accent">{accent}</em>}
            </motion.h1>
          )}

          {description && (
            <motion.p
              className="mt-8 max-w-xl text-lg leading-relaxed text-muted whitespace-pre-line"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease }}
            >
              {description}
            </motion.p>
          )}

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
          >
            {hasWork && (
              <a
                href="#work"
                className="rounded-full bg-accent px-7 py-3.5 font-medium text-accent-ink transition hover:brightness-110"
              >
                View work
              </a>
            )}
            {showreel && (
              <button
                type="button"
                onClick={() => setReelOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3.5 transition hover:border-fg/40"
              >
                <Play className="h-4 w-4 fill-current text-accent" aria-hidden />
                View showreel
              </button>
            )}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3.5 transition hover:border-fg/40"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download resume
              </a>
            )}
            {!showreel && !resumeUrl && (
              <a
                href="#contact"
                className="rounded-full border border-line px-7 py-3.5 transition hover:border-fg/40"
              >
                Start a project
              </a>
            )}
          </motion.div>
        </div>

        {imageUrl && (
          <motion.div
            className="relative mx-auto w-full max-w-76 sm:max-w-88 md:mx-0 md:justify-self-center"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
          >
            {/* warm glow behind the portrait */}
            <div
              className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_65%)] blur-2xl"
              aria-hidden
            />
            {/* offset arch outline */}
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full rounded-b-4xl border border-accent/40"
              aria-hidden
            />
            <motion.div
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative aspect-3/4 overflow-hidden rounded-t-full rounded-b-4xl border border-line bg-surface shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]">
                <SmartImage
                  src={imageUrl}
                  alt={name ?? "Portrait"}
                  sizes="(min-width: 640px) 22rem, 19rem"
                  priority
                  className="object-top"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
              </div>
              {name && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line bg-ink/85 px-4 py-2 font-mono text-[0.68rem] tracking-[0.2em] whitespace-nowrap uppercase backdrop-blur">
                  {name}
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {reelOpen && showreel && (
          <VideoModal video={showreel} title={name ? `${name} — showreel` : "Showreel"} onClose={() => setReelOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}
