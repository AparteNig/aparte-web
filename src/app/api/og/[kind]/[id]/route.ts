import { NextResponse } from "next/server";
import {
  getPublicListing,
  getPublicVehicle,
  primaryPhotoUrl,
} from "@/lib/public-content";

/**
 * Stable preview image for a shared link.
 *
 * S3 photo URLs are presigned and expire. Social platforms scrape the image
 * once at share time and cache it, so embedding a presigned URL directly gives
 * a card that renders for an hour and then breaks permanently — long after
 * anyone would think to check.
 *
 * This route is a permanent address that re-resolves a fresh signed URL on
 * every request and streams the bytes back, so the URL inside the card never
 * goes stale.
 */

export const revalidate = 300;

const isSupportedKind = (kind: string): kind is "listing" | "vehicle" =>
  kind === "listing" || kind === "vehicle";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const { kind, id } = await params;

  if (!isSupportedKind(kind)) {
    return NextResponse.json({ message: "unsupported kind" }, { status: 404 });
  }

  const photos =
    kind === "listing"
      ? (await getPublicListing(id))?.photos
      : (await getPublicVehicle(id))?.photos;

  const source = primaryPhotoUrl(photos);
  if (!source) {
    // Fall back to the logo so the card still renders something branded
    // rather than a broken-image icon.
    return NextResponse.redirect(new URL("/icon.png", process.env.NEXT_PUBLIC_SITE_URL ?? "https://stayaparte.com"));
  }

  try {
    const upstream = await fetch(source, { next: { revalidate } });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ message: "image unavailable" }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Long public cache: the bytes for a given photo do not change, and
        // scrapers re-request this far more often than the photo is replaced.
        "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ message: "image unavailable" }, { status: 502 });
  }
}
