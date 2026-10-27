import { mediaUrl, safeEmbedUrl } from "@/lib/portfolio/content";
import type { MediaSource } from "@/lib/portfolio/types";

export interface EmbeddableMedia {
  source: MediaSource;
  url: string;
  embedUrl: string | null;
  thumbnailUrl?: string | null;
}

/** Renders API media safely: image, allow-listed iframe embed, or native video. */
export default function MediaEmbed({
  media,
  title,
  className = "",
}: {
  media: EmbeddableMedia;
  title: string;
  className?: string;
}) {
  const poster = mediaUrl(media.thumbnailUrl) ?? undefined;

  if (media.source === "image") {
    const src = mediaUrl(media.url);
    return src ? (
      <img src={src} alt={title} loading="lazy" className={`h-full w-full object-cover ${className}`} />
    ) : null;
  }

  if (media.source === "youtube" || media.source === "vimeo") {
    const embed = safeEmbedUrl(media.embedUrl);
    if (embed) {
      return (
        <iframe
          src={embed}
          title={title}
          className={`h-full w-full ${className}`}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }
    return poster ? (
      <img src={poster} alt={title} loading="lazy" className={`h-full w-full object-cover ${className}`} />
    ) : null;
  }

  if (media.source === "file") {
    const src = mediaUrl(media.url);
    return src ? (
      <video controls playsInline preload="metadata" src={src} poster={poster} className={`h-full w-full bg-black object-contain ${className}`} />
    ) : null;
  }

  return null;
}
