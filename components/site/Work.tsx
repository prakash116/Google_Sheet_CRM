"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { mediaUrl, safeEmbedUrl } from "@/lib/portfolio/content";
import type { PortfolioItem } from "@/lib/portfolio/types";

import Reveal from "./Reveal";

const ease = [0.22, 1, 0.36, 1] as const;
// Must match images.remotePatterns in next.config.ts; other hosts fall back to <img>.
const OPTIMIZED_HOSTS = new Set(["images.unsplash.com"]);
const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

function canOptimize(src: string) {
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

function thumbnailOf(item: PortfolioItem): string | null {
  return mediaUrl(item.media.thumbnailUrl ?? (item.media.type === "image" ? item.media.url : null));
}

function metaLine(item: PortfolioItem): string {
  return [item.clientName, item.year].filter((v) => v !== null && v !== "").join(" · ");
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  const className = "object-cover transition duration-700 group-hover:scale-105";
  return canOptimize(src) ? (
    <Image src={src} alt={alt} fill sizes={GRID_SIZES} loading="lazy" className={className} />
  ) : (
    <img src={src} alt={alt} loading="lazy" className={`absolute inset-0 h-full w-full ${className}`} />
  );
}

export default function Work({
  items,
  limit,
  viewAllHref,
  headingLevel = "h2",
}: {
  items: PortfolioItem[];
  /** Max cards to show (after filtering). Shows a "View all" link when more exist. */
  limit?: number;
  viewAllHref?: string;
  headingLevel?: "h1" | "h2";
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [active, setActive] = useState<PortfolioItem | null>(null);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter((c): c is string => !!c))],
    [items],
  );
  const filtered = category ? items.filter((i) => i.category === category) : items;
  const visible = limit ? filtered.slice(0, limit) : filtered;
  const Heading = headingLevel;

  return (
    <section id="work" className="mx-auto max-w-7xl px-5 py-24 md:px-10">
      <Reveal className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-4">Work</p>
          <Heading className="font-display text-4xl leading-[1.05] md:text-6xl">
            Selected <em className="text-accent">projects</em>
          </Heading>
        </div>
        {viewAllHref && items.length > (limit ?? Infinity) && (
          <Link href={viewAllHref} className="eyebrow shrink-0 transition-colors hover:text-accent">
            View all {items.length} projects →
          </Link>
        )}
      </Reveal>

      {categories.length > 1 && (
        <div role="group" aria-label="Filter projects by category" className="mb-10 flex flex-wrap gap-2">
          {[null, ...categories].map((c) => {
            const selected = category === c;
            return (
              <button
                key={c ?? "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase transition ${
                  selected ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:border-fg/40 hover:text-fg"
                }`}
              >
                {c ?? "All"}
              </button>
            );
          })}
        </div>
      )}

      <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => {
            const thumb = thumbnailOf(item);
            const meta = metaLine(item);
            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease }}
              >
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  aria-label={`Open project: ${item.title}`}
                  className="group block w-full rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-line bg-surface">
                    {thumb ? (
                      <Thumb src={thumb} alt={item.title} />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--surface-2),var(--surface))]" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
                    {item.media.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/60 backdrop-blur transition group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-ink">
                          <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
                            <path d="M2 0l14 9-14 9z" />
                          </svg>
                        </span>
                      </span>
                    )}
                    {item.category && (
                      <span className="absolute top-4 left-4 rounded-full bg-ink/60 px-3 py-1 font-mono text-[0.65rem] tracking-[0.18em] uppercase backdrop-blur">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium transition-colors group-hover:text-accent">{item.title}</h3>
                    {meta && <p className="eyebrow mt-1.5">{meta}</p>}
                  </div>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>{active && <ProjectModal item={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </section>
  );
}

function ProjectModal({ item, onClose }: { item: PortfolioItem; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [closing, setClosing] = useState(false);
  const titleId = `project-${item.id}-title`;
  const meta = [item.category, item.clientName, item.year].filter((v) => v !== null && v !== "").join(" · ");

  const close = useCallback(() => {
    videoRef.current?.pause();
    setClosing(true); // unmounts the iframe immediately so embedded playback stops
    onClose();
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], iframe, video, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [close]);

  const { media } = item;
  const src = mediaUrl(media.url);
  const poster = mediaUrl(media.thumbnailUrl) ?? undefined;
  const embed = safeEmbedUrl(media.embedUrl);

  let content: ReactNode = null;
  if (media.type === "image" && src) {
    content = canOptimize(src) ? (
      <Image
        src={src}
        alt={item.title}
        width={1600}
        height={1200}
        sizes="(min-width: 1024px) 64rem, 100vw"
        className="mx-auto h-auto max-h-[70vh] w-auto object-contain"
      />
    ) : (
      <img src={src} alt={item.title} className="mx-auto max-h-[70vh] w-auto object-contain" />
    );
  } else if (media.source === "file" && src) {
    content = (
      <div className="aspect-video">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          autoPlay
          muted
          className="h-full w-full bg-black object-contain"
        />
      </div>
    );
  } else if ((media.source === "youtube" || media.source === "vimeo") && embed && !closing) {
    content = (
      <div className="aspect-video">
        <iframe
          src={embed}
          title={item.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      </div>
    );
  } else if (poster) {
    content = <img src={poster} alt={item.title} className="mx-auto max-h-[70vh] w-auto object-contain" />;
  }

  return (
    <motion.div
      className="fixed inset-0 z-70 flex items-center justify-center overflow-y-auto bg-ink/90 p-4 backdrop-blur-sm md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto w-full max-w-5xl"
        initial={{ y: 30, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
        transition={{ duration: 0.35, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 id={titleId} className="font-display text-3xl md:text-4xl">
              {item.title}
            </h3>
            {meta && <p className="eyebrow mt-1.5">{meta}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="shrink-0 rounded-full border border-line px-4 py-2 text-sm transition hover:border-fg/40"
          >
            Close
          </button>
        </div>
        {content && <div className="overflow-hidden rounded-2xl border border-line bg-black">{content}</div>}
        {item.description && (
          <p className="mt-5 max-w-3xl leading-relaxed text-muted whitespace-pre-line">{item.description}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
