"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addListingBlackout, deleteListingBlackout, getListingCalendar } from "@/lib/api-client";
import type { ListingCalendarBlock } from "@/types/listing";

export const listingCalendarKey = (listingId: number, month?: string) => [
  "listingCalendar",
  listingId,
  month ?? "current",
];

export const useListingCalendarQuery = (listingId?: number, month?: string) => {
  const queryKey = listingId ? listingCalendarKey(listingId, month) : ["listingCalendar", "inactive"];
  return useQuery<ListingCalendarBlock[]>({
    queryKey,
    queryFn: async () => {
      if (!listingId) return [];
      const data = await getListingCalendar(listingId, month);
      return data.blocks;
    },
    enabled: Boolean(listingId),
  });
};

export const useAddBlackoutMutation = (
  listingId?: number,
  month?: string,
  options?: { onSuccess?: () => void; onError?: () => void },
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { startDate: string; endDate: string; reason?: string }) => {
      if (!listingId) {
        throw new Error("Select a listing first");
      }
      return addListingBlackout(listingId, payload);
    },
    onSuccess: () => {
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: listingCalendarKey(listingId, month) });
      }
      options?.onSuccess?.();
    },
    onError: () => {
      options?.onError?.();
    },
  });
};

export const useDeleteBlackoutMutation = (
  listingId?: number,
  month?: string,
  options?: { onSuccess?: () => void; onError?: () => void },
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: number) => {
      if (!listingId) {
        throw new Error("Select a listing first");
      }
      return deleteListingBlackout(listingId, blockId);
    },
    onSuccess: () => {
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: listingCalendarKey(listingId, month) });
      }
      options?.onSuccess?.();
    },
    onError: () => {
      options?.onError?.();
    },
  });
};
