export type HostOnboardingStatus =
  | "draft"
  | "identity_pending"
  | "identity_verified"
  | "payout_pending"
  | "active"
  | "suspended"
  | "rejected";

export type HostOnboardingStep =
  | "PROFILE_INFO"
  | "IDENTITY_UPLOAD"
  | "ADDRESS_VERIFIED"
  | "BUSINESS_DETAILS"
  | "PAYOUT_DETAILS"
  | "SUPPORT_CONTACT"
  | "LISTING_PUBLISHED";

export type HostProfile = {
  id: number;
  email: string;
  fullName: string;
  displayName: string;
  phone: string;
  bio: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  idType: string;
  idNumber: string;
  idDocumentKey: string;
  selfieDocumentKey: string;
  avatarKey: string;
  avatarUrl: string | null;
  businessName: string;
  taxId: string;
  payoutBankName: string;
  payoutBankCode: string;
  payoutAccountName: string;
  payoutAccountNumber: string;
  payoutRoutingNumber: string;
  payoutStatus: string;
  supportPhone: string;
  supportEmail: string;
  timezone: string;
  languages: string[];
  onboardingStatus: HostOnboardingStatus;
  completedSteps: HostOnboardingStep[];
  incompleteSteps: HostOnboardingStep[];
  kycVerified: boolean;
  payoutVerified: boolean;
  isSuspended: boolean;
  onboardingNotes: string;
};

export const HOST_ONBOARDING_STEPS: HostOnboardingStep[] = [
  "PROFILE_INFO",
  "IDENTITY_UPLOAD",
  "ADDRESS_VERIFIED",
  "BUSINESS_DETAILS",
  "PAYOUT_DETAILS",
  "SUPPORT_CONTACT",
  "LISTING_PUBLISHED",
];
