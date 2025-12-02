"use client";

import { useEffect, useState } from "react";
import { HostAvatarUploader } from "@/components/host/avatar-uploader";
import { HostProgressCard } from "@/components/host/host-progress-card";
import { HostLanguagePicker } from "@/components/host/language-picker";
import {
  HostSectionConfig,
  HostSectionForm,
} from "@/components/host/host-section-form";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import Button from "@/components/general/Button";
import { cn } from "@/lib/utils";

const PROFILE_SECTIONS: HostSectionConfig[] = [
  {
    id: "identity",
    tabLabel: "Personal",
    apiSection: "identity",
    title: "Profile basics",
    description: "Share who you are so guests can trust your brand.",
    stepKey: "PROFILE_INFO",
    fields: [
      { name: "fullName", label: "Legal full name", required: true },
      { name: "displayName", label: "Display name", required: true },
      { name: "phone", label: "Phone number", type: "tel", required: true },
      {
        name: "bio",
        label: "About you",
        type: "textarea",
        helperText: "Highlight your hosting experience or brand story.",
      },
    ],
  },
  {
    id: "address",
    tabLabel: "Address",
    apiSection: "address",
    title: "Operating address",
    description: "Confirm the address you operate from.",
    stepKey: "ADDRESS_VERIFIED",
    fields: [
      { name: "addressLine1", label: "Address line 1", required: true },
      { name: "addressLine2", label: "Address line 2 (optional)" },
      { name: "city", label: "City", required: true },
      { name: "state", label: "State / Region" },
      { name: "country", label: "Country", required: true },
      { name: "postalCode", label: "Postal code" },
    ],
  },
  {
    id: "kyc",
    tabLabel: "Identity",
    apiSection: "kyc",
    title: "Identity verification",
    description:
      "Provide government ID details to complete compliance checks.",
    stepKey: "IDENTITY_UPLOAD",
    fields: [
      { name: "idType", label: "ID type (e.g. National ID, Driver’s License)", required: true },
      { name: "idNumber", label: "ID number", required: true },
      {
        name: "idDocumentKey",
        label: "ID document storage key",
        helperText:
          "Upload via /uploads (type=profile) and paste the returned key.",
        required: true,
      },
      {
        name: "selfieDocumentKey",
        label: "Selfie verification key",
        helperText: "Upload a selfie holding your ID and paste the key.",
        required: true,
      },
    ],
  },
  {
    id: "business",
    tabLabel: "Business",
    apiSection: "business",
    title: "Business information",
    description: "Required for payouts to corporate accounts.",
    stepKey: "BUSINESS_DETAILS",
    fields: [
      { name: "businessName", label: "Business name" },
      {
        name: "taxId",
        label: "Tax ID (optional)",
        helperText: "TIN or CAC number if registered.",
      },
    ],
  },
  {
    id: "payout",
    tabLabel: "Payout",
    apiSection: "payout",
    title: "Payout account",
    description: "Where Paystack should deposit your payouts.",
    stepKey: "PAYOUT_DETAILS",
    fields: [
      { name: "payoutBankName", label: "Bank name", required: true },
      { name: "payoutBankCode", label: "Bank code", required: true },
      { name: "payoutAccountName", label: "Account name", required: true },
      { name: "payoutAccountNumber", label: "Account number", required: true },
      {
        name: "payoutRoutingNumber",
        label: "Routing/reference (optional)",
      },
    ],
  },
  {
    id: "support",
    tabLabel: "Support",
    apiSection: "support",
    title: "Guest support",
    description: "Tell guests how to reach you for urgent matters.",
    stepKey: "SUPPORT_CONTACT",
    fields: [
      { name: "supportEmail", label: "Support email", type: "email" },
      { name: "supportPhone", label: "Support phone", type: "tel" },
      { name: "timezone", label: "Timezone", placeholder: "Africa/Lagos" },
    ],
  },
  {
    id: "preferences",
    tabLabel: "Languages",
    apiSection: "preferences",
    title: "Language preferences",
    description: "Let guests know which languages you speak.",
    fields: [],
  },
];

export default function HostProfilePage() {
  const { data, isLoading, isError, error, refetch } = useHostProfileQuery();
  const [activeSection, setActiveSection] = useState(PROFILE_SECTIONS[0].id);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const match = PROFILE_SECTIONS.find((section) => section.id === hash);
      if (match) {
        setActiveSection(match.id);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Loading host profile...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        <p>We couldn’t load your host profile.</p>
        <p className="text-xs">
          {error instanceof Error ? error.message : "Unexpected error"}
        </p>
        <Button
          type="primary"
          className="rounded-2xl bg-red-600 text-white hover:bg-red-700"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HostAvatarUploader profile={data} />
      <HostProgressCard profile={data} />
      <div className="overflow-auto border-b border-slate-200">
        <div className="flex gap-2">
          {PROFILE_SECTIONS.map((section) => (
            <button
              key={section.id}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition",
                activeSection === section.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-slate-500 hover:text-slate-700",
              )}
              onClick={() => {
                setActiveSection(section.id);
                if (typeof window !== "undefined") {
                  window.history.replaceState(null, "", `#${section.id}`);
                }
              }}
            >
              {section.tabLabel ?? section.title}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6">
        {PROFILE_SECTIONS.filter((section) => section.id === activeSection).map(
          (section) =>
            section.id === "preferences" ? (
              <div key={section.id} id={section.id}>
                <HostLanguagePicker profile={data} />
              </div>
            ) : (
              <HostSectionForm key={section.id} config={section} profile={data} />
            ),
        )}
      </div>
    </div>
  );
}
