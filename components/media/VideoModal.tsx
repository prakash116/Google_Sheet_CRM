"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { mediaUrl, safeEmbedUrl } from "@/lib/portfolio/content";
import type { VideoValue } from "@/lib/portfolio/types";

/** Accessible video lightbox. Render inside <AnimatePresence>; unmounting stops playback. */
export default function VideoModal({ video, title, onClose }: { video: VideoValue; title: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    const player = videoRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, iframe, video");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      player?.pause();
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const embed = safeEmbedUrl(video.embedUrl);
  const file = video.source === "file" ? mediaUrl(video.url) : null;

  return (
    <motion.div
      className="fixed inset-0 z-70 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-5xl"
        initial={{ y: 30, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="rounded-full border border-line p-2.5 transition hover:border-fg/40"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-black">
          {(video.source === "youtube" || video.source === "vimeo") && embed ? (
            <iframe
              src={embed}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          ) : file ? (
            <video ref={videoRef} src={file} controls playsInline autoPlay preload="metadata" className="h-full w-full object-contain" />
          ) : (
            <p className="flex h-full items-center justify-center text-muted">This video can&apos;t be played here.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
