import { createHash } from "node:crypto";

import type { NextRequest } from "next/server";

import type { ApiError, ApiResponse, InquiryData, InquiryRequest, InquirySuccessData } from "@/lib/portfolio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 10_000;

const STATUS_BY_CODE: Record<string, number> = {
  VALIDATION_ERROR: 400,
  INVALID_JSON: 400,
  SUBMISSION_REJECTED: 400,
  PAYLOAD_TOO_LARGE: 413,
  DUPLICATE_SUBMISSION: 409,
  RATE_LIMITED: 429,
  BUSY: 503,
  SERVICE_UNAVAILABLE: 503,
};

// Server-side diagnostics only — never pass form contents here.
const log = (msg: string) => console.info(`[inquiry] ${msg}`);

function errorResponse(status: number, code: string, message: string, details?: ApiError["error"]["details"]) {
  const body: ApiError = { success: false, error: { code, message, ...(details ? { details } : {}) } };
  return Response.json(body, { status });
}

function isOriginAllowed(origin: string, request: NextRequest): boolean {
  const configured = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (configured.includes(origin)) return true;
  if (origin === request.nextUrl.origin) return true;
  return process.env.NODE_ENV === "development" && origin.startsWith("http://localhost");
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

/** Whitelist: only these fields are ever forwarded. */
function pickInquiry(input: Record<string, unknown>): InquiryData {
  const data: InquiryData = {
    name: str(input.name) ?? "",
    email: str(input.email) ?? "",
    message: str(input.message) ?? "",
    website: str(input.website) ?? "",
  };
  for (const key of ["phone", "company", "service", "package", "budget"] as const) {
    const value = str(input[key]);
    if (value) data[key] = value;
  }
  return data;
}

function clientKey(request: Request): string | undefined {
  const salt = process.env.INQUIRY_CLIENT_SALT;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!salt || !ip) return undefined;
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 64);
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.PORTFOLIO_API_URL;
  if (!apiUrl) {
    log("rejected: PORTFOLIO_API_URL is not set");
    return errorResponse(503, "SERVICE_UNAVAILABLE", "Inquiries are temporarily unavailable.");
  }

  const origin = request.headers.get("origin");
  if (!origin || !isOriginAllowed(origin, request)) {
    log(`rejected: origin ${origin ?? "(missing)"} not allowed (own origin ${request.nextUrl.origin})`);
    return errorResponse(403, "FORBIDDEN", "Origin not allowed.");
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    log(`rejected: body too large (${raw.length} chars)`);
    return errorResponse(413, "PAYLOAD_TOO_LARGE", "Your message is too long.");
  }

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    log("rejected: request body is not valid JSON");
    return errorResponse(400, "INVALID_JSON", "Invalid request body.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    log("rejected: request body is not a JSON object");
    return errorResponse(400, "INVALID_JSON", "Invalid request body.");
  }

  const fields = input as Record<string, unknown>;
  const elapsed = Number(fields.elapsedMs);
  const key = clientKey(request);
  const proxyKey = process.env.INQUIRY_PROXY_SECRET || undefined;
  const payload: InquiryRequest = {
    action: "submitInquiry",
    data: pickInquiry(fields),
    meta: { elapsedMs: Number.isFinite(elapsed) && elapsed > 0 ? Math.round(elapsed) : 0, ...(key ? { clientKey: key } : {}) },
    ...(proxyKey ? { proxyKey } : {}),
  };

  let upstream: ApiResponse<InquirySuccessData>;
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    try {
      upstream = JSON.parse(text);
    } catch {
      log(`upstream HTTP ${res.status}: non-JSON response — deployment access must be 'Anyone'`);
      return errorResponse(502, "INTERNAL_ERROR", "Could not submit your inquiry. Please try again later.");
    }
    log(`upstream HTTP ${res.status}: ${upstream?.success ? "success" : upstream?.error?.code ?? "unknown error"}`);
  } catch (err) {
    const name = err instanceof Error ? err.name : "UnknownError";
    log(`upstream fetch failed: ${name}${err instanceof Error ? ` — ${err.message}` : ""}`);
    return errorResponse(503, "SERVICE_UNAVAILABLE", "Could not reach the server. Please try again.");
  }

  if (upstream?.success === true) {
    return Response.json(upstream, { status: 200 });
  }

  const code = upstream?.error?.code ?? "INTERNAL_ERROR";
  return errorResponse(
    STATUS_BY_CODE[code] ?? 502,
    code,
    upstream?.error?.message ?? "Could not submit your inquiry.",
    upstream?.error?.details,
  );
}
