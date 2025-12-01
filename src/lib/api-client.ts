import { HOST_AUTH_COOKIE, getAuthCookie } from "@/lib/auth";
import type { HostProfile } from "@/types/host";
import type { HostListing } from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

export const getHostListings = () =>
  apiFetch<{ listings: HostListing[] }>("/hosts/listings", {
    method: "GET",
  });

export const createHostListing = (formData: FormData) =>
  apiFetch<{ listing: HostListing }>("/hosts/listings", {
    method: "POST",
    body: formData,
  });

export const publishHostListing = (listingId: number) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}/publish`, {
    method: "POST",
  });

export const draftHostListing = (listingId: number) =>
  apiFetch<{ listing: HostListing }>(`/hosts/listings/${listingId}/draft`, {
    method: "POST",
  });

export type ListingCalendarBlock = {
  id: number;
  listingId: number;
  startDate: string;
  endDate: string;
  reason: string;
};

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
