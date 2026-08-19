/**
 * One place that knows a booking is either a stay or a car rental.
 *
 * The `bookings` table serves both, so every consumer has to branch somewhere.
 * Doing it ad hoc is what let `booking.listing.title` ship as an unguarded read
 * — a rental has no listing, and the whole list crashed on the first car.
 * Read subjects and labels through these helpers instead of touching
 * `listing`/`vehicle` directly.
 */

type BookingLike = {
  id?: number | string;
  vehicleId?: number | string | null;
  listing?: { title?: string | null; city?: string | null; country?: string | null } | null;
  vehicle?: {
    make?: string | null;
    model?: string | null;
    year?: number | null;
    pickupCity?: string | null;
    pickupCountry?: string | null;
  } | null;
};

export type BookingKind = "vehicle" | "listing";

export const bookingKind = (booking: BookingLike): BookingKind =>
  booking.vehicle || booking.vehicleId ? "vehicle" : "listing";

export const isVehicleBooking = (booking: BookingLike) => bookingKind(booking) === "vehicle";

/** "2021 Lexus GX" or the listing title. Never throws on a missing side. */
export const bookingSubject = (booking: BookingLike) => {
  if (booking.listing?.title) return booking.listing.title;
  if (booking.vehicle) {
    const label = [booking.vehicle.year, booking.vehicle.make, booking.vehicle.model]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (label) return label;
  }
  return booking.id ? `Booking #${booking.id}` : "Booking";
};

/** "Lagos, Nigeria" for either kind, or "" when unknown. */
export const bookingLocation = (booking: BookingLike) => {
  const parts = isVehicleBooking(booking)
    ? [booking.vehicle?.pickupCity, booking.vehicle?.pickupCountry]
    : [booking.listing?.city, booking.listing?.country];
  return parts.filter(Boolean).join(", ");
};

/**
 * Vocabulary per booking kind. A car rental is not a stay, and calling a
 * handover "check-in" makes hosts hesitate over which button starts the hire.
 */
export const BOOKING_COPY = {
  vehicle: {
    noun: "rental",
    Noun: "Rental",
    detailsHeading: "Rental Details",
    startLabel: "Pickup",
    endLabel: "Return",
    startCaption: "PICKUP",
    endCaption: "RETURN",
    unit: "day",
    codeName: "pickup code",
    CodeName: "Pickup code",
    codeHeading: "Your pickup code",
    /** Redeeming the code starts the hire. */
    startAction: "Start the engine",
    startActionPending: "Starting…",
    startPrompt: "Enter the renter's pickup code",
    codeHint:
      "Give this to the owner or an Aparte admin at pickup. Your rental starts once it's entered — don't share it before you get there.",
    declinePlaceholder: "e.g. the car is in for servicing",
    locationLabel: "Pickup location",
  },
  listing: {
    noun: "stay",
    Noun: "Stay",
    detailsHeading: "Stay Details",
    startLabel: "Check-in",
    endLabel: "Check-out",
    startCaption: "CHECK-IN",
    endCaption: "CHECK-OUT",
    unit: "night",
    codeName: "check-in code",
    CodeName: "Check-in code",
    codeHeading: "Your check-in code",
    startAction: "Start the stay",
    startActionPending: "Starting…",
    startPrompt: "Enter the guest's check-in code",
    codeHint:
      "Give this code to the host or an Aparte admin when you arrive. Your stay starts once it's entered — don't share it before you get there.",
    declinePlaceholder: "e.g. the unit is already occupied",
    locationLabel: "Location",
  },
} as const;

export const bookingCopy = (booking: BookingLike) => BOOKING_COPY[bookingKind(booking)];

/** "3 days" / "1 night", pluralised. */
export const bookingDuration = (booking: BookingLike, count: number) => {
  const { unit } = bookingCopy(booking);
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
};
