// Shared by the pricing/service CTAs and the contact form.

export const PREFILL_EVENT = "portfolio:prefill-contact";

export type PrefillField = "package" | "service";

export interface PrefillDetail {
  field: PrefillField;
  value: string;
}

/** Sets ?<field>=<value>, tells the contact form to preselect it, and scrolls to #contact. */
export function prefillContact(field: PrefillField, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(field, value);
  url.hash = "contact";
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail: { field, value } }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}
