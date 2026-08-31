"use client";

import { useEffect, useState } from "react";

import { fetchZoneGuidance, type ZoneGuidance } from "@/lib/api-client";

/**
 * Shows a host what places in this area typically cost, next to the field
 * where they set their price.
 *
 * This is guidance and never a gate. Nothing here blocks a save, changes a
 * value, or marks a price wrong — a host who knows their property better than
 * our band does is free to ignore it. The band exists because most hosts have
 * no reference point at all, and an anchor beats a blank box.
 *
 * A location outside every zone renders nothing rather than an empty state:
 * most of Lagos is deliberately unbanded, and a permanent "no data" panel
 * would read as something being broken.
 */

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

type Props = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  bedrooms: number;
  /** The price currently typed, so the hint can react to it. */
  nightlyPrice: number | null;
};

export default function ZonePriceGuidance({
  latitude,
  longitude,
  bedrooms,
  nightlyPrice,
}: Props) {
  const [guidance, setGuidance] = useState<ZoneGuidance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setGuidance(null);
      return;
    }

    // A stale response from a previous address must not overwrite a newer one,
    // so each run marks itself cancelled when its inputs change.
    let cancelled = false;
    setLoading(true);

    fetchZoneGuidance(latitude, longitude, bedrooms)
      .then((data) => {
        if (!cancelled) setGuidance(data);
      })
      .catch(() => {
        // Guidance is advisory. If the lookup fails the host still has a
        // working price field, so this stays silent rather than raising.
        if (!cancelled) setGuidance(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, bedrooms]);

  if (latitude == null || longitude == null) return null;
  if (loading && !guidance) {
    return (
      <p className="text-xs text-slate-500" aria-live="polite">
        Checking prices in this area…
      </p>
    );
  }
  if (!guidance?.zone || !guidance.band) return null;

  const { zone, band, market } = guidance;
  const below = nightlyPrice != null && nightlyPrice > 0 && nightlyPrice < band.minNightly;
  const above = nightlyPrice != null && nightlyPrice > band.maxNightly;
  const outside = below || above;

  return (
    <div
      className={`space-y-1 rounded-lg border px-3 py-2 text-xs ${
        outside ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"
      }`}
      aria-live="polite"
    >
      <p className="font-semibold text-slate-800">
        {zone.name}
        <span className="ml-1.5 font-normal text-slate-500">
          {band.label} area
        </span>
      </p>
      <p className="text-slate-600">
        Typical for {bedrooms === 0 ? "a studio" : `${bedrooms}-bed`} here:{" "}
        <span className="font-semibold text-slate-800">
          {naira.format(band.minNightly)} – {naira.format(band.maxNightly)}
        </span>{" "}
        a night
      </p>
      {market && market.count > 0 && (
        <p className="text-slate-500">
          {market.count} similar {market.count === 1 ? "listing" : "listings"} nearby,
          around {naira.format(market.medianNightly)}
        </p>
      )}
      {outside && (
        <p className="font-medium text-amber-800">
          {below
            ? "That is below what this area usually charges — you may be underpricing."
            : "That is above what this area usually charges. It is allowed, but expect fewer bookings."}
        </p>
      )}
    </div>
  );
}
