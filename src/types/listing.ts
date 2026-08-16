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
  /**
   * @deprecated Host-set service fees were retired when Aparte moved to a split
   * fee. The guest-facing service fee is now computed per booking from the
   * nightly rate; this column only still holds values on legacy listings.
   */
  serviceFee: number;
  /** Set by admins, held in escrow by Aparte, refunded to the guest. */
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
  /** Number of Explore clips attached — see /hosts/listings/:id/explore-posts. */
  explorePosts?: { id: number; url: string; sortOrder: number }[];
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
  accommodationAmount: number;
  passThroughAmount: number;
  guestServiceFee: number;
  cautionAmount: number;
  netOfRefundable: number;
  /** ISO deadline. After this the booking confirms without the host acting. */
  approvalDueAt: string | null;
  approvedAt: string | null;
  approvedBy: "host" | "auto" | null;
  declinedAt: string | null;
  declineReason: string | null;
  /**
   * Whether a check-in code exists — deliberately not the code itself. The host
   * redeems it at handover; being able to read it would defeat the point.
   */
  hasCheckInCode: boolean;
  checkedInAt: string | null;
  checkedInByType: "host" | "admin" | null;
  /** What the host actually earns on this booking, after commission. */
  hostCommission: number;
  hostPayoutAmount: number;
  /**
   * Escrow outcome. `awardedToHost` is real host earnings that sits outside the
   * booking payout, so it has to be added separately when totalling revenue.
   */
  caution: {
    amount: number;
    status: "held" | "claimed" | "released" | "awarded" | "cancelled";
    awardedToHost: number;
  } | null;
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
