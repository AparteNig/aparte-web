import type { HostListing } from "./listing";

export type AdminRole = "reviewer" | "admin";

export type AdminProfile = {
  id: number;
  email: string;
  fullName: string;
  role: AdminRole;
  isSuperAdmin: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
};

export type AdminAccount = AdminProfile & {
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminHost = {
  id: number;
  email: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  onboardingStatus: string;
  adminApprovalStatus: "pending" | "approved" | "rejected";
  payoutStatus: string;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  onboardingNotes: string | null;
};

export type AdminListingRow = {
  listing: {
    id: number;
    hostId: number;
    title: string;
    city: string | null;
    country: string | null;
    status: string;
    nightlyPrice: number;
    reviewNotes: string | null;
    updatedAt: string;
    createdAt: string;
  };
  host: {
    id: number;
    email: string;
    fullName: string | null;
    onboardingStatus: string;
  } | null;
};

export type AdminListingDetail = {
  listing: HostListing;
  host: AdminListingRow["host"];
};

export type AdminBookingRow = {
  booking: {
    id: number;
    listingId: number;
    hostId: number;
    guestName: string;
    guestEmail: string | null;
    guestPhone: string | null;
    startDate: string;
    endDate: string;
    nights: number;
    status: string;
    totalAmount: number;
    notes: string | null;
    createdAt: string;
  };
  listing: {
    id: number;
    title: string | null;
  } | null;
  host: {
    id: number;
    email: string | null;
    fullName: string | null;
  } | null;
};

export type AdminPayoutRequest = {
  id: number;
  hostId: number;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "paid" | "failed";
  reason: string | null;
  adminNotes: string | null;
  approvedByAdminId: number | null;
  approvedAt: string | null;
  processedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAuditLog = {
  id: number;
  adminId: number | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
};
