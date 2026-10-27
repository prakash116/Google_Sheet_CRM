// Server-safe: imported by app/layout.tsx. Keep in sync with lib/theme.ts.

export const THEME_STORAGE_KEY = "theme";

/**
 * Runs in <head> before first paint: applies the saved choice, else the system preference,
 * so CSS and the toggle icon are right from the first frame. Static string, no user data.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
