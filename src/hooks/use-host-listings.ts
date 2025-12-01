"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHostListing,
  draftHostListing,
  getHostListings,
  publishHostListing,
} from "@/lib/api-client";
import type { HostListing } from "@/types/listing";

export const hostListingsQueryKey = ["hostListings"];

export const useHostListingsQuery = () =>
  useQuery<HostListing[]>({
    queryKey: hostListingsQueryKey,
    queryFn: async () => {
      const data = await getHostListings();
      return data.listings;
    },
  });

export const useCreateListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createHostListing(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
    },
  });
};

export const usePublishListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => publishHostListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
    },
  });
};

export const useMoveListingToDraftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => draftHostListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
    },
  });
};
