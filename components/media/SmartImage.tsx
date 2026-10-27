import Image from "next/image";

// Must match images.remotePatterns in next.config.ts; other hosts fall back to <img>
// so an unexpected host in the sheet never breaks the page.
const OPTIMIZED_HOSTS = new Set(["images.unsplash.com", "res.cloudinary.com"]);

function canOptimize(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true; // file in /public
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** Fills its (relatively positioned) parent. */
export default function SmartImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return canOptimize(src) ? (
    // `priority` is deprecated in Next 16; eager + high fetch priority is the recommended LCP setup.
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`object-cover ${className}`}
    />
  ) : (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
