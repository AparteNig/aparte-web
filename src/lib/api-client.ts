import { ADMIN_AUTH_COOKIE, HOST_AUTH_COOKIE, clearAuthCookie, getAuthCookie } from "@/lib/auth";
import type { HostProfile } from "@/types/host";
import type {
  HostBooking,
  HostBookingsSummary,
  HostListing,
  HostListingDetail,
  ListingCalendarBlock,
} from "@/types/listing";
import type {
  AdminAccount,
  AdminAuditLog,
  AdminBookingRow,
  AdminHost,
  AdminListingDetail,
  AdminListingRow,
  AdminPayoutRequest,
  AdminProfile,
} from "@/types/admin";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://humble-liberation-staging.up.railway.app";

type ApiFetchOptions = RequestInit & { auth?: boolean; authCookie?: "host" | "admin" };

const isFormData = (body: BodyInit | null | undefined): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const buildUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
  const { auth = true, authCookie = "host", headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (!isFormData(rest.body) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const cookieName = authCookie === "admin" ? ADMIN_AUTH_COOKIE : HOST_AUTH_COOKIE;
    const token = getAuthCookie(cookieName);
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: finalHeaders,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      const cookieName = authCookie === "admin" ? ADMIN_AUTH_COOKIE : HOST_AUTH_COOKIE;
      clearAuthCookie(cookieName);
      if (authCookie === "admin") {
        if (!window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      } else if (!window.location.pathname.startsWith("/host/login")) {
        window.location.href = "/host/login";
      }
    }
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? (payload as { message: string }).message
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
export type HostAuthTokens = AuthTokens;

export type HostLoginSuccessResponse = {
  requiresOtp: false;
  tokens: HostAuthTokens;
  hostProfile: HostProfile;
};

export type HostLoginOtpResponse = {
  requiresOtp: true;
  otpId: number;
  devPreview?: string;
};

export type HostLoginResponse = HostLoginSuccessResponse | HostLoginOtpResponse;

export type AdminLoginSuccessResponse = {
  requiresOtp: false;
  tokens: AuthTokens;
  adminProfile: AdminProfile;
};

export type AdminLoginOtpResponse = {
  requiresOtp: true;
  otpId: number;
  devPreview?: string;
};

export type AdminLoginResponse = AdminLoginSuccessResponse | AdminLoginOtpResponse;

export type UserLoginSuccessResponse = {
  requiresOtp: false;
  tokens: AuthTokens;
};

export type UserLoginOtpResponse = {
  requiresOtp: true;
  otpId: number;
  devPreview?: string;
};

export type UserLoginResponse = UserLoginSuccessResponse | UserLoginOtpResponse;

export const registerHost = (payload: { email: string; phone: string; password: string }) =>
  apiFetch<{ hostProfile: HostProfile }>("/auth/hosts/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const loginHostRequest = (payload: {
  email: string;
  password: string;
  device?: { type?: "web" | "android" | "ios"; ipAddress?: string };
}) =>
  apiFetch<HostLoginResponse>("/auth/hosts/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const loginAdminRequest = (payload: {
  email: string;
  password: string;
  device?: { type?: "web" | "android" | "ios"; ipAddress?: string };
}) =>
  apiFetch<AdminLoginResponse>("/auth/admins/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const loginUserRequest = (payload: {
  email: string;
  password: string;
  device?: { type?: "web" | "android" | "ios"; ipAddress?: string };
}) =>
  apiFetch<UserLoginResponse>("/auth/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const refreshAdminTokens = (payload: {
  refreshToken: string;
  device?: { type?: "web" | "android" | "ios"; ipAddress?: string };
}) =>
  apiFetch<{ tokens: AuthTokens; adminProfile: AdminProfile }>("/auth/admins/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const logoutAdminRequest = () =>
  apiFetch<{ success: boolean }>("/auth/admins/logout", {
    method: "POST",
    authCookie: "admin",
  });

export const verifyOtpRequest = (payload: {
  otpId: number;
  code: string;
  device?: { type?: "web" | "android" | "ios"; ipAddress?: string };
}) =>
  apiFetch<{ tokens: AuthTokens; hostProfile?: HostProfile; adminProfile?: AdminProfile }>(
    "/auth/otp/verify",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    },
  );

export const getHostProfile = () =>
  apiFetch<{ hostProfile: HostProfile }>("/hosts/profile", {
    method: "GET",
  });

export const updateHostProfileSection = (payload: {
  section?: string;
  data: Record<string, unknown>;
}) =>
  apiFetch<{ hostProfile: HostProfile }>("/hosts/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const uploadHostAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiFetch<{ hostProfile: HostProfile }>("/hosts/profile/avatar", {
    method: "POST",
    body: formData,
  });
};

