"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addListingPhotos,
  createHostListing,
  deleteHostListing,
  deleteListingPhoto,
  draftHostListing,
  getHostListing,
  getHostListings,
  publishHostListing,
  updateHostListing,
} from "@/lib/api-client";
import type { HostListing, HostListingDetail, ListingPhotoPayload } from "@/types/listing";

export const hostListingsQueryKey = ["hostListings"];
export const hostListingQueryKey = (listingId: number) => ["hostListing", listingId];

export const useHostListingsQuery = () =>
  useQuery<HostListing[]>({
    queryKey: hostListingsQueryKey,
    queryFn: async () => {
      const data = await getHostListings();
      return data.listings;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

export const useHostListingQuery = (listingId?: number) =>
  useQuery<HostListingDetail>({
    queryKey: listingId ? hostListingQueryKey(listingId) : ["hostListing", "unknown"],
    queryFn: async () => {
      if (!listingId) {
        throw new Error("Missing listing id");
      }
      const data = await getHostListing(listingId);
      return data.listing;
    },
    enabled: Boolean(listingId),
  });

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

export const useDeleteListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => deleteHostListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
    },
  });
};

export const useUpdateListingMutation = (listingId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<
        Pick<
          HostListing,
          | "title"
          | "summary"
          | "description"
          | "addressLine1"
          | "addressLine2"
          | "city"
          | "state"
          | "country"
          | "postalCode"
          | "nightlyPrice"
          | "cleaningFee"
          | "serviceFee"
          | "maxGuests"
          | "bedrooms"
          | "bathrooms"
          | "amenities"
          | "houseRules"
          | "minNights"
          | "maxNights"
        >
      >,
    ) => {
      if (!listingId) {
        throw new Error("Missing listing id");
      }
      return updateHostListing(listingId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: hostListingQueryKey(listingId) });
      }
    },
  });
};

export const useAttachListingPhotosMutation = (listingId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photos: ListingPhotoPayload[]) => {
      if (!listingId) {
        throw new Error("Missing listing id");
      }
      return addListingPhotos(listingId, photos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: hostListingQueryKey(listingId) });
      }
    },
  });
};

export const useDeleteListingPhotoMutation = (listingId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: number) => {
      if (!listingId) {
        throw new Error("Missing listing id");
      }
      return deleteListingPhoto(listingId, photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostListingsQueryKey });
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: hostListingQueryKey(listingId) });
      }
    },
  });
};
