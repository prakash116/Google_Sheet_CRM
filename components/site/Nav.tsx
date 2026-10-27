"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import ThemeToggle from "./ThemeToggle";

export interface NavLink {
  href: string;
  label: string;
}

/** `home` prefixes the brand/contact links, e.g. "/" on pages other than the home page. */
export default function Nav({ brand, links, home = "" }: { brand: string; links: NavLink[]; home?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10">
        <a href={`${home}#top`} className="font-display text-2xl tracking-tight">
          {brand}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
          <li>
            <a
              href={`${home}#contact`}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition hover:brightness-110"
            >
              Let&apos;s talk
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
        <button
          type="button"
          className="relative h-10 w-10"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute left-2 right-2 h-px bg-fg transition ${open ? "top-5 rotate-45" : "top-4"}`} />
          <span className={`absolute left-2 right-2 h-px bg-fg transition ${open ? "top-5 -rotate-45" : "top-6"}`} />
        </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-5 md:hidden"
          >
            {[...links, { href: `${home}#contact`, label: "Contact" }].map((l) => (
              <li key={l.href} className="border-t border-line">
                <a href={l.href} onClick={() => setOpen(false)} className="block py-4 font-display text-2xl">
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
