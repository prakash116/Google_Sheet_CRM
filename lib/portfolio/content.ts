// Safe readers and formatters for API values. No server-only import: shared with client components.

import type { SiteContent, VideoValue } from "./types";

export function text(site: SiteContent | null, key: string): string | null {
  const value = site?.[key];
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  return null;
}

export function bool(site: SiteContent | null, key: string): boolean {
  const value = site?.[key];
  return value === true || value === "true" || value === "TRUE";
}

export function num(site: SiteContent | null, key: string): number | null {
  const value = site?.[key];
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

/** "Hindi, English" → ["Hindi", "English"]. */
export function list(site: SiteContent | null, key: string): string[] {
  return (text(site, key) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "City, State, Country" from the parts, falling back to the single `location` key. */
export function locationOf(site: SiteContent | null): string | null {
  const parts = ["location_city", "location_state", "location_country"].map((k) => text(site, k)).filter(Boolean);
  return parts.length ? parts.join(", ") : text(site, "location");
}

export function yearRange(start: number | null, end: number | null): string {
  if (start && end) return start === end ? String(start) : `${start} — ${end}`;
  return String(start ?? end ?? "");
}

export function video(site: SiteContent | null, key: string): VideoValue | null {
  const value = site?.[key];
  if (value && typeof value === "object" && "url" in value) return value;
  return null;
}

/** Only https links are rendered as external links. */
export function httpsUrl(url: string | null | undefined): string | null {
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

/** Link targets allowed in rendered hrefs: in-page "#…", site-relative "/…" (not "//"), or https. */
export function safeHref(href: string | null | undefined): string | null {
  if (typeof href !== "string") return null;
  const h = href.trim();
  if (h.startsWith("#") || h.startsWith("https://")) return h;
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  return null;
}

/** "#RRGGBB" only, so a sheet value can't inject arbitrary CSS. */
export function hexColor(value: string | null): string | null {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

/** Image/video sources: http(s) only, so a sheet value can never become a script URL. */
export function mediaUrl(url: string | null | undefined): string | null {
  return typeof url === "string" && /^https?:\/\//i.test(url) ? url : null;
}

const EMBED_PREFIXES = [
  "https://www.youtube-nocookie.com/embed/",
  "https://player.vimeo.com/video/",
];

export function safeEmbedUrl(url: string | null | undefined): string | null {
  return typeof url === "string" && EMBED_PREFIXES.some((p) => url.startsWith(p)) ? url : null;
}

export function whatsappUrl(number: string | null): string | null {
  const digits = number?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "YYYY" | "YYYY-MM" | "YYYY-MM-DD" → "2021" | "Mar 2021". */
export function formatMonthYear(date: string | null): string | null {
  if (!date) return null;
  const [year, month] = date.split("-");
  const m = Number(month);
  return m >= 1 && m <= 12 ? `${MONTHS[m - 1]} ${year}` : year;
}

export function formatDateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const from = formatMonthYear(start);
  const to = isCurrent ? "Present" : formatMonthYear(end);
  if (from && to) return `${from} — ${to}`;
  return from ?? to ?? "";
}