export const uploadListingAsset = (listingId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "listing");
  formData.append("entityId", String(listingId));
  return apiFetch<{ key: string; url: string }>("/uploads", {
    method: "POST",
    body: formData,
  });
};

export const getHostListings = () =>
  apiFetch<{ listings: HostListing[] }>("/hosts/listings", {
    method: "GET",
  });

export const getPublicListings = () =>
  apiFetch<{ listings: HostListing[] }>("/listings/public", {
    method: "GET",
    auth: false,
  });

export const createHostListing = (formData: FormData) =>
  apiFetch<{ listing: HostListing }>("/hosts/listings", {
    method: "POST",
    body: formData,
  });

export const getHostListing = (listingId: number) =>
  apiFetch<{ listing: HostListingDetail }>(`/hosts/listings/${listingId}`, {
    method: "GET",
  });

export const updateHostListing = (
  listingId: number,
  payload: Partial<
    Pick<
      HostListing,
      | "title"
      | "summary"
      | "description"
      | "addressLine1"
      | "addressLine2"
      | "city"
      | "state"
      | "country"
      | "postalCode"
      | "nightlyPrice"
      | "cleaningFee"
      | "serviceFee"
      | "maxGuests"
      | "bedrooms"
      | "bathrooms"
      | "amenities"
      | "houseRules"
      | "minNights"
      | "maxNights"
      | "newListingPromotionPercent"
      | "weeklyDiscountPercent"
      | "monthlyDiscountPercent"
    >
  >,
) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const publishHostListing = (listingId: number) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}/publish`, {
    method: "POST",
  });

export const draftHostListing = (listingId: number) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}/draft`, {
    method: "POST",
  });

export const deleteHostListing = (listingId: number) =>
  apiFetch<void>(`/hosts/listings/${listingId}`, {
    method: "DELETE",
  });

export type ListingPhotoPayload = {
  key: string;
  caption?: string;
  sortOrder?: number;
};

export const addListingPhotos = (listingId: number, photos: ListingPhotoPayload[]) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}/photos`, {
    method: "POST",
    body: JSON.stringify({ photos }),
  });

export const deleteListingPhoto = (listingId: number, photoId: number) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}/photos/${photoId}`, {
    method: "DELETE",
  });

export const getListingCalendar = (listingId: number, month?: string) =>
  apiFetch<{ blocks: ListingCalendarBlock[] }>(
    `/hosts/listings/${listingId}/calendar${month ? `?month=${month}` : ""}`,
  );

