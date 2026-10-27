"use client";

import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { scrollBehavior, scrollToHash } from "@/lib/scroll";

/** "#…" links smooth-scroll on this page, or jump to that section on the home page. */
export function FooterNavLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const next = scrollToHash(href);
    if (next) router.push(next);
  }

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
      className="group inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase opacity-70 transition hover:text-(--footer-accent) hover:opacity-100"
    >
      {label}
      <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
    </button>
  );
}
