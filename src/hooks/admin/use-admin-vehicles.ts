'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  editAdminVehicle,
  getAdminVehicleDetail,
  getAdminVehicles,
  reviewAdminVehicle,
  suspendAdminVehicle,
  unsuspendAdminVehicle,
} from '@/lib/api-client';
import type { AdminVehicleRow, HostVehicle } from '@/types/vehicle';

export const adminVehiclesQueryKey = ['adminVehicles'];
export const adminVehicleQueryKey = (id: number) => ['adminVehicle', id];

export const useAdminVehiclesQuery = (params?: { status?: string; hostId?: number }) =>
  useQuery<AdminVehicleRow[]>({
    queryKey: [...adminVehiclesQueryKey, params],
    queryFn: async () => (await getAdminVehicles(params)).vehicles,
    staleTime: 1000 * 60 * 2,
  });

export const useAdminVehicleQuery = (vehicleId?: number) =>
  useQuery({
    queryKey: vehicleId ? adminVehicleQueryKey(vehicleId) : ['adminVehicle', 'unknown'],
    queryFn: async () => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return getAdminVehicleDetail(vehicleId);
    },
    enabled: Boolean(vehicleId),
  });

export const useReviewVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, action, reviewNotes }: { vehicleId: number; action: 'approve' | 'reject'; reviewNotes?: string }) =>
      reviewAdminVehicle(vehicleId, action, reviewNotes),
    onSuccess: (_, { vehicleId }) => {
      qc.invalidateQueries({ queryKey: adminVehiclesQueryKey });
      qc.invalidateQueries({ queryKey: adminVehicleQueryKey(vehicleId) });
    },
  });
};

export const useSuspendVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, reason }: { vehicleId: number; reason?: string }) =>
      suspendAdminVehicle(vehicleId, reason),
    onSuccess: (_, { vehicleId }) => {
      qc.invalidateQueries({ queryKey: adminVehiclesQueryKey });
      qc.invalidateQueries({ queryKey: adminVehicleQueryKey(vehicleId) });
    },
  });
};

export const useUnsuspendVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: number) => unsuspendAdminVehicle(vehicleId),
    onSuccess: (_, vehicleId) => {
      qc.invalidateQueries({ queryKey: adminVehiclesQueryKey });
      qc.invalidateQueries({ queryKey: adminVehicleQueryKey(vehicleId) });
    },
  });
};

export const useEditAdminVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: number; payload: Partial<HostVehicle> }) =>
      editAdminVehicle(vehicleId, payload),
    onSuccess: (_, { vehicleId }) => {
      qc.invalidateQueries({ queryKey: adminVehiclesQueryKey });
      qc.invalidateQueries({ queryKey: adminVehicleQueryKey(vehicleId) });
    },
  });
};
