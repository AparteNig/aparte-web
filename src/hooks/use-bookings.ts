"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeHostBooking, getHostBookings } from "@/lib/api-client";
import type { HostBooking, HostBookingsSummary } from "@/types/listing";

export const hostBookingsQueryKey = ["hostBookings"];

type HostBookingsResponse = {
  bookings: HostBooking[];
  summary: HostBookingsSummary;
};

export const useHostBookingsQuery = (enabled = true) =>
  useQuery<HostBookingsResponse>({
    queryKey: hostBookingsQueryKey,
    queryFn: async () => {
      const data = await getHostBookings();
      return { bookings: data.bookings, summary: data.summary };
    },
    enabled,
  });

export const useCompleteBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => completeHostBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostBookingsQueryKey });
    },
  });
};
