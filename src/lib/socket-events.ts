export const SOCKET_EVENTS = {
  BOOKING_NEW:     'booking:new',
  BOOKING_UPDATED: 'booking:updated',
  /** To the host: a paid booking needs an answer before the window closes. */
  BOOKING_APPROVAL_REQUIRED: 'booking:approval-required',
  BOOKING_CHECKED_IN: 'booking:checked-in',
  BREAKFAST_REQUESTED: 'breakfast:requested',
  LISTING_UPDATED: 'listing:updated',
  HOST_UPDATED:    'host:updated',
  PAYOUT_NEW:      'payout:new',
  PAYOUT_UPDATED:  'payout:updated',
} as const;

export type BookingNewPayload = {
  bookingId: number;
  guestName: string;
  /** The vehicle's description for car rentals — "2021 Lexus RX 350". */
  listingTitle: string;
  kind: 'stay' | 'vehicle';
  hostId: number;
};
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

export type BookingApprovalRequiredPayload = {
  bookingId: number;
  hostId: number;
  guestName: string;
  stayTitle: string;
  approvalDueAt: string;
  kind: 'listing' | 'vehicle';
};
