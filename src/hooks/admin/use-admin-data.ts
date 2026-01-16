import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveHost,
  approveListing,
  approvePayoutRequest,
  completeAdminBooking,
  getAdminAuditLogs,
  getAdminAccounts,
  getAdminBookings,
  getAdminHosts,
  getAdminListingDetail,
  getAdminListings,
  getAdminPayoutRequests,
  getAdminProfile,
  inviteAdminRequest,
  logoutAdminRequest,
  markPayoutAsPaid,
  rejectHost,
  rejectListing,
  rejectPayoutRequest,
  restoreHost,
  restoreListing,
  suspendHost,
  suspendListing,
  updateAdminBookingNotes,
  updateAdminBookingStatus,
} from "@/lib/api-client";
import type {
  AdminAccount,
  AdminAuditLog,
  AdminBookingRow,
  AdminHost,
  AdminListingRow,
  AdminPayoutRequest,
  AdminProfile,
} from "@/types/admin";

export const adminHostsQueryKey = ["admin", "hosts"];
export const adminListingsQueryKey = ["admin", "listings"];
export const adminBookingsQueryKey = ["admin", "bookings"];
export const adminPayoutsQueryKey = ["admin", "payouts"];
export const adminAuditLogsQueryKey = ["admin", "auditLogs"];
export const adminAccountsQueryKey = ["admin", "admins"];
export const adminProfileQueryKey = ["admin", "profile"];

export const useAdminProfileQuery = (enabled = true) =>
  useQuery<AdminProfile | undefined>({
    queryKey: adminProfileQueryKey,
    queryFn: async () => getAdminProfile(),
    enabled,
  });

export const useAdminHostsQuery = () =>
  useQuery<AdminHost[]>({
    queryKey: adminHostsQueryKey,
    queryFn: getAdminHosts,
  });

export const useAdminAccountsQuery = (enabled = true) =>
  useQuery<AdminAccount[]>({
    queryKey: adminAccountsQueryKey,
    queryFn: getAdminAccounts,
    enabled,
  });

export const useAdminListingsQuery = () =>
  useQuery<AdminListingRow[]>({
    queryKey: adminListingsQueryKey,
    queryFn: getAdminListings,
  });

export const useAdminListingDetailQuery = (listingId?: number) =>
  useQuery({
    queryKey: listingId ? ["admin", "listing", listingId] : ["admin", "listing", "unknown"],
    queryFn: () => {
      if (!listingId) throw new Error("Missing listing id");
      return getAdminListingDetail(listingId);
    },
    enabled: Boolean(listingId),
  });

export const useAdminBookingsQuery = () =>
  useQuery<AdminBookingRow[]>({
    queryKey: adminBookingsQueryKey,
    queryFn: getAdminBookings,
  });

export const useAdminPayoutsQuery = () =>
  useQuery<AdminPayoutRequest[]>({
    queryKey: adminPayoutsQueryKey,
    queryFn: getAdminPayoutRequests,
  });

export const useAdminAuditLogsQuery = (limit = 10) =>
  useQuery<AdminAuditLog[]>({
    queryKey: [...adminAuditLogsQueryKey, limit],
    queryFn: () => getAdminAuditLogs({ limit }),
  });

export const useSuspendHostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hostId, reason }: { hostId: number; reason?: string }) =>
      suspendHost(hostId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminHostsQueryKey }),
  });
};

export const useRestoreHostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hostId: number) => restoreHost(hostId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminHostsQueryKey }),
  });
};

export const useApproveHostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hostId, notes }: { hostId: number; notes?: string }) =>
      approveHost(hostId, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminHostsQueryKey }),
  });
};

export const useRejectHostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hostId, reason }: { hostId: number; reason: string }) =>
      rejectHost(hostId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminHostsQueryKey }),
  });
};

export const useApproveListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, reviewNotes }: { listingId: number; reviewNotes?: string }) =>
      approveListing(listingId, reviewNotes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminListingsQueryKey }),
  });
};

export const useRejectListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, reviewNotes }: { listingId: number; reviewNotes?: string }) =>
      rejectListing(listingId, reviewNotes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminListingsQueryKey }),
  });
};

export const useSuspendListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, reason }: { listingId: number; reason?: string }) =>
      suspendListing(listingId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminListingsQueryKey }),
  });
};

export const useRestoreListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => restoreListing(listingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminListingsQueryKey }),
  });
};

export const useInviteAdminMutation = () =>
  useMutation({
    mutationFn: inviteAdminRequest,
  });

export const useUpdateBookingStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      status,
      notes,
    }: {
      bookingId: number;
      status: string;
      notes?: string;
    }) => updateAdminBookingStatus(bookingId, { status, notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey }),
  });
};

export const useUpdateBookingNotesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: number; notes: string }) =>
      updateAdminBookingNotes(bookingId, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey }),
  });
};

export const useCompleteAdminBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => completeAdminBooking(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey }),
  });
};

export const useApprovePayoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: number; notes?: string }) =>
      approvePayoutRequest(requestId, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPayoutsQueryKey }),
  });
};

export const useRejectPayoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason: string }) =>
      rejectPayoutRequest(requestId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPayoutsQueryKey }),
  });
};

export const useMarkPayoutPaidMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reference }: { requestId: number; reference?: string }) =>
      markPayoutAsPaid(requestId, reference),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPayoutsQueryKey }),
  });
};

export const useAdminLogoutMutation = () =>
  useMutation({
    mutationFn: logoutAdminRequest,
  });
