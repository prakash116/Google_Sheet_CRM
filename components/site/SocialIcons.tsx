import { Globe, type LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { httpsUrl, text } from "@/lib/portfolio/content";
import type { SiteContent } from "@/lib/portfolio/types";

// lucide-react 1.x removed brand icons; these are its former outlines so the stroke style matches.
function brand(children: ReactNode): ComponentType<LucideProps> {
  return function BrandIcon({ className, strokeWidth = 1.75 }: LucideProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
      >
        {children}
      </svg>
    );
  };
}

export const SOCIAL_ICONS: Record<string, ComponentType<LucideProps>> = {
  instagram: brand(
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>,
  ),
  youtube: brand(
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>,
  ),
  linkedin: brand(
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>,
  ),
  facebook: brand(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />),
  website: Globe,
};

export interface SocialLink {
  key: keyof typeof SOCIAL_ICONS;
  label: string;
  url: string | null;
}

export function socialLinksFrom(site: SiteContent | null): SocialLink[] {
  return [
    { key: "instagram", label: "Instagram", url: text(site, "instagram_url") },
    { key: "youtube", label: "YouTube", url: text(site, "youtube_url") },
    { key: "linkedin", label: "LinkedIn", url: text(site, "linkedin_url") },
    { key: "facebook", label: "Facebook", url: text(site, "facebook_url") },
    { key: "website", label: "Website", url: text(site, "website_url") },
  ];
}

/** Icon links for every https social URL; renders nothing when there are none. */
export function SocialIconList({ socials, className = "" }: { socials: SocialLink[]; className?: string }) {
  const links = socials
    .map((s) => ({ ...s, url: httpsUrl(s.url) }))
    .filter((s): s is SocialLink & { url: string } => s.url !== null && s.key in SOCIAL_ICONS);
  if (!links.length) return null;

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map((l) => {
        const Icon = SOCIAL_ICONS[l.key];
        return (
          <li key={l.key}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={l.label}
              title={l.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:border-accent hover:text-accent"
            >
              <Icon className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
