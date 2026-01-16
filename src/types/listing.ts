import type { HostOnboardingStatus } from "./host";

export type ListingStatus = "draft" | "pending_review" | "published" | "suspended";

export type ListingPhoto = {
  id: number;
  key: string;
  url: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
};

export type ListingPhotoPayload = {
  key: string;
  caption?: string;
  sortOrder?: number;
};

export type ListingCalendarBlock = {
  id: number;
  listingId: number;
  startDate: string;
  endDate: string;
  reason: string;
};

export type HostListing = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  summary: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  nightlyPrice: number;
  currency: string;
  cleaningFee: number;
  serviceFee: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  houseRules: string[];
  minNights: number;
  maxNights: number | null;
  newListingPromotionPercent: number;
  weeklyDiscountPercent: number;
  monthlyDiscountPercent: number;
  status: ListingStatus;
  reviewNotes: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: ListingPhoto[];
};

export type HostListingDetail = HostListing & {
  calendarBlocks?: ListingCalendarBlock[];
};

export type HostBooking = {
  id: number;
  listingId: number;
  hostId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  startDate: string;
  endDate: string;
  nights: number;
  status: string;
  totalAmount: number;
  notes: string;
  createdAt: string;
  listing?: {
    id: number;
    title: string;
    city: string;
    country: string;
  };
};

export type HostBookingsSummary = {
  activeCount: number;
  activeAmount: number;
  completedCount: number;
  completedAmount: number;
};

export type HostProfileWithStatus = {
  onboardingStatus: HostOnboardingStatus;
  payoutStatus: string;
  supportEmail: string;
  supportPhone: string;
  payoutBankName: string;
  payoutAccountNumber: string;
  incompleteSteps: string[];
  completedSteps: string[];
};
