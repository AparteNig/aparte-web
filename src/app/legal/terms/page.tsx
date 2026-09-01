import type { Metadata } from "next";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { termsDoc } from "@/lib/legal/terms";

export const metadata: Metadata = {
  title: "Terms and Conditions | Aparte",
  description: termsDoc.summary,
  alternates: { canonical: "/legal/terms" },
  openGraph: {
    title: "Terms and Conditions | Aparte",
    description: termsDoc.summary,
    url: "/legal/terms",
    type: "article",
  },
};

export default function TermsPage() {
  return <LegalDocumentView doc={termsDoc} />;
}
