"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConversationSocketContext } from "@/contexts/ConversationSocketContext";
import {
  SOCKET_EVENTS,
  type BookingNewPayload,
  type BookingUpdatedPayload,
  type ListingUpdatedPayload,
  type HostUpdatedPayload,
  type PayoutNewPayload,
  type PayoutUpdatedPayload,
} from "@/lib/socket-events";
import { hostBookingsQueryKey } from "@/hooks/use-bookings";
import { hostListingsQueryKey } from "@/hooks/use-host-listings";

export function useDashboardEvents(entityType: "host" | "admin"): void {
  const { socket } = useConversationSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const onBookingNew = (payload: BookingNewPayload) => {
      queryClient.invalidateQueries({ queryKey: hostBookingsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["hostVehicleBookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      if (entityType === "host") {
        toast.success(`New booking from ${payload.guestName}`);
      } else {
        toast.success(`New booking — ${payload.listingTitle}`);
      }
    };

    const onBookingUpdated = (payload: BookingUpdatedPayload) => {
      queryClient.invalidateQueries({ queryKey: hostBookingsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["hostVehicleBookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      if (entityType === "host") {
        toast(`Booking ${payload.status}`);
      } else {
        toast(`Booking updated — ${payload.guestName}`);
      }
    };

    const onListingUpdated = (payload: ListingUpdatedPayload) => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      if (entityType === "host") {
        toast(`Listing ${payload.status} — ${payload.title}`);
      } else {
        toast(`Listing ${payload.title} — ${payload.status}`);
      }
    };

    const onHostUpdated = (payload: HostUpdatedPayload) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hosts"] });
      if (entityType === "admin") {
        toast(`Host ${payload.name} — ${payload.status}`);
      }
    };

    const onPayoutNew = (payload: PayoutNewPayload) => {
      queryClient.invalidateQueries({ queryKey: ["host", "payout-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
      if (entityType === "host") {
        toast("Payout request received");
      } else {
        toast(`New payout request — ₦${payload.amount.toLocaleString("en-NG")}`);
      }
    };

    const onPayoutUpdated = (payload: PayoutUpdatedPayload) => {
      queryClient.invalidateQueries({ queryKey: ["host", "payout-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
      if (entityType === "host") {
        toast(`Payout ${payload.status}`);
      } else {
        toast(`Payout request ${payload.status}`);
      }
    };

    socket.on(SOCKET_EVENTS.BOOKING_NEW, onBookingNew);
    socket.on(SOCKET_EVENTS.BOOKING_UPDATED, onBookingUpdated);
    socket.on(SOCKET_EVENTS.LISTING_UPDATED, onListingUpdated);
    socket.on(SOCKET_EVENTS.HOST_UPDATED, onHostUpdated);
    socket.on(SOCKET_EVENTS.PAYOUT_NEW, onPayoutNew);
    socket.on(SOCKET_EVENTS.PAYOUT_UPDATED, onPayoutUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.BOOKING_NEW, onBookingNew);
      socket.off(SOCKET_EVENTS.BOOKING_UPDATED, onBookingUpdated);
      socket.off(SOCKET_EVENTS.LISTING_UPDATED, onListingUpdated);
      socket.off(SOCKET_EVENTS.HOST_UPDATED, onHostUpdated);
      socket.off(SOCKET_EVENTS.PAYOUT_NEW, onPayoutNew);
      socket.off(SOCKET_EVENTS.PAYOUT_UPDATED, onPayoutUpdated);
    };
  }, [socket, entityType, queryClient]);
}
