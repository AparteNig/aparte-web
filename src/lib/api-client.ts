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
import type { AdminVehicleRow, HostVehicle, VehicleCalendarBlock, VehiclePhotoPayload } from "@/types/vehicle";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://humble-liberation-staging.up.railway.app";

type ApiFetchOptions = RequestInit & { auth?: boolean; authCookie?: "host" | "admin" };

const isFormData = (body: BodyInit | null | undefined): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const buildUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && attempt < retries) {
        await sleep(Math.pow(2, attempt) * 1000); // 1s, 2s, 4s
        continue;
      }
      return res;
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  throw new Error('fetch failed after retries');
};

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

  const response = await fetchWithRetry(buildUrl(path), {
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

export type RegistrationOtpResponse = {
  requiresOtp: true;
  otpId: number;
  devPreview?: string;
};

export const registerHost = (payload: { email: string; phone: string; password: string }) =>
  apiFetch<{ hostProfile: HostProfile } & RegistrationOtpResponse>("/auth/hosts/register", {
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

/**
 * Uploads the listing's Explore clip. The backend re-encodes it to fit under
 * 2MB, so a raw phone recording is fine here — no client-side compression.
 * Returns the S3 key to store on the listing via setListingExplorePost.
 */
export const uploadExplorePost = (listingId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "explore");
  formData.append("entityId", String(listingId));
  return apiFetch<{ key: string; url: string; size: number }>("/uploads", {
    method: "POST",
    body: formData,
  });
};

export type ExplorePost = { id: number; url: string; sortOrder: number };
type ExplorePostsResponse = { explorePosts: ExplorePost[]; max: number };

export const getListingExplorePosts = (listingId: number) =>
  apiFetch<ExplorePostsResponse>(`/hosts/listings/${listingId}/explore-posts`);

/** Attach an already-uploaded clip. Rejects with 409 once the listing is full. */
export const addListingExplorePost = (listingId: number, storageKey: string) =>
  apiFetch<ExplorePostsResponse>(`/hosts/listings/${listingId}/explore-posts`, {
    method: "POST",
    body: JSON.stringify({ storageKey }),
  });

export const deleteListingExplorePost = (listingId: number, postId: number) =>
  apiFetch<ExplorePostsResponse>(`/hosts/listings/${listingId}/explore-posts/${postId}`, {
    method: "DELETE",
  });

export type DecodedVin = {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  bodyClass: string | null;
  engine: string | null;
  fuelType: string | null;
  driveType: string | null;
  manufacturer: string | null;
  suggestedFuelType: "petrol" | "diesel" | "electric" | "hybrid" | null;
};

/**
 * Decodes a VIN via the backend (which proxies NHTSA's vPIC database) to
 * prefill the add-vehicle form. Everything it returns is a suggestion the host
 * confirms — a US dataset will not recognise every imported car.
 */
export const decodeVehicleVin = (vin: string) =>
  apiFetch<{ vehicle: DecodedVin }>(
    `/hosts/vehicles/decode-vin/${encodeURIComponent(vin)}`,
  ).then((res) => res.vehicle);

export const uploadVehicleAsset = (vehicleId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "vehicle");
  formData.append("entityId", String(vehicleId));
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

export const getHostPayoutSummary = (period?: "daily" | "weekly" | "monthly") =>
  apiFetch<{
    availableBalance: number;
    todaysEarnings: number;
    monthTotal: number;
    period: string;
    periodStart: string;
    periodEnd: string;
    periodTotal: number;
    payoutHistory: Array<{
      booking: {
        id: number;
        listingId: number;
        listingTitle: string;
        guestName: string;
        startDate: string;
        endDate: string;
        status: string;
      };
      entries: Array<{ date: string; dailyRate: number; total: number }>;
    }>;
    aggregatedPayout: {
      period: string;
      total: number;
      currency: string;
      bookingCount: number;
    };
    withdrawalHistory: Array<{
      id: number;
      amount: number;
      currency: string;
      status: string;
      payoutBankName: string | null;
      payoutBankCode: string | null;
      payoutAccountName: string | null;
      payoutAccountNumber: string | null;
      payoutRoutingNumber: string | null;
      reason: string | null;
      adminNotes: string | null;
      approvedByAdminId: number | null;
      approvedAt: string | null;
      processedAt: string | null;
      failureReason: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
    payoutBankDetails: {
      bankName: string | null;
      accountName: string | null;
      accountNumber: string | null;
      bankCode: string | null;
      routingNumber: string | null;
    };
  }>(`/hosts/payouts/summary${period ? `?period=${period}` : ""}`, {
    method: "GET",
  });

export const requestHostWithdrawal = (amount: number) =>
  apiFetch<{ payoutRequest: { id: number; amount: number; status: string } }>(
    "/hosts/payouts/withdrawals",
    {
      method: "POST",
      body: JSON.stringify({ amount }),
    },
  );

export const updateHostListing = (
  listingId: number,
  payload: Partial<
    Pick<
      HostListing,
      | "title"
      | "category"
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

export type HostBookingDetail = HostBooking & {
  vehicle?: { id: number | null; make: string; model: string; year: number } | null;
  caution: {
    amount: number;
    status: "held" | "claimed" | "released" | "awarded" | "cancelled";
    awardedToHost: number;
    returnedToGuest: number;
    releaseDueAt: string | null;
    claimReason: string | null;
  } | null;
};

export const getHostBookingDetail = (bookingId: number) =>
  apiFetch<{ booking: HostBookingDetail }>(`/hosts/bookings/${bookingId}`, {
    method: "GET",
  }).then((r) => r.booking);

/** Bookings paid for and waiting on this host, plus the window they have. */
export const getBookingsAwaitingApproval = () =>
  apiFetch<{ bookings: HostBooking[]; approvalWindowMinutes: number }>(
    "/hosts/bookings/awaiting-approval",
    { method: "GET" },
  );

export const acceptHostBooking = (bookingId: number) =>
  apiFetch<{ booking: HostBooking }>(`/hosts/bookings/${bookingId}/accept`, {
    method: "POST",
  });

/**
 * Declining refunds the guest in full and frees the dates. `refundInitiated`
 * comes back false when the cancellation stood but the gateway call failed —
 * the booking is still cancelled, but an admin has to finish the refund.
 */
export const declineHostBooking = (bookingId: number, reason: string) =>
  apiFetch<{ booking: HostBooking; refundInitiated: boolean }>(
    `/hosts/bookings/${bookingId}/decline`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );

/** Redeem the guest's arrival code to start the stay. Host or admin only. */
export const checkInBooking = (bookingId: number, code: string) =>
  apiFetch<{ booking: HostBooking }>(`/customer/bookings/${bookingId}/checkin`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });

/**
 * Ends the stay by redeeming the guest's departure code. Single-use and
 * distinct from the arrival code.
 */
export const checkOutBooking = (bookingId: number, code: string) =>
  apiFetch<{ booking: HostBooking }>(`/customer/bookings/${bookingId}/guest-checkout`, {
    method: "POST",
    body: JSON.stringify({ code }),
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

export const initializePaymentWithToken = (bookingId: number, token: string) =>
  apiFetch<{ reference: string; accessCode: string; authorizationUrl: string; amount: number }>(
    "/payments/initialize",
    {
      method: "POST",
      body: JSON.stringify({ bookingId }),
      auth: false,
      headers: { Authorization: `Bearer ${token}` },
    },
  );

export const verifyPaymentWithToken = (reference: string, token: string) =>
  apiFetch<{ settled: boolean; status: string }>("/payments/verify", {
    method: "POST",
    body: JSON.stringify({ reference }),
    auth: false,
    headers: { Authorization: `Bearer ${token}` },
  });

export const cancelCustomerBookingWithToken = (bookingId: number, token: string) =>
  apiFetch<{ booking: HostBooking; refund: { refunded: boolean; reason?: string } }>(
    `/customer/bookings/${bookingId}/cancel`,
    {
      method: "POST",
      auth: false,
      headers: { Authorization: `Bearer ${token}` },
    },
  );

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

// ── Customer Vehicle Booking API ───────────────────────────────

export type CreateCustomerVehicleBookingPayload = {
  vehicleId: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  startDate: string;
  endDate: string;
  days?: number;
  withDriver?: boolean;
  notes?: string;
};

export const getPublicVehicles = () =>
  apiFetch<{ vehicles: import("@/types/vehicle").HostVehicle[] }>("/customer/vehicle-bookings/vehicles", {
    method: "GET",
    auth: false,
  });

export const createCustomerVehicleBookingWithToken = (
  payload: CreateCustomerVehicleBookingPayload,
  token: string,
) =>
  apiFetch<{ booking: HostBooking }>("/customer/vehicle-bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getHostVehicleBookings = () =>
  apiFetch<{ bookings: HostBooking[] }>("/customer/vehicle-bookings/host", {
    method: "GET",
    authCookie: "host",
  });

// ── Host Vehicle API ──────────────────────────────────────────

export const getHostVehicles = (status?: string) =>
  apiFetch<{ vehicles: HostVehicle[] }>(`/hosts/vehicles${status ? `?status=${status}` : ""}`, { method: "GET" });

export const createHostVehicle = (payload: Partial<HostVehicle>) =>
  apiFetch<{ vehicle: HostVehicle }>("/hosts/vehicles", { method: "POST", body: JSON.stringify(payload) });

export const getHostVehicle = (vehicleId: number) =>
  apiFetch<{ vehicle: HostVehicle }>(`/hosts/vehicles/${vehicleId}`, { method: "GET" });

export const updateHostVehicle = (vehicleId: number, payload: Partial<HostVehicle>) =>
  apiFetch<{ vehicle: HostVehicle }>(`/hosts/vehicles/${vehicleId}`, { method: "PATCH", body: JSON.stringify(payload) });

export const submitHostVehicle = (vehicleId: number) =>
  apiFetch<{ vehicle: HostVehicle; message: string }>(`/hosts/vehicles/${vehicleId}/submit`, { method: "POST" });

export const deleteHostVehicle = (vehicleId: number) =>
  apiFetch<void>(`/hosts/vehicles/${vehicleId}`, { method: "DELETE" });

export const addVehiclePhotos = (vehicleId: number, photos: VehiclePhotoPayload[]) =>
  apiFetch<{ vehicle: HostVehicle }>(`/hosts/vehicles/${vehicleId}/photos`, { method: "POST", body: JSON.stringify({ photos }) });

export const deleteVehiclePhoto = (vehicleId: number, photoId: number) =>
  apiFetch<{ vehicle: HostVehicle }>(`/hosts/vehicles/${vehicleId}/photos/${photoId}`, { method: "DELETE" });

export const getVehicleCalendar = (vehicleId: number) =>
  apiFetch<{ blocks: VehicleCalendarBlock[] }>(`/hosts/vehicles/${vehicleId}/calendar`, { method: "GET" });

export const addVehicleCalendarBlock = (vehicleId: number, payload: { startDate: string; endDate: string; reason?: string }) =>
  apiFetch<{ block: VehicleCalendarBlock }>(`/hosts/vehicles/${vehicleId}/calendar`, { method: "POST", body: JSON.stringify(payload) });

export const deleteVehicleCalendarBlock = (vehicleId: number, blockId: number) =>
  apiFetch<{ blocks: VehicleCalendarBlock[] }>(`/hosts/vehicles/${vehicleId}/calendar/${blockId}`, { method: "DELETE" });

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

export const updateListingCautionFee = (listingId: number, cautionFee: number) =>
  adminQuery<{ listing: AdminListingRow["listing"] }>(`/admin/listings/${listingId}/caution-fee`, {
    method: "PATCH",
    body: JSON.stringify({ cautionFee }),
  });

export const getAdminBookings = () =>
  adminQuery<{ bookings: AdminBookingRow[] }>("/admin/bookings").then((res) => res.bookings);

// ── Caution deposits (escrow) ────────────────────────────────────────────────

export type CautionDepositRow = {
  id: number;
  bookingId: number;
  amount: number;
  amountToGuest: number;
  amountToHost: number;
  status: "held" | "claimed" | "released" | "awarded" | "cancelled";
  releaseDueAt: string | null;
  claimReason: string | null;
  claimedAt: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  refundReference: string | null;
  /** Last failure from the auto-release sweep — a stuck hold shows up here. */
  releaseError: string | null;
  createdAt: string;
  guestName: string | null;
  hostId: number | null;
  stayTitle: string | null;
  checkoutDate: string | null;
};

export const getCautionDeposits = (status?: string) =>
  adminQuery<{ deposits: CautionDepositRow[] }>(
    `/admin/caution-deposits${status ? `?status=${encodeURIComponent(status)}` : ""}`,
  ).then((res) => res.deposits);

/** Suspends the auto-release clock pending a decision. */
export const claimCautionDeposit = (bookingId: number, reason: string) =>
  adminQuery<{ deposit: CautionDepositRow }>(`/admin/caution-deposits/${bookingId}/claim`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

/**
 * The only call that can move escrow toward a host. amountToHost of 0 rejects
 * the claim and returns the whole deposit to the guest.
 */
export const resolveCautionDeposit = (
  bookingId: number,
  amountToHost: number,
  notes?: string,
) =>
  adminQuery<{ deposit: CautionDepositRow }>(`/admin/caution-deposits/${bookingId}/resolve`, {
    method: "POST",
    body: JSON.stringify({ amountToHost, notes }),
  });

export type IdentityStatus = "not_started" | "pending" | "approved" | "rejected";

export type IdentityVerificationRow = {
  id: number;
  subjectType: "user" | "host";
  subjectId: number;
  subjectName: string;
  subjectEmail: string;
  idType: "nin" | "passport" | "drivers_licence" | "voters_card";
  idNumber: string;
  status: IdentityStatus;
  submittedAt: string | null;
};

export type IdentitySummary = {
  status: IdentityStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  idType: string | null;
};

export type BreakfastCategory = "continental" | "vegan" | "local" | "protein";

export type BreakfastOptionRow = {
  id: number;
  name: string;
  description: string;
  category: BreakfastCategory;
  imageUrl: string | null;
  /** What an ADDITIONAL serving costs. The first each day is complimentary. */
  price: number;
  isActive: boolean;
  sortOrder: number;
};

export const getBreakfastOptions = () =>
  adminQuery<{ options: BreakfastOptionRow[] }>("/admin/breakfast-options").then(
    (res) => res.options,
  );

export const createBreakfastOption = (payload: {
  name: string;
  description: string;
  price: number;
  category: BreakfastCategory;
  imageKey: string;
}) =>
  adminQuery<{ option: BreakfastOptionRow }>("/admin/breakfast-options", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/** Retiring is isActive:false — past orders reference these rows. */
export const updateBreakfastOption = (
  id: number,
  patch: Partial<{
    name: string;
    description: string;
    price: number;
    category: BreakfastCategory;
    imageKey: string;
    isActive: boolean;
  }>,
) =>
  adminQuery<{ option: BreakfastOptionRow }>(`/admin/breakfast-options/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

/** Dish photography lives under a platform-owned `breakfast/` prefix. */
export const uploadBreakfastImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "breakfast");
  return apiFetch<{ key: string; url: string }>("/uploads", {
    method: "POST",
    body: formData,
    auth: true,
    authCookie: "admin",
  });
};

export const getPendingIdentityVerifications = () =>
  adminQuery<{ verifications: IdentityVerificationRow[]; pendingCount: number }>(
    "/admin/identity/pending",
  );

/**
 * Fetched per verification, never for a whole page: each call mints two
 * 60-second signed links to somebody's identity documents and is written to
 * the audit log, so it happens when a reviewer opens one, not when the queue
 * renders.
 */
export const getIdentityDocuments = (verificationId: number) =>
  adminQuery<{
    documentUrl: string;
    selfieUrl: string;
    expiresInSeconds: number;
    idType: string;
    idNumber: string;
  }>(`/admin/identity/${verificationId}/documents`);

export const reviewIdentityVerification = (
  verificationId: number,
  decision: "approved" | "rejected",
  rejectionReason?: string,
) =>
  adminQuery<{ id: number; status: IdentityStatus; reviewedAt: string | null }>(
    `/admin/identity/${verificationId}/review`,
    { method: "POST", body: JSON.stringify({ decision, rejectionReason }) },
  );

/** The signed-in host's own check. */
/**
 * Uploads one identity file. `entityId` is `<actorType>-<id>` because the
 * server files identity documents under a top-level `identity/` prefix and
 * checks the caller owns that folder — a guest and a host sharing an id must
 * not land in the same place.
 */
export const uploadIdentityFile = (
  file: File,
  actorType: "user" | "host",
  actorId: number,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "identity");
  formData.append("entityId", `${actorType}-${actorId}`);
  return apiFetch<{ key: string; url: string }>("/uploads", {
    method: "POST",
    body: formData,
    auth: true,
    authCookie: actorType === "host" ? "host" : "admin",
  });
};

export const getHostIdentity = () =>
  apiFetch<IdentitySummary>("/hosts/identity", { auth: true, authCookie: "host" });

export const submitHostIdentity = (payload: {
  idType: string;
  idNumber: string;
  documentKey: string;
  selfieKey: string;
}) =>
  apiFetch<IdentitySummary>("/hosts/identity", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
    authCookie: "host",
  });

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


// ── Admin Vehicle API ─────────────────────────────────────────

export const getAdminVehicles = (params?: { status?: string; hostId?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.hostId) qs.set("hostId", String(params.hostId));
  const query = qs.toString();
  return adminQuery<{ vehicles: AdminVehicleRow[] }>(`/admin/vehicles${query ? `?${query}` : ""}`);
};

export const getAdminVehicleDetail = (vehicleId: number) =>
  adminQuery<{ vehicle: HostVehicle; host: AdminVehicleRow["host"] }>(`/admin/vehicles/${vehicleId}`);

export const reviewAdminVehicle = (vehicleId: number, action: "approve" | "reject", reviewNotes?: string) =>
  adminQuery<{ vehicle: HostVehicle; status: string }>(`/admin/vehicles/${vehicleId}/review`, {
    method: "PATCH",
    body: JSON.stringify({ action, reviewNotes }),
  });

export const suspendAdminVehicle = (vehicleId: number, reason?: string) =>
  adminQuery<{ vehicle: HostVehicle; status: string }>(`/admin/vehicles/${vehicleId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

export const unsuspendAdminVehicle = (vehicleId: number) =>
  adminQuery<{ vehicle: HostVehicle; status: string }>(`/admin/vehicles/${vehicleId}/unsuspend`, { method: "PATCH" });

export const editAdminVehicle = (vehicleId: number, payload: Partial<HostVehicle>) =>
  adminQuery<{ vehicle: HostVehicle }>(`/admin/vehicles/${vehicleId}/edit`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

/**
 * Premium is the editorial tier that admits a car to the explore video feed.
 * Separate from `status`: publishing is a compliance decision, Premium is a
 * taste decision. Granting requires the vehicle to be published.
 */
export const setAdminVehiclePremium = (
  vehicleId: number,
  isPremium: boolean,
  notes?: string,
) =>
  adminQuery<{ vehicle: HostVehicle; isPremium: boolean }>(
    `/admin/vehicles/${vehicleId}/premium`,
    { method: "PATCH", body: JSON.stringify({ isPremium, notes }) },
  );

// ── Address lookup ─────────────────────────────────────────────────────────
// Both calls go through our backend rather than to Google directly. That is
// what keeps the Maps server key out of this bundle, biases results to Nigeria
// in one place, and lets Place Details be cached.

export type PlaceSuggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

export type ResolvedPlace = {
  placeId: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

/**
 * `sessionToken` must be the same value for every keystroke of one address
 * entry, and must then be passed to `fetchPlaceDetails`. That is what makes
 * Google bill the entry as a single session instead of per request.
 */
export const fetchPlaceSuggestions = (query: string, sessionToken: string) =>
  apiFetch<{ suggestions: PlaceSuggestion[] }>(
    `/places/autocomplete?q=${encodeURIComponent(query)}&sessionToken=${encodeURIComponent(sessionToken)}`,
    { auth: true, authCookie: "host" }
  );

export const fetchPlaceDetails = (placeId: string, sessionToken: string) =>
  apiFetch<{ place: ResolvedPlace }>(
    `/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`,
    { auth: true, authCookie: "host" }
  );

export type ZonePriceBand = {
  tier: number;
  label: string;
  currency: string;
  minNightly: number;
  maxNightly: number;
};

export type ZoneGuidance = {
  /** Null when the address falls outside every zone — most of Lagos is unbanded. */
  zone: { id: number; name: string; slug: string; city: string; tier: number } | null;
  bedrooms: number;
  band: ZonePriceBand | null;
  /** What published listings of this size in the zone actually charge. */
  market: { count: number; minNightly: number; maxNightly: number; medianNightly: number } | null;
};

/**
 * Price guidance for a point. A location with no zone is a normal 200 with a
 * null band, not an error — callers should render "no guidance", not a failure.
 */
export const fetchZoneGuidance = (latitude: number, longitude: number, bedrooms: number) =>
  apiFetch<ZoneGuidance>(
    `/zones/guidance?latitude=${latitude}&longitude=${longitude}&bedrooms=${bedrooms}`,
    { auth: true, authCookie: "host" }
  );
