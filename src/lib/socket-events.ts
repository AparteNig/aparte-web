export const SOCKET_EVENTS = {
  BOOKING_NEW:     'booking:new',
  BOOKING_UPDATED: 'booking:updated',
  BREAKFAST_REQUESTED: 'breakfast:requested',
  LISTING_UPDATED: 'listing:updated',
  HOST_UPDATED:    'host:updated',
  PAYOUT_NEW:      'payout:new',
  PAYOUT_UPDATED:  'payout:updated',
} as const;

export type BookingNewPayload     = { bookingId: number; guestName: string; listingTitle: string; hostId: number };
export type BookingUpdatedPayload = { bookingId: number; status: string; guestName: string; hostId: number };
export type BreakfastRequestedPayload = {
  breakfastRequestId: number;
  bookingId: number;
  hostId: number;
  guestName: string;
  listingTitle: string;
  meal: string;
  deliveryTime: string;
  quantity: number;
};
export type ListingUpdatedPayload = { listingId: number; title: string; status: string; hostId: number };
export type HostUpdatedPayload    = { hostId: number; name: string; status: string };
export type PayoutNewPayload      = { payoutId: number; hostId: number; amount: number };
export type PayoutUpdatedPayload  = { payoutId: number; hostId: number; status: string };
