"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import SmartImage from "@/components/media/SmartImage";

export const FRAME_STYLES = ["viewfinder", "orbit", "blob", "arch", "tilt"] as const;
export type FrameStyle = (typeof FRAME_STYLES)[number];

export function frameStyleFor(requested: string | null | undefined, index: number): FrameStyle {
  const r = requested?.trim().toLowerCase();
  return (FRAME_STYLES as readonly string[]).includes(r ?? "") ? (r as FrameStyle) : FRAME_STYLES[index % FRAME_STYLES.length];
}

const ease = [0.22, 1, 0.36, 1] as const;

interface FrameProps {
  src: string;
  alt: string;
  sizes: string;
  priority: boolean;
  reduced: boolean;
}

function Glow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--accent)_26%,transparent),transparent_65%)] blur-2xl ${className}`}
    />
  );
}

/** Camera viewfinder: corner brackets, REC dot, timecode and a framing grid. */
function Viewfinder({ src, alt, sizes, priority, reduced }: FrameProps) {
  return (
    <div className="relative p-5">
      <Glow />
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface">
        <SmartImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-top" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-ink/30" />
        {/* rule-of-thirds grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_33.2%,rgb(255_255_255/0.12)_33.3%,transparent_33.5%,transparent_66.5%,rgb(255_255_255/0.12)_66.6%,transparent_66.8%),linear-gradient(to_bottom,transparent_33.2%,rgb(255_255_255/0.12)_33.3%,transparent_33.5%,transparent_66.5%,rgb(255_255_255/0.12)_66.6%,transparent_66.8%)]" />
        <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.2em] text-fg">
          <span className={`h-2 w-2 rounded-full bg-red-500 ${reduced ? "" : "animate-pulse"}`} />
          REC
        </div>
        <div className="absolute top-4 right-4 font-mono text-[0.65rem] tracking-[0.15em] text-fg/80">4K · 24FPS</div>
        <div className="absolute bottom-4 left-4 font-mono text-[0.65rem] tracking-[0.15em] text-fg/80">ISO 400</div>
        <div className="absolute right-4 bottom-4 font-mono text-[0.65rem] tracking-[0.15em] text-accent">00:00:24:12</div>
        {/* center focus mark */}
        <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg/30" />
      </div>
      {/* corner brackets */}
      {["top-0 left-0 border-t-2 border-l-2 rounded-tl-xl", "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl"].map(
        (c) => (
          <span key={c} className={`absolute h-12 w-12 border-accent ${c}`} />
        ),
      )}
    </div>
  );
}

/** Circular portrait with a rotating dashed ring and an orbiting dot. */
function Orbit({ src, alt, sizes, priority, reduced }: FrameProps) {
  const spin = reduced ? {} : { animate: { rotate: 360 }, transition: { duration: 40, repeat: Infinity, ease: "linear" as const } };
  const counter = reduced ? {} : { animate: { rotate: -360 }, transition: { duration: 18, repeat: Infinity, ease: "linear" as const } };
  return (
    <div className="relative aspect-square">
      <Glow />
      <motion.svg {...spin} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-accent/60">
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.5 2.5" />
      </motion.svg>
      <motion.div {...counter} className="absolute inset-[3%]">
        <span className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_color-mix(in_srgb,var(--accent)_90%,transparent)]" />
        <span className="absolute bottom-[14%] left-[6%] h-1.5 w-1.5 rounded-full bg-fg/60" />
      </motion.div>
      <svg viewBox="0 0 100 100" className="absolute inset-[5%] h-[90%] w-[90%] -rotate-45 text-accent">
        <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="38 270" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-[9%] overflow-hidden rounded-full border border-line bg-surface shadow-[0_30px_70px_-25px_rgb(0_0_0/0.85)]">
        <SmartImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-top" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />
      </div>
    </div>
  );
}

const BLOB_SHAPES = [
  "62% 38% 46% 54% / 55% 45% 55% 45%",
  "42% 58% 63% 37% / 45% 58% 42% 55%",
  "55% 45% 38% 62% / 62% 38% 60% 40%",
  "62% 38% 46% 54% / 55% 45% 55% 45%",
];

/** Organic shape that slowly morphs, with a gradient rim. */
function Blob({ src, alt, sizes, priority, reduced }: FrameProps) {
  const morph = reduced
    ? { style: { borderRadius: BLOB_SHAPES[0] } }
    : { animate: { borderRadius: BLOB_SHAPES }, transition: { duration: 14, repeat: Infinity, ease: "easeInOut" as const } };
  return (
    <div className="relative aspect-5/6">
      <Glow />
      <motion.div
        {...morph}
        className="absolute inset-0 translate-x-5 translate-y-5 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_35%,transparent),color-mix(in_srgb,var(--brand)_45%,transparent))] blur-[2px]"
      />
      <motion.div {...morph} className="absolute inset-0 bg-[linear-gradient(135deg,var(--accent),var(--sand),var(--brand))] p-[3px]">
        <motion.div {...morph} className="relative h-full w-full overflow-hidden bg-surface">
          <SmartImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-top" />
          <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Rounded-top arch with an offset outline. */
function Arch({ src, alt, sizes, priority }: FrameProps) {
  return (
    <div className="relative pt-4">
      <Glow />
      <div className="absolute inset-0 top-4 translate-x-4 translate-y-4 rounded-t-full rounded-b-4xl border border-accent/40" />
      <div className="relative aspect-3/4 overflow-hidden rounded-t-full rounded-b-4xl border border-line bg-surface shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]">
        <SmartImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-top" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
      </div>
    </div>
  );
}

/** Tilted print stacked on an accent card, with tape on top. */
function Tilt({ src, alt, sizes, priority }: FrameProps) {
  return (
    <div className="relative px-4 py-6">
      <Glow />
      <div className="absolute inset-x-6 inset-y-8 -rotate-6 rounded-[1.75rem] border border-accent/50 bg-accent/10" />
      <div className="relative rotate-3 rounded-[1.75rem] bg-sand p-3 pb-10 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
        <div className="relative aspect-4/5 overflow-hidden rounded-[1.25rem] bg-surface">
          <SmartImage src={src} alt={alt} sizes={sizes} priority={priority} className="object-top" />
        </div>
        <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-accent/70" />
      </div>
    </div>
  );
}

const FRAMES: Record<FrameStyle, (p: FrameProps) => ReactNode> = {
  viewfinder: Viewfinder,
  orbit: Orbit,
  blob: Blob,
  arch: Arch,
  tilt: Tilt,
};

export default function PortraitFrame({
  frame,
  src,
  alt,
  mobile,
  priority,
  active,
}: {
  frame: FrameStyle;
  src: string;
  alt: string;
  mobile: boolean;
  priority: boolean;
  active: boolean;
}) {
  const reduced = !!useReducedMotion();
  const Frame = FRAMES[frame];
  return (
    <div
      aria-hidden={mobile || undefined}
      className={`pointer-events-none absolute z-5 ${
        mobile ? "right-3 bottom-24 w-[46%] opacity-35" : "top-1/2 right-[5%] w-[min(30vw,25rem)] -translate-y-1/2 pt-10"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.94 }}
        transition={{ duration: 1, delay: active ? 0.15 : 0, ease }}
      >
        <motion.div
          animate={reduced || !active ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Frame src={src} alt={alt} sizes={mobile ? "46vw" : "(min-width: 1024px) 25rem, 30vw"} priority={priority} reduced={reduced} />
        </motion.div>
      </motion.div>
    </div>
  );
}
