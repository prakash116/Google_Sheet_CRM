import { formatPrice, getPackages, getSiteContent } from "@/lib/portfolio/api";
import { text } from "@/lib/portfolio/content";
import type { SiteContent } from "@/lib/portfolio/types";

import PackageCta from "./PackageCta";
import Reveal, { SectionHeading } from "./Reveal";

const TERMS = [
  { key: "pricing_taxes_included", yes: "GST included", no: "GST extra" },
  { key: "pricing_travel_included", yes: "Travel & props included", no: "Travel & props extra" },
  { key: "pricing_raw_footage_included", yes: "Raw footage included", no: "Raw footage not included" },
  { key: "pricing_ad_budget_included", yes: "Ad spend included", no: "Ad spend not included" },
] as const;

function terms(site: SiteContent | null) {
  const chips = TERMS.flatMap(({ key, yes, no }) => {
    const value = site?.[key];
    return typeof value === "boolean" ? [{ label: value ? yes : no, included: value }] : [];
  });
  const notes = (text(site, "pricing_notes") ?? "")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
  return { chips, notes };
}

export default async function PackagesSection() {
  const [packages, site] = await Promise.all([
    getPackages().catch(() => null),
    getSiteContent().catch(() => null),
  ]);
  if (!packages?.length) return null;

  const currency = text(site, "currency_code");
  const { chips, notes } = terms(site);

  return (
    <section id="packages" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <SectionHeading eyebrow="Packages" title="Pricing" />
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {packages.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className={`h-full ${p.featured ? "order-first lg:order-none" : ""}`}>
              <article
                className={`relative flex h-full flex-col rounded-3xl border p-8 transition ${
                  p.featured
                    ? "border-accent/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_60%)] shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--accent)_35%,transparent)] lg:-translate-y-3"
                    : "border-line bg-surface"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 font-mono text-[0.65rem] tracking-[0.2em] text-accent-ink uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-3xl">
                  {p.name}
                  {p.featured && <span className="sr-only"> (featured package)</span>}
                </h3>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className={p.price === null ? "font-display text-3xl" : "text-4xl font-semibold tracking-tight"}>
                    {formatPrice(p.price, currency)}
                  </span>
                  {p.price !== null && p.billingPeriod && (
                    <span className="text-sm text-muted">/ {p.billingPeriod.toLowerCase()}</span>
                  )}
                </p>
                {p.description && <p className="mt-4 leading-relaxed text-muted whitespace-pre-line">{p.description}</p>}
                {p.features.length > 0 && (
                  <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex gap-3">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M3 8.5l3.2 3L13 4.5" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-2">
                  <PackageCta id={p.id} label={p.ctaText || "Get Started"} featured={p.featured} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {(chips.length > 0 || notes.length > 0) && (
          <Reveal className="mt-12 rounded-2xl border border-line p-6 md:p-8">
            <h3 className="eyebrow mb-4">Terms</h3>
            {chips.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <li
                    key={c.label}
                    className={`rounded-full border px-3.5 py-1.5 text-xs ${
                      c.included ? "border-accent/50 text-accent" : "border-line text-muted"
                    }`}
                  >
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
            {notes.length > 0 && (
              <ul className={`list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-accent/60 ${chips.length ? "mt-5" : ""}`}>
                {notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
