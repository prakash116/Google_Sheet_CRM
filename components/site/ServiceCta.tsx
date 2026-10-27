"use client";

import { ArrowRight } from "lucide-react";

import { prefillContact } from "./contactPrefill";

/** Scrolls to the contact form and preselects this service. */
export default function ServiceCta({ title }: { title: string }) {
  return (
    <a
      href={`?service=${encodeURIComponent(title)}#contact`}
      onClick={(e) => {
        e.preventDefault();
        prefillContact("service", title);
      }}
      aria-label={`Get a quote for ${title}`}
      className="group/cta inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.18em] text-accent uppercase"
    >
      Get a quote
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-1" aria-hidden />
    </a>
  );
}
