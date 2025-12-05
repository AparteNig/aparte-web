import { HOST_AUTH_COOKIE, clearAuthCookie, getAuthCookie } from "@/lib/auth";
import type { HostProfile } from "@/types/host";
import type {
  HostBooking,
  HostBookingsSummary,
  HostListing,
  HostListingDetail,
  ListingCalendarBlock,
} from "@/types/listing";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://humble-liberation-staging.up.railway.app";

type ApiFetchOptions = RequestInit & { auth?: boolean };

const isFormData = (body: BodyInit | null | undefined): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const buildUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (!isFormData(rest.body) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAuthCookie(HOST_AUTH_COOKIE);
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
      clearAuthCookie(HOST_AUTH_COOKIE);
      if (!window.location.pathname.startsWith("/host/login")) {
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

export type HostAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

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

export const verifyOtpRequest = (payload: {
  otpId: number;
  code: string;
  device?: { type?: "web" | "android" | "ios"; ipAddress?: string };
}) =>
  apiFetch<{ tokens: HostAuthTokens; hostProfile?: HostProfile }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

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
  payload: Partial<Pick<HostListing, "title" | "summary" | "description" | "addressLine1" | "addressLine2" | "city" | "state" | "country" | "postalCode" | "nightlyPrice" | "cleaningFee" | "serviceFee" | "maxGuests" | "bedrooms" | "bathrooms" | "amenities" | "houseRules" | "minNights" | "maxNights">>,
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
