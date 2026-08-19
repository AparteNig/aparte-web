import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SharePage, { type Fact } from "@/components/share/SharePage";
import { getPublicVehicle, vehicleName } from "@/lib/public-content";
import { formatNaira, shareImageUrl, shareUrl } from "@/lib/share";

type Props = { params: Promise<{ id: string }> };

const locationOf = (vehicle: { pickupCity: string | null; pickupCountry: string | null }) =>
  [vehicle.pickupCity, vehicle.pickupCountry].filter(Boolean).join(", ");

/** Title-cases the raw enum values the API stores (`automatic`, `diesel`). */
const titleCase = (value: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getPublicVehicle(id);

  if (!vehicle) {
    return { title: "Vehicle not found | Aparte" };
  }

  const name = vehicleName(vehicle);
  const location = locationOf(vehicle);
  const title = `${name}${location ? ` · ${location}` : ""}`;
  const description = `${formatNaira(vehicle.dailyPrice)} per day${
    vehicle.withDriverAvailable ? ", with or without a driver" : ", self-drive"
  }. Rent it on Aparte.`;
  const image = shareImageUrl("vehicle", vehicle.id);
  const url = shareUrl("vehicle", vehicle.id);

  return {
    title: `${title} | Aparte`,
    description,
    alternates: { canonical: `/vehicle/${vehicle.id}` },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Aparte",
      images: [{ url: image, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function VehicleSharePage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getPublicVehicle(id);

  if (!vehicle) notFound();

  const facts: Fact[] = [
    { label: "Seats", value: String(vehicle.seatCapacity ?? "—") },
    { label: "Transmission", value: titleCase(vehicle.transmission) },
    { label: "Fuel", value: titleCase(vehicle.fuelType) },
    {
      label: "Driver",
      value: vehicle.withDriverAvailable ? "Available" : "Self-drive",
    },
  ];

  return (
    <SharePage
      kind="vehicle"
      title={vehicleName(vehicle)}
      location={locationOf(vehicle)}
      priceLabel={formatNaira(vehicle.dailyPrice)}
      priceUnit="per day"
      imageUrl={shareImageUrl("vehicle", vehicle.id)}
      facts={facts}
      amenities={vehicle.features}
      url={shareUrl("vehicle", vehicle.id)}
    />
  );
}
