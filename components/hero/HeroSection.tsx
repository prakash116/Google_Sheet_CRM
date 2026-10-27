import type { CSSProperties, ReactNode } from "react";

import { getHeroSlides, getSiteContent } from "@/lib/portfolio/api";
import { bool, num, text } from "@/lib/portfolio/content";
import type { SiteContent } from "@/lib/portfolio/types";

import HeroCarousel, { type HeroCarouselSettings } from "./HeroCarousel";

const SIZE = /^\d+(\.\d+)?(px|vh|svh|dvh|%)$/;
const WIDTH = /^\d+(\.\d+)?(px|%)$/;

/** Booleans default to `fallback` when the key is missing from the sheet. */
function flag(site: SiteContent | null, key: string, fallback = true): boolean {
  return site?.[key] === undefined || site?.[key] === null ? fallback : bool(site, key);
}

function size(site: SiteContent | null, key: string, fallback: string, mobile = false): string {
  const value = text(site, key);
  const valid = value && SIZE.test(value) ? value : fallback;
  // svh on mobile avoids jumps when the browser bar shows/hides.
  return mobile ? valid.replace(/(?<![sd])vh$/, "svh") : valid;
}

/**
 * Carousel hero driven by the HeroSlides sheet. Renders `fallback` (the static hero)
 * when the carousel is disabled, has no slides, or the API fails.
 */
export default async function HeroSection({ fallback, personFallbackUrl }: { fallback: ReactNode; personFallbackUrl: string | null }) {
  const [site, slides] = await Promise.all([
    getSiteContent().catch(() => null),
    getHeroSlides().catch((err) => {
      console.error("[portfolio] getHeroSlides failed:", err instanceof Error ? err.message : err);
      return null;
    }),
  ]);

  if (!flag(site, "hero_carousel_enabled") || !slides?.length) return fallback;

  const settings: HeroCarouselSettings = {
    autoplay: flag(site, "hero_carousel_autoplay"),
    delay: num(site, "hero_carousel_autoplay_delay") ?? 5000,
    pauseOnHover: flag(site, "hero_carousel_pause_on_hover"),
    loop: flag(site, "hero_carousel_loop"),
    showNavigation: flag(site, "hero_carousel_show_navigation"),
    showPagination: flag(site, "hero_carousel_show_pagination"),
    showPerson: {
      desktop: flag(site, "hero_desktop_show_person_image"),
      tablet: flag(site, "hero_tablet_show_person_image"),
      mobile: flag(site, "hero_mobile_show_person_image"),
    },
    showThree: {
      desktop: flag(site, "hero_desktop_show_three_background"),
      tablet: flag(site, "hero_tablet_show_three_background"),
      mobile: flag(site, "hero_mobile_show_three_background"),
    },
    mobilePersonPosition: text(site, "hero_mobile_person_image_position") ?? "bottom-right",
    mobilePersonWidth: (() => {
      const w = text(site, "hero_mobile_person_image_width");
      return w && WIDTH.test(w) ? w : "65%";
    })(),
    mobileParticleCount: num(site, "hero_mobile_particle_count"),
    personFallbackUrl,
  };

  const heightStyle = {
    "--hero-h-d": size(site, "hero_desktop_height", "100vh"),
    "--hero-mh-d": size(site, "hero_desktop_min_height", "650px"),
    "--hero-h-t": size(site, "hero_tablet_height", "100vh"),
    "--hero-mh-t": size(site, "hero_tablet_min_height", "650px"),
    "--hero-h-m": size(site, "hero_mobile_height", "100svh", true),
    "--hero-mh-m": size(site, "hero_mobile_min_height", "650px", true),
  } as CSSProperties;

  return <HeroCarousel slides={slides} settings={settings} heightStyle={heightStyle} />;
}
