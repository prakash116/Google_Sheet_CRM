import "server-only";

import type {
  ApiResponse,
  Education,
  Experience,
  GetAction,
  HeroSlide,
  Package,
  PortfolioItem,
  PortfolioPageData,
  Service,
  SiteContent,
  SiteLinks,
  Skill,
} from "./types";

const REVALIDATE_SECONDS = 300;
export const PORTFOLIO_CACHE_TAG = "portfolio-content";

function apiUrl(): string {
  const url = process.env.PORTFOLIO_API_URL;
  if (!url) throw new Error("PORTFOLIO_API_URL is not set");
  return url;
}

export async function getAction<T>(action: GetAction): Promise<T> {
  const url = new URL(apiUrl());
  url.searchParams.set("action", action);

  const res = await fetch(url, {
    redirect: "follow",
    next: { revalidate: REVALIDATE_SECONDS, tags: [PORTFOLIO_CACHE_TAG] },
    signal: AbortSignal.timeout(15000),
  });

  const text = await res.text();
  let body: ApiResponse<T>;
  try {
    body = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(
      `[${action}] Apps Script returned non-JSON — deployment access must be 'Anyone' (HTTP ${res.status})`,
    );
  }

  if (!body.success) {
    throw new Error(`[${action}] ${body.error.code}: ${body.error.message}`);
  }
  return body.data;
}

export const getSiteContent = () => getAction<SiteContent>("getSiteContent");
export const getPortfolio = () => getAction<PortfolioItem[]>("getPortfolio");
export const getServices = () => getAction<Service[]>("getServices");
export const getPackages = () => getAction<Package[]>("getPackages");
export const getExperience = () => getAction<Experience[]>("getExperience");
export const getEducation = () => getAction<Education[]>("getEducation");
export const getSkills = () => getAction<Skill[]>("getSkills");
export const getLinks = () => getAction<SiteLinks>("getLinks");
export const getHeroSlides = () => getAction<HeroSlide[]>("getHeroSlides");

async function settle<T>(label: string, promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (err) {
    console.error(`[portfolio] ${label} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Loads every section; a failing section becomes null instead of breaking the page. */
export async function getPortfolioPageData(): Promise<PortfolioPageData> {
  const [site, portfolio, services, packages, experience, education, skills] = await Promise.all([
    settle("getSiteContent", getSiteContent()),
    settle("getPortfolio", getPortfolio()),
    settle("getServices", getServices()),
    settle("getPackages", getPackages()),
    settle("getExperience", getExperience()),
    settle("getEducation", getEducation()),
    settle("getSkills", getSkills()),
  ]);
  return { site, portfolio, services, packages, experience, education, skills };
}

export function formatPrice(price: number | null, currency?: string | null): string {
  if (price === null || price === undefined) return "Request a Quote";
  const code = currency || "INR";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    // Invalid currency code in the sheet — fall back to INR rather than crash.
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }
}
