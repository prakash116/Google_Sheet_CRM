import type { Metadata } from "next";

import LegalPage from "@/components/site/LegalPage";

export const revalidate = 300;

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy" accent="Policy" />;
}
