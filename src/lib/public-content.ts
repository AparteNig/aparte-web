/**
 * Server-side reads of the public catalogue, for the share landing pages.
 *
 * These call the API directly rather than going through `api-client`, because
 * that module is written for the browser (cookies, token refresh) and these run
 * during server rendering where none of that applies. Both endpoints are
 * unauthenticated by design — they are what a stranger following a shared link
 * is allowed to see.
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export type PublicPhoto = { id: number; url: string | null; caption: string | null };

export type PublicListing = {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  /** Named area, e.g. "Lekki Phase 1". Detail route only; null where unzoned. */
  zone?: { name: string; slug: string; tier: number } | null;
  nightlyPrice: number;
  currency: string | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[] | null;
  avgRating: number | null;
  reviewCount: number | null;
  photos: PublicPhoto[] | null;
};

export type PublicVehicle = {
  id: number;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  transmission: string | null;
  fuelType: string | null;
  seatCapacity: number | null;
  dailyPrice: number;
  pickupCity: string | null;
  pickupCountry: string | null;
  withDriverAvailable: boolean | null;
  features: string[] | null;
  photos: PublicPhoto[] | null;
};

/**
 * Revalidate rather than cache forever: a listing's price or photos can change,
 * and a shared link should not show last week's figure. Five minutes is short
 * enough to stay honest and long enough that a link doing the rounds does not
 * hammer the API.
 */
const REVALIDATE_SECONDS = 300;

const fetchPublic = async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // A dead API must render "not found", never a 500 page — the link is still
    // a public URL that strangers will open.
    return null;
  }
};

export const getPublicListing = async (id: string): Promise<PublicListing | null> => {
  const data = await fetchPublic<{ listing: PublicListing }>(`/listings/${id}`);
  return data?.listing ?? null;
};

export const getPublicVehicle = async (id: string): Promise<PublicVehicle | null> => {
  const data = await fetchPublic<{ vehicle: PublicVehicle }>(
    `/customer/vehicle-bookings/vehicles/${id}`,
  );
  return data?.vehicle ?? null;
};

/** First usable photo, or null when the record has none. */
export const primaryPhotoUrl = (photos: PublicPhoto[] | null | undefined) =>
  photos?.find((photo) => !!photo.url)?.url ?? null;

export const vehicleName = (vehicle: PublicVehicle) =>
  [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ").trim() || "Vehicle";
