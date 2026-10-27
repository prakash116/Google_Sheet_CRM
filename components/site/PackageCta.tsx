"use client";

import { prefillContact } from "./contactPrefill";

/** Scrolls to the contact form and preselects this package. */
export default function PackageCta({ id, label, featured }: { id: string; label: string; featured: boolean }) {
  return (
    <a
      href={`?package=${encodeURIComponent(id)}#contact`}
      onClick={(e) => {
        e.preventDefault();
        prefillContact("package", id);
      }}
      className={`mt-8 block rounded-full px-6 py-3.5 text-center font-medium transition ${
        featured ? "bg-accent text-accent-ink hover:brightness-110" : "border border-line hover:border-fg/40"
      }`}
    >
      {label}
    </a>
  );
}
