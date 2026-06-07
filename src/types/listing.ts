import type { HostOnboardingStatus } from "./host";

export type ListingStatus = "draft" | "pending_review" | "published" | "suspended";

export type ListingCategory =
  | "apartment" | "studio" | "loft" | "duplex" | "penthouse"
  | "villa" | "cottage" | "bungalow" | "townhouse" | "beach_house" | "mansion";

export const LISTING_CATEGORIES: { value: ListingCategory; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" },
  { value: "loft", label: "Loft" },
  { value: "duplex", label: "Duplex" },
  { value: "penthouse", label: "Penthouse" },
  { value: "villa", label: "Villa" },
  { value: "cottage", label: "Cottage" },
  { value: "bungalow", label: "Bungalow" },
  { value: "townhouse", label: "Townhouse" },
  { value: "beach_house", label: "Beach House" },
  { value: "mansion", label: "Mansion" },
];

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
  category: ListingCategory | null;
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
  cautionFee: number;
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
  listingId: number | null;
  vehicleId: number | null;
  withDriver: boolean;
  driverFee: number;
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
  vehicle?: {
    id: number | null;
    make: string;
    model: string;
    year: number;
    pickupCity: string;
    pickupCountry: string;
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
