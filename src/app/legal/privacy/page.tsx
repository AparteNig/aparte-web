import type { Metadata } from "next";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { privacyDoc } from "@/lib/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Aparte",
  description: privacyDoc.summary,
  alternates: { canonical: "/legal/privacy" },
  openGraph: {
    title: "Privacy Policy | Aparte",
    description: privacyDoc.summary,
    url: "/legal/privacy",
    type: "article",
  },
};

export default function PrivacyPage() {
  return <LegalDocumentView doc={privacyDoc} />;
}
