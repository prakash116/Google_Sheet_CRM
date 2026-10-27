// Types for the Google Apps Script content API.

export type ErrorCode =
  | "INVALID_ACTION"
  | "METHOD_NOT_ALLOWED"
  | "INVALID_JSON"
  | "PAYLOAD_TOO_LARGE"
  | "VALIDATION_ERROR"
  | "SUBMISSION_REJECTED"
  | "RATE_LIMITED"
  | "DUPLICATE_SUBMISSION"
  | "BUSY"
  | "FORBIDDEN"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiMeta {
  cached: boolean;
  stale?: boolean;
  generatedAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: FieldError[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type GetAction =
  | "getSiteContent"
  | "getPortfolio"
  | "getServices"
  | "getPackages"
  | "getExperience"
  | "getEducation"
  | "getSkills"
  | "getLinks"
  | "getHeroSlides";

// ---- Site content ----

export type VideoSource = "youtube" | "vimeo" | "file";

export interface VideoValue {
  source: VideoSource;
  url: string;
  embedUrl: string | null;
}

export type ContentScalar = string | number | boolean | null;
export type ContentValue = ContentScalar | VideoValue;

export type KnownContentKey =
  | "site_name"
  | "display_name"
  | "hero_image_url"
  | "resume_url"
  | "location_city"
  | "location_state"
  | "location_country"
  | "availability"
  | "business_email"
  | "phone"
  | "facebook_url"
  | "website_url"
  | "languages"
  | "stats_years_experience"
  | "stats_completed_projects"
  | "stats_happy_clients"
  | "show_statistics"
  | "creator_name"
  | "professional_title"
  | "hero_headline"
  | "hero_description"
  | "profile_image_url"
  | "showreel_url"
  | "about_description"
  | "location"
  | "email"
  | "whatsapp_number"
  | "instagram_url"
  | "youtube_url"
  | "linkedin_url"
  | "seo_title"
  | "seo_description"
  | "currency_code";

/** Any key may be missing or null. */
export type SiteContent = Partial<Record<KnownContentKey, ContentScalar>> & {
  showreel_url?: VideoValue | null;
} & Record<string, ContentValue | undefined>;

// ---- Collections ----

export type MediaType = "image" | "video";
export type MediaSource = "image" | "youtube" | "vimeo" | "file";

export interface PortfolioMedia {
  type: MediaType;
  source: MediaSource;
  url: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  clientName: string | null;
  year: number | null;
  sortOrder: number | null;
  media: PortfolioMedia;
}

export interface Service {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  /** lucide-react icon name in kebab-case, e.g. "clapperboard". */
  icon: string | null;
  imageUrl: string | null;
  features: string[];
  sortOrder: number | null;
}

export interface Package {
  id: string;
  name: string;
  price: number | null;
  billingPeriod: string | null;
  description: string | null;
  features: string[];
  featured: boolean;
  ctaText: string | null;
  sortOrder: number | null;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  logoUrl: string | null;
  employmentType: string | null;
  location: string | null;
  responsibilities: string[];
  sortOrder: number | null;
}

export interface Education {
  id: string;
  qualification: string;
  institution: string | null;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
  sortOrder: number | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  sortOrder: number | null;
}

export interface PortfolioPageData {
  site: SiteContent | null;
  portfolio: PortfolioItem[] | null;
  services: Service[] | null;
  packages: Package[] | null;
  experience: Experience[] | null;
  education: Education[] | null;
  skills: Skill[] | null;
}

export interface SiteLink {
  id: string;
  label: string;
  href: string;
  external: boolean;
  icon: string | null;
  sortOrder: number | null;
}

export interface SiteLinks {
  navigation?: SiteLink[];
  social?: SiteLink[];
  legal?: SiteLink[];
}

export type HeroButtonStyle = "primary" | "outline" | "secondary" | "ghost";

export interface HeroButton {
  text: string;
  href: string;
  style: HeroButtonStyle | string;
  enabled: boolean;
}

export interface HeroPersonImage {
  url: string | null;
  alt: string;
  position: "left" | "right" | "center" | string;
  objectFit: "contain" | "cover" | string;
  transparentBackground: boolean;
  enabled: boolean;
  /** Optional: "viewfinder" | "orbit" | "blob" | "arch" | "tilt". Defaults cycle per slide. */
  frameStyle?: string | null;
}

export interface HeroBackground {
  type: "threejs" | "image" | "color" | "none" | string;
  enabled: boolean;
  preset: "floating-particles" | "flowing-lines" | "geometric-wave" | string | null;
  color: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
  particleCount: number | null;
  particleSize: number | null;
  animationSpeed: number | null;
  mouseInteraction: boolean;
  showGradient: boolean;
  gradientDirection: "radial" | "linear" | "none" | string;
  fallbackImage: string | null;
  fallbackColor: string | null;
}

export interface HeroSlide {
  id: string;
  title: string;
  highlightText: string | null;
  shortDescription: string | null;
  primaryButton: HeroButton | null;
  secondaryButton: HeroButton | null;
  personImage: HeroPersonImage | null;
  background: HeroBackground | null;
  textAlignment: "left" | "center" | "right" | string;
  overlayOpacity: number | null;
  sortOrder: number | null;
}

// ---- Inquiry ----

export interface InquiryData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  package?: string;
  budget?: string;
  message: string;
  website: string;
}

export interface InquiryRequest {
  action: "submitInquiry";
  data: InquiryData;
  meta: { elapsedMs: number; clientKey?: string };
  proxyKey?: string;
}

export interface InquirySuccessData {
  message: string;
}
