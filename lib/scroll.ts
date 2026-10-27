// Client-side "#…" link handling shared by the hero buttons and footer links.

// Sheet section ids that differ from this site's section ids.
const SECTION_ALIASES: Record<string, string> = { home: "top", portfolio: "work", projects: "work" };

export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * Smooth-scrolls to the section for a "#…" href on the current page.
 * Returns the home-page URL to navigate to when the section isn't on this page, or null when handled.
 */
export function scrollToHash(href: string): string | null {
  const id = href.slice(1);
  const target = document.getElementById(id) ?? document.getElementById(SECTION_ALIASES[id] ?? "");
  if (target) {
    target.scrollIntoView({ behavior: scrollBehavior() });
    window.history.replaceState(null, "", `#${target.id}`);
    return null;
  }
  return window.location.pathname !== "/" ? `/#${SECTION_ALIASES[id] ?? id}` : null;
}
