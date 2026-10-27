"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import SmartImage from "@/components/media/SmartImage";
import type { HeroButton, HeroSlide } from "@/lib/portfolio/types";
import { scrollToHash } from "@/lib/scroll";
import { useTheme } from "@/lib/theme";

import { useBreakpoint, usePageVisible, useWebGL, type Breakpoint } from "./hooks";
import type { SceneConfig } from "./HeroScene";
import PortraitFrame, { frameStyleFor } from "./PortraitFrame";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

const ease = [0.22, 1, 0.36, 1] as const;

export interface HeroCarouselSettings {
  autoplay: boolean;
  delay: number;
  pauseOnHover: boolean;
  loop: boolean;
  showNavigation: boolean;
  showPagination: boolean;
  showPerson: Record<Breakpoint, boolean>;
  showThree: Record<Breakpoint, boolean>;
  mobilePersonPosition: string;
  mobilePersonWidth: string;
  mobileParticleCount: number | null;
  /** Used when a slide's person image is enabled but has no URL. */
  personFallbackUrl: string | null;
}

const BUTTON_STYLES: Record<string, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  outline: "border border-fg/25 hover:border-fg/60",
  secondary: "bg-surface-2 text-fg hover:bg-surface",
  ghost: "text-fg/80 underline-offset-4 hover:text-fg hover:underline",
};

const HEX = /^#[0-9a-f]{6}$/i;
const hex = (v: string | null | undefined, fallback: string) => (v && HEX.test(v) ? v : fallback);

/** Splits the title on the first occurrence of the highlight text. */
function splitTitle(title: string, highlight: string | null): [string, string | null, string] {
  const i = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || i < 0) return [title, null, ""];
  return [title.slice(0, i), highlight, title.slice(i + highlight.length)];
}

function safeButtonHref(href: string) {
  if (href.startsWith("#") || href.startsWith("https://")) return href;
  return href.startsWith("/") && !href.startsWith("//") ? href : null;
}