export const addListingBlackout = (
  listingId: number,
  payload: { startDate: string; endDate: string; reason?: string },
) =>
  apiFetch<{ block: ListingCalendarBlock }>(
    `/hosts/listings/${listingId}/calendar/blackouts`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

export const deleteListingBlackout = (listingId: number, blockId: number) =>
  apiFetch<void>(`/hosts/listings/${listingId}/calendar/blackouts/${blockId}`, {
    method: "DELETE",
  });

export const getHostBookings = () =>
  apiFetch<{ bookings: HostBooking[]; summary: HostBookingsSummary }>("/hosts/bookings", {
    method: "GET",
  });

export const completeHostBooking = (bookingId: number) =>
  apiFetch<{ booking: HostBooking }>(`/hosts/bookings/${bookingId}/complete`, {
    method: "PATCH",
  });

export type CreateCustomerBookingPayload = {
  listingId: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  startDate: string;
  endDate: string;
  nights?: number;
  notes?: string;
};

export const createCustomerBooking = (payload: CreateCustomerBookingPayload) =>
  apiFetch<{ booking: HostBooking }>("/customer/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const createCustomerBookingWithToken = (
  payload: CreateCustomerBookingPayload,
  token: string,
) =>
  apiFetch<{ booking: HostBooking }>("/customer/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const checkInCustomerBooking = (bookingId: number) =>
  apiFetch<{ booking: HostBooking }>(`/customer/bookings/${bookingId}/checkin`, {
    method: "POST",
    auth: false,
  });

export const markBookingCheckoutDue = (bookingId: number) =>
  apiFetch<{ booking: HostBooking }>(`/customer/bookings/${bookingId}/checkout`, {
    method: "POST",
    auth: false,
  });

export const guestCheckoutCustomerBooking = (bookingId: number) =>
  apiFetch<{ booking: HostBooking }>(`/customer/bookings/${bookingId}/guest-checkout`, {
    method: "POST",
    auth: false,
  });

export const completeCustomerBooking = (bookingId: number) =>
  apiFetch<{ booking: HostBooking }>(`/customer/bookings/${bookingId}/complete`, {
    method: "POST",
    auth: false,
  });

const adminQuery = <T>(path: string, options: ApiFetchOptions = {}) =>
  apiFetch<T>(path, { ...options, authCookie: "admin" });

export const getAdminHosts = () =>
  adminQuery<{ hosts: AdminHost[] }>("/admin/hosts").then((res) => res.hosts);

export const getAdminAccounts = () =>
  adminQuery<{ admins: AdminAccount[] }>("/admin/admins").then((res) => res.admins);

export const getAdminProfile = () =>
  adminQuery<{ adminProfile: AdminProfile }>("/auth/admins/me").then((res) => res.adminProfile);

export const inviteAdminRequest = (payload: {
  email: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  isSuperAdmin?: boolean;
}) =>
  adminQuery<{
    email: string;
    expiresAt: string;
    token: string;
    devEmailPreview?: { to: string; subject: string; body: string };
  }>("/auth/admins/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminInviteDetails = (token: string) =>
  apiFetch<{ email: string; fullName: string; isSuperAdmin: boolean; expiresAt: string }>(
    `/auth/admins/invite/${token}`,
    { auth: false },
  );

export const activateAdminAccount = (payload: {
  token: string;
  password: string;
  fullName?: string;
}) =>
  apiFetch<{ requiresOtp: boolean; otpId: number; devPreview?: string }>("/auth/admins/activate", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

export const suspendHost = (hostId: number, reason?: string) =>
  adminQuery<{ host: AdminHost; suspended: boolean }>(`/admin/hosts/${hostId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

export const restoreHost = (hostId: number) =>
  adminQuery<{ host: AdminHost; suspended: boolean }>(`/admin/hosts/${hostId}/restore`, {
    method: "PATCH",
  });

export const approveHost = (hostId: number, notes?: string) =>
  adminQuery<{ host: AdminHost; approvalStatus: "approved" }>(`/admin/hosts/${hostId}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });

export const rejectHost = (hostId: number, reason: string) =>
  adminQuery<{ host: AdminHost; approvalStatus: "rejected" }>(`/admin/hosts/${hostId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getAdminListings = () =>
  adminQuery<{ listings: AdminListingRow[] }>("/admin/listings").then((res) => res.listings);

export const getAdminListingDetail = (listingId: number) =>
  adminQuery<AdminListingDetail>(`/admin/listings/${listingId}`);

export const approveListing = (listingId: number, reviewNotes?: string) =>
  adminQuery<{ listing: AdminListingRow["listing"] }>(`/admin/listings/${listingId}/approve`, {
    method: "POST",
    body: JSON.stringify({ reviewNotes }),
  });

export const rejectListing = (listingId: number, reviewNotes?: string) =>
  adminQuery<{ listing: AdminListingRow["listing"] }>(`/admin/listings/${listingId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reviewNotes }),
  });

export const suspendListing = (listingId: number, reason?: string) =>
  adminQuery<{ listing: AdminListingRow["listing"] }>(`/admin/listings/${listingId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

export const restoreListing = (listingId: number) =>
  adminQuery<{ listing: AdminListingRow["listing"] }>(`/admin/listings/${listingId}/restore`, {
    method: "PATCH",
  });

export const getAdminBookings = () =>
  adminQuery<{ bookings: AdminBookingRow[] }>("/admin/bookings").then((res) => res.bookings);

export const updateAdminBookingStatus = (
  bookingId: number,
  payload: { status: string; notes?: string },
) =>
  adminQuery<{ booking: AdminBookingRow["booking"] }>(`/admin/bookings/${bookingId}/status`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminBookingNotes = (bookingId: number, notes: string) =>
  adminQuery<{ booking: AdminBookingRow["booking"] }>(`/admin/bookings/${bookingId}/notes`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });

export const completeAdminBooking = (bookingId: number) =>
  adminQuery<{ booking: AdminBookingRow["booking"]; payoutPreview?: unknown }>(
    `/admin/bookings/${bookingId}/complete`,
    {
      method: "POST",
    },
  );

export const getAdminPayoutRequests = () =>
  adminQuery<{ payoutRequests: AdminPayoutRequest[] }>("/admin/payouts/requests").then(
    (res) => res.payoutRequests,
  );

export const approvePayoutRequest = (requestId: number, notes?: string) =>
  adminQuery<{ payoutRequest: AdminPayoutRequest }>(`/admin/payouts/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });

export const rejectPayoutRequest = (requestId: number, reason: string) =>
  adminQuery<{ payoutRequest: AdminPayoutRequest }>(`/admin/payouts/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const markPayoutAsPaid = (requestId: number, reference?: string) =>
  adminQuery<{ payoutRequest: AdminPayoutRequest }>(`/admin/payouts/${requestId}/mark-paid`, {
    method: "POST",
    body: JSON.stringify({ reference }),
  });

export const getAdminAuditLogs = (params?: {
  limit?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.action) query.set("action", params.action);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  const url = `/admin/audit-logs${query.toString() ? `?${query.toString()}` : ""}`;
  return adminQuery<{ entries: AdminAuditLog[] }>(url).then((res) => res.entries);
};
