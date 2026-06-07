"use client";

type PlacesAutocompleteCleanup = () => void;

export interface PlaceResult {
  formatted: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

let loaderPromise: Promise<void> | null = null;

const getGoogleMapsKey = () =>
  process.env.NEXT_PUBLIC_GOOGLEMAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLEMAP_API_KEY ??
  "";

const loadGooglePlaces = async () => {
  if (typeof window === "undefined") return;
  const key = getGoogleMapsKey();
  if (!key) return;
  if ((window as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
    return;
  }
  if (loaderPromise) {
    await loaderPromise;
    return;
  }
  loaderPromise = new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => {
      // Google Maps failed to load (billing, network, etc.) — degrade silently
      loaderPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });
  await loaderPromise;
};

function getComponent(components: any[], type: string): string {
  const match = components.find((c: any) => c.types?.includes(type));
  return match?.long_name ?? "";
}

function parsePlaceResult(place: any, inputValue: string): PlaceResult {
  const components = place?.address_components ?? [];
  const streetNumber = getComponent(components, "street_number");
  const route = getComponent(components, "route");
  const addressLine1 = [streetNumber, route].filter(Boolean).join(" ") || place?.name || inputValue;
  const city =
    getComponent(components, "locality") ||
    getComponent(components, "administrative_area_level_2") ||
    getComponent(components, "sublocality_level_1");
  const state = getComponent(components, "administrative_area_level_1");
  const country = getComponent(components, "country");
  const postalCode = getComponent(components, "postal_code");

  return {
    formatted: place?.formatted_address || place?.name || inputValue,
    addressLine1,
    city,
    state,
    country,
    postalCode,
  };
}

export const attachPlacesAutocomplete = async (
  input: HTMLInputElement | null,
  onSelect?: (formatted: string, place: PlaceResult) => void
): Promise<PlacesAutocompleteCleanup | null> => {
  if (!input) return null;
  try {
    await loadGooglePlaces();
  } catch {
    // Google Maps unavailable — input remains a plain text field
    return null;
  }
  const googleMaps = (window as unknown as { google?: { maps?: { places?: { Autocomplete?: unknown } } } }).google;
  if (!googleMaps?.maps?.places?.Autocomplete) {
    return null;
  }
  try {
    const autocomplete = new (googleMaps.maps.places.Autocomplete as any)(input, {
      types: ["address"],
      fields: ["formatted_address", "address_components", "geometry", "name"],
    });
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const parsed = parsePlaceResult(place, input.value);
      if (parsed.formatted) {
        input.value = parsed.addressLine1;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        onSelect?.(parsed.formatted, parsed);
        window.setTimeout(() => {
          input.blur();
        }, 0);
      }
    });
    return () => listener.remove();
  } catch {
    // Autocomplete init failed (billing error, etc.) — degrade to plain input
    return null;
  }
};
