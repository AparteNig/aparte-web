import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SharePage, { type Fact } from "@/components/share/SharePage";
import { getPublicListing } from "@/lib/public-content";
import { formatNaira, shareImageUrl, shareUrl } from "@/lib/share";

type Props = { params: Promise<{ id: string }> };

// The named area beats city when we have one: every listing is in Lagos now,
// so "Lagos, Lagos, Nigeria" is accurate and says nothing, while "Lekki Phase 1"
// is what a guest actually recognises. This text is also the og:title suffix,
// so it is what a shared link shows.
const locationOf = (listing: {
  city: string | null;
  state: string | null;
  country: string | null;
  zone?: { name: string } | null;
}) => [listing.zone?.name ?? listing.city, listing.state, listing.country].filter(Boolean).join(", ");

/**
 * Metadata is what a shared link actually looks like in WhatsApp, iMessage or
 * Twitter — for most recipients it is the entire experience, since many never
 * open the page. So it carries the real title, price and photo rather than the
 * site-wide defaults.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getPublicListing(id);

  if (!listing) {
    return { title: "Listing not found | Aparte" };
  }

  const location = locationOf(listing);
  const title = `${listing.title}${location ? ` · ${location}` : ""}`;
  const description =
    listing.summary?.trim() ||
    listing.description?.trim()?.slice(0, 200) ||
    `${formatNaira(listing.nightlyPrice)} per night on Aparte.`;
  const image = shareImageUrl("listing", listing.id);
  const url = shareUrl("listing", listing.id);

  return {
    title: `${title} | Aparte`,
    description,
    alternates: { canonical: `/listing/${listing.id}` },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Aparte",
      images: [{ url: image, width: 1200, height: 630, alt: listing.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ListingSharePage({ params }: Props) {
  const { id } = await params;
  const listing = await getPublicListing(id);

  // Unpublished and missing listings are indistinguishable here on purpose —
  // the API already collapses both to 404 so a shared link cannot be used to
  // probe for the existence of a draft.
  if (!listing) notFound();

  const facts: Fact[] = [
    { label: "Guests", value: String(listing.maxGuests ?? "—") },
    { label: "Bedrooms", value: String(listing.bedrooms ?? "—") },
    { label: "Bathrooms", value: String(listing.bathrooms ?? "—") },
    { label: "Per night", value: formatNaira(listing.nightlyPrice) },
  ];

  return (
    <SharePage
      kind="listing"
      title={listing.title}
      location={locationOf(listing)}
      priceLabel={formatNaira(listing.nightlyPrice)}
      priceUnit="per night"
      imageUrl={shareImageUrl("listing", listing.id)}
      description={listing.summary?.trim() || listing.description}
      facts={facts}
      amenities={listing.amenities}
      rating={listing.avgRating}
      reviewCount={listing.reviewCount}
      url={shareUrl("listing", listing.id)}
    />
  );
}
