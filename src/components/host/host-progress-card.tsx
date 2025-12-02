"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HostOnboardingStep, HostProfile, HostOnboardingStatus } from "@/types/host";
import { cn } from "@/lib/utils";

const STEP_METADATA: Record<
  HostOnboardingStep,
  { label: string; description: string; target?: string }
> = {
  PROFILE_INFO: {
    label: "Profile basics",
    description: "Full name, display name, and contact info",
    target: "/host/dashboard/profile#identity",
  },
  IDENTITY_UPLOAD: {
    label: "Identity documents",
    description: "Upload ID + verification selfie",
    target: "/host/dashboard/profile#kyc",
  },
  ADDRESS_VERIFIED: {
    label: "Address details",
    description: "Where you operate from",
    target: "/host/dashboard/profile#address",
  },
  BUSINESS_DETAILS: {
    label: "Business details",
    description: "Company name or tax ID",
    target: "/host/dashboard/profile#business",
  },
  PAYOUT_DETAILS: {
    label: "Payout account",
    description: "Where we should deposit earnings",
    target: "/host/dashboard/profile#payout",
  },
  SUPPORT_CONTACT: {
    label: "Guest support",
    description: "Email/phone for guests",
    target: "/host/dashboard/profile#support",
  },
  LISTING_PUBLISHED: {
    label: "Publish listing",
    description: "Create at least one live listing",
    target: "/host/dashboard/listings",
  },
};

const ORDERED_STEPS: HostOnboardingStep[] = [
  "PROFILE_INFO",
  "IDENTITY_UPLOAD",
  "ADDRESS_VERIFIED",
  "BUSINESS_DETAILS",
  "PAYOUT_DETAILS",
  "SUPPORT_CONTACT",
  "LISTING_PUBLISHED",
];

const formatStatus = (
  status: HostOnboardingStatus,
  hasListing: boolean,
  allStepsComplete: boolean,
) => {
  if (status === "identity_pending") {
    if (allStepsComplete && !hasListing) {
      return "Publish your first listing";
    }
    return "Verification pending";
  }
  if (!hasListing && allStepsComplete) return "Create your first listing";
  if (status === "draft")
    return hasListing ? "Listing draft" : "Create your first listing";
  return status.replace("_", " ");
};

type HostProgressCardProps = {
  profile: HostProfile;
};

export const HostProgressCard = ({ profile }: HostProgressCardProps) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const totalSteps = ORDERED_STEPS.length;
  const completedCount = profile.completedSteps.length;
  const percent = Math.round((completedCount / totalSteps) * 100);
  const hasListing = profile.completedSteps.includes("LISTING_PUBLISHED");
  const allStepsComplete = completedCount === totalSteps - 1;

  return (
    <Card className="border-slate-200">
      <CardHeader
        className="cursor-pointer space-y-4"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <CardTitle>Onboarding progress</CardTitle>
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            {completedCount}/{totalSteps} steps complete · Status:{" "}
            <span className="font-semibold text-slate-900">
              {formatStatus(profile.onboardingStatus, hasListing, allStepsComplete)}
            </span>
          </p>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Tap to {expanded ? "collapse" : "view details"}
          </p>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {profile.isSuspended && (
              <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
                Suspended
              </span>
            )}
          </div>
          <ul className="space-y-3">
            {[...ORDERED_STEPS]
              .sort((a, b) => {
                const aComplete = profile.completedSteps.includes(a);
                const bComplete = profile.completedSteps.includes(b);
                if (aComplete === bComplete) return 0;
                return aComplete ? -1 : 1;
              })
              .map((step) => {
                const isComplete = profile.completedSteps.includes(step);
                const meta = STEP_METADATA[step];
                const isInteractive = !isComplete && Boolean(meta.target);
                return (
                  <li
                    key={step}
                    className={cn(
                      "flex items-start justify-between rounded-2xl border px-3 py-3 text-sm transition",
                      isComplete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700",
                      isInteractive && "cursor-pointer hover:bg-slate-50",
                    )}
                    onClick={() => {
                      if (isInteractive && meta.target) {
                        router.push(meta.target);
                        if (typeof window !== "undefined") {
                          try {
                            const hash = new URL(meta.target, window.location.origin)
                              .hash;
                            if (hash) {
                              window.location.hash = hash;
                            }
                          } catch {
                            // ignore invalid URL
                          }
                        }
                        setExpanded(false);
                      }
                    }}
                  >
                    <div>
                      <p className="font-semibold">{meta.label}</p>
                      <p className="text-xs text-slate-500">{meta.description}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        isComplete
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {isComplete ? "Done" : "Pending"}
                    </span>
                  </li>
                );
              })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
};
