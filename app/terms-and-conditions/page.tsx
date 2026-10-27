import type { Metadata } from "next";

import LegalPage from "@/components/site/LegalPage";

export const revalidate = 300;

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return <LegalPage title="Terms &" accent="Conditions" />;
}
