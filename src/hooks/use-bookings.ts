"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptHostBooking,
  checkInBooking,
  checkOutBooking,
  completeHostBooking,
  declineHostBooking,
  getBookingsAwaitingApproval,
  getHostBookingDetail,
  getHostBookings,
} from "@/lib/api-client";
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

export const approvalQueueQueryKey = ["hostBookings", "awaitingApproval"];

/**
 * The host's approval queue. Refetches on a short interval because entries
 * expire on their own — a booking the host never answers disappears from here
 * the moment the auto-accept sweep confirms it, and the UI should follow.
 */
export const useApprovalQueueQuery = (enabled = true) =>
  useQuery({
    queryKey: approvalQueueQueryKey,
    queryFn: getBookingsAwaitingApproval,
    enabled,
    refetchInterval: 30_000,
  });

/** Both queues change on any approval action, so invalidate them together. */
const invalidateBookingQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: hostBookingsQueryKey });
  queryClient.invalidateQueries({ queryKey: approvalQueueQueryKey });
};

export const useAcceptBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => acceptHostBooking(bookingId),
    onSuccess: () => invalidateBookingQueries(queryClient),
  });
};

export const useDeclineBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: number; reason: string }) =>
      declineHostBooking(bookingId, reason),
    onSuccess: () => invalidateBookingQueries(queryClient),
  });
};

export const useCheckInBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, code }: { bookingId: number; code: string }) =>
      checkInBooking(bookingId, code),
    onSuccess: () => invalidateBookingQueries(queryClient),
  });
};

/** Ends a stay by redeeming the guest's departure code. */
export const useCheckOutBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, code }: { bookingId: number; code: string }) =>
      checkOutBooking(bookingId, code),
    onSuccess: () => invalidateBookingQueries(queryClient),
  });
};

export const hostBookingQueryKey = (bookingId: number) => ["hostBookings", "detail", bookingId];

export const useHostBookingQuery = (bookingId: number | undefined) =>
  useQuery({
    queryKey: hostBookingQueryKey(bookingId ?? 0),
    queryFn: () => getHostBookingDetail(bookingId!),
    enabled: Number.isInteger(bookingId) && (bookingId ?? 0) > 0,
  });
