import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import SmartImage from "@/components/media/SmartImage";
import { getLinks, getSiteContent } from "@/lib/portfolio/api";
import { bool, hexColor, safeHref, text } from "@/lib/portfolio/content";
import type { SiteContent, SiteLink } from "@/lib/portfolio/types";

import { BackToTop, FooterNavLink } from "./FooterClient";
import { SOCIAL_ICONS } from "./SocialIcons";

/** Booleans default to `fallback` when the key is missing from the sheet. */
function flag(site: SiteContent | null, key: string, fallback = true): boolean {
  return site?.[key] === undefined || site?.[key] === null ? fallback : bool(site, key);
}

/** Splits off the last 2–3 words for the italic accent. */
function splitTagline(tagline: string): [string, string] {
  const words = tagline.split(/\s+/);
  const n = words.length >= 6 ? 3 : words.length >= 3 ? 2 : words.length > 1 ? 1 : 0;
  return [words.slice(0, words.length - n).join(" "), words.slice(words.length - n).join(" ")];
}

function withSafeHref(links: SiteLink[] | undefined) {
  return (links ?? []).flatMap((l) => {
    const href = safeHref(l.href);
    return href && l.label ? [{ ...l, href }] : [];
  });
}

const linkClass = "opacity-70 transition hover:text-(--footer-accent) hover:opacity-100";
const hairline = "border-[color-mix(in_srgb,var(--footer-text)_10%,transparent)]";

/** Renders a sheet link with the right element: smooth-scroll for "#…", next/link for "/…", <a> otherwise. */
function FooterLink({ link, className }: { link: SiteLink; className: string }) {
  if (link.href.startsWith("#")) {
    return (
      <FooterNavLink href={link.href} className={className}>
        {link.label}
      </FooterNavLink>
    );
  }
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className}>
      {link.label}
    </a>
  );
}

export default async function Footer() {
  const [site, links] = await Promise.all([getSiteContent().catch(() => null), getLinks().catch(() => null)]);
  if (site && !flag(site, "footer_enabled")) return null;

  const brand =
    text(site, "footer_brand_name") ?? text(site, "display_name") ?? text(site, "site_name") ?? text(site, "creator_name");
  const logo = text(site, "footer_logo_url");
  const tagline = text(site, "footer_tagline");
  const description = text(site, "footer_description");
  const email = flag(site, "footer_show_email") ? text(site, "footer_contact_email") : null;
  const emailLabel = text(site, "footer_email_label") ?? "Let's work together";
  const availability = flag(site, "footer_show_availability") ? text(site, "footer_availability_text") : null;
  const available = text(site, "footer_availability_status") === "available";
  const navigation = flag(site, "footer_show_navigation") ? withSafeHref(links?.navigation) : [];
  const social = flag(site, "footer_show_social_icons") ? withSafeHref(links?.social) : [];
  const legal = withSafeHref(links?.legal);
  const showLargeBrand = flag(site, "footer_show_large_brand_text") && !!brand;
  const backToTop = flag(site, "footer_back_to_top") ? (text(site, "footer_back_to_top_label") ?? "Back to top") : null;

  const owner = [
    flag(site, "footer_copyright_show_year") && `© ${new Date().getFullYear()}`,
    flag(site, "footer_copyright_show_brand") && brand,
  ]
    .filter(Boolean)
    .join(" ");
  const copyright = [owner, text(site, "footer_copyright_text")].filter(Boolean).join(". ");

  const style = {
    "--footer-bg-custom": hexColor(text(site, "footer_bg_color")) ?? undefined,
    "--footer-text-custom": hexColor(text(site, "footer_text_color")) ?? undefined,
    "--footer-accent-custom": hexColor(text(site, "footer_accent_color")) ?? undefined,
  } as CSSProperties;

  const [taglineLead, taglineAccent] = tagline ? splitTagline(tagline) : ["", ""];

  return (
    <footer
      style={style}
      className={`site-footer overflow-hidden bg-(--footer-bg) text-(--footer-text) ${
        flag(site, "footer_show_top_border") ? `border-t ${hairline}` : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 md:px-10 md:pt-24">
        {/* Top row */}
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div className="min-w-0">
            {logo ? (
              <div className="relative h-12 w-40">
                <SmartImage src={logo} alt={brand ?? "Logo"} sizes="10rem" className="object-contain object-left" />
              </div>
            ) : (
              brand && <p className="font-display text-3xl">{brand}</p>
            )}
            {tagline && (
              <p className="mt-6 max-w-xl font-display text-3xl leading-tight text-balance md:text-4xl">
                {taglineLead}
                {taglineLead && taglineAccent && " "}
                {taglineAccent && <em className="text-(--footer-accent)">{taglineAccent}</em>}
              </p>
            )}
            {description && <p className="mt-5 max-w-lg leading-relaxed opacity-60">{description}</p>}
          </div>

          {(email || availability) && (
            <div className="flex min-w-0 flex-col items-start gap-6 md:items-end md:text-right">
              {email && (
                <div className="max-w-full min-w-0">
                  <p className="mb-3 font-mono text-[0.72rem] tracking-[0.22em] uppercase opacity-60">{emailLabel}</p>
                  <a
                    href={`mailto:${email}`}
                    className="block font-display text-3xl break-all transition-colors hover:text-(--footer-accent) sm:text-4xl md:text-5xl"
                  >
                    {email}
                  </a>
                </div>
              )}
              {availability && (
                <span className="inline-flex items-center gap-2.5 rounded-full border border-[color-mix(in_srgb,var(--footer-text)_15%,transparent)] px-4 py-1.5 text-sm">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    {available && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${available ? "bg-emerald-400" : "bg-current opacity-40"}`}
                    />
                  </span>
                  {availability}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Middle row */}
        {(navigation.length > 0 || social.length > 0) && (
          <div className={`mt-16 flex flex-col gap-8 border-t ${hairline} pt-8 md:flex-row md:items-center md:justify-between`}>
            {navigation.length > 0 && (
              <nav aria-label="Footer">
                <ul className="flex flex-wrap gap-x-7 gap-y-3">
                  {navigation.map((l) => (
                    <li key={l.id}>
                      <FooterLink link={l} className={`text-sm ${linkClass}`} />
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {social.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {social.map((l) => {
                  const Icon = (l.icon && SOCIAL_ICONS[l.icon.toLowerCase()]) || LinkIcon;
                  return (
                    <li key={l.id}>
                      <a
                        href={l.href}
                        aria-label={l.label}
                        title={l.label}
                        {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--footer-text)_15%,transparent)] transition hover:border-(--footer-accent) hover:text-(--footer-accent)"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Large brand text */}
        {showLargeBrand && (
          <p
            aria-hidden
            className="mt-14 truncate text-center font-display text-[clamp(3.5rem,17vw,15rem)] leading-[0.9] tracking-tight text-[color-mix(in_srgb,var(--footer-text)_7%,transparent)] select-none"
          >
            {brand}
          </p>
        )}

        {/* Bottom row */}
        <div className={`mt-10 flex flex-col gap-5 border-t ${hairline} pt-6 text-sm md:flex-row md:items-center md:justify-between`}>
          {copyright && <p className="opacity-60">{copyright}</p>}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legal.map((l) => (
              <FooterLink key={l.id} link={l} className={linkClass} />
            ))}
            {backToTop && <BackToTop label={backToTop} />}
          </div>
        </div>
      </div>
    </footer>
  );
}