function SlideButton({ button }: { button: HeroButton | null }) {
  const router = useRouter();
  if (!button?.enabled || !button.text) return null;
  const href = safeButtonHref(button.href ?? "");
  if (!href) return null;

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!href!.startsWith("#")) return;
    e.preventDefault();
    const next = scrollToHash(href!);
    if (next) router.push(next);
  }

  const external = href.startsWith("https://");
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap transition sm:px-7 sm:py-3.5 sm:text-base ${BUTTON_STYLES[button.style] ?? BUTTON_STYLES.primary}`}
    >
      {button.text}
    </a>
  );
}

/** Mobile person-image placement, e.g. "bottom-right" → bottom-0 right-0. */
function mobilePlacement(position: string) {
  const p = position.toLowerCase();
  const vertical = p.includes("top") ? "top-16" : "bottom-0";
  const horizontal = p.includes("left") ? "left-0" : p.includes("center") ? "left-1/2 -translate-x-1/2" : "right-0";
  return `${vertical} ${horizontal}`;
}

const DESKTOP_PLACEMENT: Record<string, string> = {
  left: "left-[3%]",
  center: "left-1/2 -translate-x-1/2",
  right: "right-[3%]",
};

function SlideBackground({
  slide,
  settings,
  breakpoint,
  mountScene,
  running,
}: {
  slide: HeroSlide;
  settings: HeroCarouselSettings;
  breakpoint: Breakpoint;
  mountScene: boolean;
  running: boolean;
}) {
  const bg = slide.background;
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const light = useTheme() === "light";
  // Sheet colours are tuned for dark; light theme uses the site palette so the scene stays visible.
  const accent = light ? "#c8792c" : hex(bg?.accentColor, "#c8792c");
  const useThree =
    !!bg && bg.type === "threejs" && bg.enabled && settings.showThree[breakpoint] && webgl && !reduced;
  const fallbackImage = bg?.fallbackImage?.startsWith("https://") ? bg.fallbackImage : null;
  const baseColor = light ? "var(--ink)" : hex(bg?.fallbackColor, hex(bg?.color, "var(--ink)"));
  const showImage = !useThree && bg?.type !== "color" && bg?.type !== "none" && fallbackImage;

  const config: SceneConfig = {
    preset: bg?.preset ?? "floating-particles",
    accent,
    secondary: light ? "#5b4632" : hex(bg?.secondaryColor, accent),
    count: Math.max(10, Math.min(2000, (breakpoint === "mobile" ? settings.mobileParticleCount : null) ?? bg?.particleCount ?? 120)),
    size: Math.max(0.3, Math.min(6, bg?.particleSize ?? 1.5)) * (breakpoint === "mobile" ? 0.6 : 1),
    speed: Math.max(0.05, Math.min(3, bg?.animationSpeed ?? 0.6)),
    mouse: !!bg?.mouseInteraction,
    light,
    compact: breakpoint === "mobile",
  };

  const gradient =
    bg?.showGradient && bg.gradientDirection !== "none"
      ? bg.gradientDirection === "linear"
        ? `linear-gradient(120deg, color-mix(in srgb, ${accent} 15%, transparent), transparent 60%)`
        : `radial-gradient(ellipse at 70% 40%, color-mix(in srgb, ${accent} 15%, transparent), transparent 65%)`
      : null;

  return (
    <div className="absolute inset-0" style={{ backgroundColor: baseColor }} aria-hidden>
      {showImage && <SmartImage src={fallbackImage} alt="" sizes="100vw" />}
      {useThree && mountScene && (
        <div className="absolute inset-0">
          <HeroScene config={config} running={running} />
        </div>
      )}
      {gradient && <div className="absolute inset-0" style={{ background: gradient }} />}
      <div
        className={`absolute inset-0 ${light ? "bg-ink" : "bg-black"}`}
        style={{ opacity: Math.max(0, Math.min(1, slide.overlayOpacity ?? 0)) * (light ? 0.6 : 1) }}
      />
      {/* keeps text legible on the left/center whatever the background */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--ink)_0%,transparent_70%)] opacity-60" />
    </div>
  );
}

type SlidePhoto = { url: string; alt: string; framed: boolean };

// Only these formats can actually have a transparent background; anything else gets a frame.
const ALPHA_FORMAT = /\.(png|webp|avif|svg)(\?|$)/i;

/**
 * The slide's own person image when enabled with an https URL; otherwise the site's profile photo
 * (sheet profile/hero image or public/images/profile.*) shown in a framed portrait.
 */
function slidePhoto(slide: HeroSlide, settings: HeroCarouselSettings, breakpoint: Breakpoint): SlidePhoto | null {
  if (!settings.showPerson[breakpoint]) return null;
  const person = slide.personImage;
  if (person?.enabled && person.url?.startsWith("https://")) {
    return { url: person.url, alt: person.alt || "", framed: !(person.transparentBackground && ALPHA_FORMAT.test(person.url)) };
  }
  if (person?.url || !settings.personFallbackUrl) return null;
  return { url: settings.personFallbackUrl, alt: person?.alt || "Portrait", framed: true };
}

function PersonImage({
  slide,
  settings,
  breakpoint,
  priority,
  active,
  index,
}: {
  slide: HeroSlide;
  settings: HeroCarouselSettings;
  breakpoint: Breakpoint;
  priority: boolean;
  active: boolean;
  index: number;
}) {
  const photo = slidePhoto(slide, settings, breakpoint);
  if (!photo) return null;
  if (photo.framed) {
    if (breakpoint === "mobile") return null; // rendered inline above the heading, see SlideContent
    return (
      <PortraitFrame
        frame={frameStyleFor(slide.personImage?.frameStyle, index)}
        src={photo.url}
        alt={photo.alt}
        variant="side"
        priority={priority}
        active={active}
      />
    );
  }

  const person = slide.personImage!;
  const url = photo.url;
  const fit = person.objectFit === "cover" ? "object-cover" : "object-contain";
  const placement =
    breakpoint === "mobile"
      ? `${mobilePlacement(settings.mobilePersonPosition)} h-[60%] opacity-40`
      : `bottom-0 h-[85%] w-[42%] ${DESKTOP_PLACEMENT[person.position] ?? DESKTOP_PLACEMENT.right}`;

  return (
    <div
      className={`pointer-events-none absolute z-5 ${placement}`}
      style={breakpoint === "mobile" ? { width: settings.mobilePersonWidth } : undefined}
    >
      <SmartImage
        src={url}
        alt={person.alt || ""}
        sizes={breakpoint === "mobile" ? settings.mobilePersonWidth.replace("%", "vw") : "42vw"}
        priority={priority}
        className={`${fit} object-bottom`}
      />
    </div>
  );
}

/** Phone layout: the framed photo sits in the text column above the heading. */
function InlinePhoto({
  slide,
  settings,
  breakpoint,
  index,
  active,
}: {
  slide: HeroSlide;
  settings: HeroCarouselSettings;
  breakpoint: Breakpoint;
  index: number;
  active: boolean;
}) {
  const photo = breakpoint === "mobile" ? slidePhoto(slide, settings, breakpoint) : null;
  if (!photo?.framed) return null;
  return (
    <PortraitFrame
      frame={frameStyleFor(slide.personImage?.frameStyle, index)}
      src={photo.url}
      alt={photo.alt}
      variant="inline"
      priority={index === 0}
      active={active}
    />
  );
}

// Phones always centre the photo, text and buttons; tablet/desktop follow the slide's textAlignment.
const ALIGN: Record<string, string> = {
  left: "items-center text-center mx-auto md:mx-0 md:items-start md:text-left",
  center: "items-center text-center mx-auto",
  right: "items-center text-center mx-auto md:mx-0 md:ml-auto md:items-end md:text-right",
};

const JUSTIFY: Record<string, string> = {
  left: "justify-center md:justify-start",
  center: "justify-center",
  right: "justify-center md:justify-end",
};

function SlideContent({
  slide,
  index,
  active,
  withPhoto,
  inlinePhoto,
}: {
  slide: HeroSlide;
  index: number;
  active: boolean;
  /** A photo sits to the right (tablet/desktop): keep the text clear of it. */
  withPhoto: boolean;
  /** Phone layout: framed photo shown above the heading. */
  inlinePhoto: ReactNode;
}) {
  const [before, highlight, after] = splitTitle(slide.title, slide.highlightText);
  const Heading = index === 0 ? "h1" : "h2";
  const align = ALIGN[slide.textAlignment] ?? ALIGN.left;
  const justify = JUSTIFY[slide.textAlignment] ?? JUSTIFY.left;
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: active ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.8, delay: active ? delay : 0, ease },
  });

  return (
    <div className="relative z-10 mx-auto flex min-h-[max(var(--hero-h-m),var(--hero-mh-m))] w-full max-w-7xl items-center px-5 pt-24 pb-32 sm:px-8 md:h-full md:min-h-0 md:px-10 md:pt-16 md:pb-28">
      <div className={`flex w-full flex-col ${withPhoto ? "max-w-3xl md:max-w-[56%] lg:max-w-[58%]" : "max-w-3xl"} ${align}`}>
        {inlinePhoto}
        <motion.div {...show(0.05)}>
          <Heading className="font-display text-[2.5rem] leading-[1.02] tracking-tight text-balance min-[400px]:text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl">
            {before}
            {highlight && <em className="text-accent">{highlight}</em>}
            {after}
          </Heading>
        </motion.div>
        {slide.shortDescription && (
          <motion.p {...show(0.2)} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:mt-6 sm:text-lg md:mt-8">
            {slide.shortDescription}
          </motion.p>
        )}
        <motion.div {...show(0.35)} className={`mt-8 flex flex-wrap items-center gap-3 sm:gap-4 md:mt-10 ${justify}`}>
          <SlideButton button={slide.primaryButton} />
          <SlideButton button={slide.secondaryButton} />
        </motion.div>
      </div>
    </div>
  );
}

export default function HeroCarousel({
  slides,
  settings,
  heightStyle,
}: {
  slides: HeroSlide[];
  settings: HeroCarouselSettings;
  heightStyle: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const breakpoint = useBreakpoint();
  const pageVisible = usePageVisible();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: settings.loop && slides.length > 1, duration: 32 });
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(settings.autoplay);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const paused = !playing || reduced || !pageVisible || (settings.pauseOnHover && (hovered || focused));
  useEffect(() => {
    if (!emblaApi || paused || total < 2) return;
    const id = window.setInterval(() => {
      if (!settings.loop && !emblaApi.canScrollNext()) emblaApi.scrollTo(0);
      else emblaApi.scrollNext();
    }, Math.max(2000, settings.delay));
    return () => window.clearInterval(id);
  }, [emblaApi, paused, total, settings.delay, settings.loop, selected]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  function onBlur(e: FocusEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  }

  const showAutoplayToggle = settings.autoplay && !reduced && total > 1;

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Highlights"
      style={heightStyle}
      className="relative overflow-hidden md:h-(--hero-h-t) md:min-h-(--hero-mh-t) lg:h-(--hero-h-d) lg:min-h-(--hero-mh-d)"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <div ref={emblaRef} className="overflow-hidden md:h-full">
        <div className="flex md:h-full" aria-live={paused ? "polite" : "off"}>
          {slides.map((slide, i) => {
            const active = i === selected;
            // Mount WebGL only for the active slide and the one after it.
            const mountScene = active || i === (selected + 1) % total;
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}`}
                inert={!active}
                className="relative min-w-0 flex-[0_0_100%] md:h-full"
              >
                <SlideBackground
                  slide={slide}
                  settings={settings}
                  breakpoint={breakpoint}
                  mountScene={mountScene}
                  running={active && pageVisible}
                />
                <PersonImage slide={slide} settings={settings} breakpoint={breakpoint} priority={i === 0} active={active} index={i} />
                <SlideContent
                  slide={slide}
                  index={i}
                  active={active}
                  withPhoto={breakpoint !== "mobile" && !!slidePhoto(slide, settings, breakpoint)}
                  inlinePhoto={<InlinePhoto slide={slide} settings={settings} breakpoint={breakpoint} index={i} active={active} />}
                />
              </div>
            );
          })}
        </div>
      </div>

      {total > 1 && (settings.showPagination || settings.showNavigation || showAutoplayToggle) && (
        <div className="absolute inset-x-0 bottom-8 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
            {settings.showPagination ? (
              <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={`Go to slide ${i + 1} of ${total}`}
                    aria-current={i === selected ? "true" : undefined}
                    className="group flex h-6 items-center"
                  >
                    <span
                      className={`block h-0.75 rounded-full transition-all duration-500 ${
                        i === selected ? "w-10 bg-accent" : "w-5 bg-fg/25 group-hover:bg-fg/50"
                      }`}
                    />
                  </button>
                ))}
                <span className="eyebrow ml-3 hidden sm:inline">
                  {String(selected + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              {showAutoplayToggle && (
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-ink/40 backdrop-blur transition hover:border-fg/40"
                >
                  {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                </button>
              )}
              {settings.showNavigation && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous slide"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-ink/40 backdrop-blur transition hover:border-accent hover:text-accent"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next slide"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-ink/40 backdrop-blur transition hover:border-accent hover:text-accent"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
