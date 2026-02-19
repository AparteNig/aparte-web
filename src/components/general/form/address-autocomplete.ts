"use client";

type PlacesAutocompleteCleanup = () => void;

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
  loaderPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
  await loaderPromise;
};

export const attachPlacesAutocomplete = async (
  input: HTMLInputElement | null,
  onSelect?: (formatted: string) => void
): Promise<PlacesAutocompleteCleanup | null> => {
  if (!input) return null;
  await loadGooglePlaces();
  if (!(window as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
    return null;
  }
  const googleMaps = (window as unknown as { google?: any }).google;
  if (!googleMaps?.maps?.places?.Autocomplete) {
    return null;
  }
  const autocomplete = new googleMaps.maps.places.Autocomplete(input, {
    types: ["address"],
    fields: ["formatted_address", "address_components", "geometry", "name"],
  });
  const listener = autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    const formatted =
      place?.formatted_address || place?.name || input.value;
    if (formatted) {
      input.value = formatted;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      onSelect?.(formatted);
      window.setTimeout(() => {
        input.blur();
      }, 0);
    }
  });
  return () => listener.remove();
};
