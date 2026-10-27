"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";

import type { ApiResponse, InquirySuccessData } from "@/lib/portfolio/types";

import { PREFILL_EVENT, type PrefillDetail, type PrefillField } from "./contactPrefill";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const FIELDS = ["name", "email", "phone", "company", "service", "package", "budget", "message"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_MESSAGES: Record<number, string> = {
  429: "Too many submissions, please try later",
  409: "We already received this inquiry",
};

/** Client-side checks; the server validates again. */
function validate(v: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = "Name is required.";
  else if (v.name.length > 100) errors.name = "Name must be 100 characters or fewer.";
  if (!EMAIL_RE.test(v.email ?? "")) errors.email = "Please provide a valid email address.";
  if (!v.message) errors.message = "Message is required.";
  else if (v.message.length < 10) errors.message = "Message must be at least 10 characters.";
  else if (v.message.length > 3000) errors.message = "Message must be 3000 characters or fewer.";
  if ((v.budget ?? "").length > 60) errors.budget = "Budget must be 60 characters or fewer.";
  return errors;
}

export default function ContactForm({
  services,
  packages,
}: {
  services: string[];
  packages: { id: string; name: string }[];
}) {
  const mountedAt = useRef(0);
  const sending = useRef(false);
  const packageRef = useRef<HTMLSelectElement>(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    mountedAt.current = Date.now();
    const select = (field: PrefillField, value: string | null) => {
      if (!value) return;
      if (field === "package" && packageRef.current && packages.some((p) => p.id === value)) packageRef.current.value = value;
      if (field === "service" && serviceRef.current && services.includes(value)) serviceRef.current.value = value;
    };
    const params = new URLSearchParams(window.location.search);
    select("package", params.get("package"));
    select("service", params.get("service"));
    const onPrefill = (e: Event) => {
      const { field, value } = (e as CustomEvent<PrefillDetail>).detail;
      select(field, value);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, [packages, services]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const values: Record<string, string> = {};
    for (const key of FIELDS) {
      const value = formData.get(key);
      values[key] = typeof value === "string" ? value.trim() : "";
    }

    const clientErrors = validate(values);
    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      setStatus({ state: "error", message: "Please fix the highlighted fields." });
      return;
    }

    sending.current = true;
    setStatus({ state: "submitting" });
    setFieldErrors({});

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: String(formData.get("website") ?? "").trim(),
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      const json = (await res.json().catch(() => null)) as ApiResponse<InquirySuccessData> | null;
      if (!json) {
        setStatus({ state: "error", message: STATUS_MESSAGES[res.status] ?? `Could not submit your inquiry (HTTP ${res.status}).` });
        return;
      }

      if (json.success) {
        form.reset();
        setStatus({ state: "success", message: json.data.message });
        return;
      }

      const errors: Record<string, string> = {};
      for (const d of json.error.details ?? []) {
        const field = d.field.split(".").pop() ?? d.field;
        errors[field] ??= d.message;
      }
      setFieldErrors(errors);
      setStatus({ state: "error", message: json.error.message || STATUS_MESSAGES[res.status] || "Could not submit your inquiry." });
    } catch {
      setStatus({ state: "error", message: "Something went wrong. Please check your connection and try again." });
    } finally {
      sending.current = false;
    }
  }

  if (status.state === "success") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-64 flex-col items-center justify-center gap-4 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5l3.2 3L13 4.5" />
          </svg>
        </span>
        <p className="font-display text-3xl">{status.message}</p>
      </motion.div>
    );
  }

  const err = (name: string) =>
    fieldErrors[name] ? (
      <p id={`${name}-error`} role="alert" className="mt-1.5 text-sm text-accent">
        {fieldErrors[name]}
      </p>
    ) : null;

  const aria = (name: string) => ({
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
  });

  const submitting = status.state === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div>
        <label htmlFor="name" className="eyebrow mb-2 block">Name *</label>
        <input id="name" name="name" required maxLength={100} autoComplete="name" className="field" {...aria("name")} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="email" className="eyebrow mb-2 block">Email *</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" {...aria("email")} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="phone" className="eyebrow mb-2 block">Phone</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" {...aria("phone")} />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="company" className="eyebrow mb-2 block">Company</label>
        <input id="company" name="company" maxLength={120} autoComplete="organization" className="field" {...aria("company")} />
        {err("company")}
      </div>

      {services.length > 0 && (
        <div>
          <label htmlFor="service" className="eyebrow mb-2 block">Service</label>
          <select id="service" name="service" ref={serviceRef} defaultValue="" className="field" {...aria("service")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {err("service")}
        </div>
      )}
      {packages.length > 0 && (
        <div>
          <label htmlFor="package" className="eyebrow mb-2 block">Package</label>
          <select id="package" name="package" ref={packageRef} defaultValue="" className="field" {...aria("package")}>
            <option value="">Select a package</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {err("package")}
        </div>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="budget" className="eyebrow mb-2 block">Budget</label>
        <input id="budget" name="budget" maxLength={60} className="field" {...aria("budget")} />
        {err("budget")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="eyebrow mb-2 block">Message *</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          className="field resize-y"
          {...aria("message")}
        />
        {err("message")}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2">
        <AnimatePresence mode="wait">
          {status.state === "error" && (
            <motion.p
              key={status.message}
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-accent"
            >
              {status.message}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="self-start rounded-full bg-accent px-8 py-3.5 font-medium text-accent-ink transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
