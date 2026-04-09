'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addVehicleCalendarBlock,
  addVehiclePhotos,
  createHostVehicle,
  deleteHostVehicle,
  deleteVehicleCalendarBlock,
  deleteVehiclePhoto,
  getHostVehicle,
  getHostVehicles,
  submitHostVehicle,
  updateHostVehicle,
} from '@/lib/api-client';
import type { HostVehicle, VehiclePhotoPayload } from '@/types/vehicle';

export const hostVehiclesQueryKey = ['hostVehicles'];
export const hostVehicleQueryKey = (id: number) => ['hostVehicle', id];

export const useHostVehiclesQuery = (enabled = true) =>
  useQuery<HostVehicle[]>({
    queryKey: hostVehiclesQueryKey,
    queryFn: async () => (await getHostVehicles()).vehicles,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled,
  });

export const useHostVehicleQuery = (vehicleId?: number) =>
  useQuery<HostVehicle>({
    queryKey: vehicleId ? hostVehicleQueryKey(vehicleId) : ['hostVehicle', 'unknown'],
    queryFn: async () => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return (await getHostVehicle(vehicleId)).vehicle;
    },
    enabled: Boolean(vehicleId),
  });

export const useCreateVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<HostVehicle>) => createHostVehicle(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostVehiclesQueryKey }),
  });
};

export const useUpdateVehicleMutation = (vehicleId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<HostVehicle>) => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return updateHostVehicle(vehicleId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostVehiclesQueryKey });
      if (vehicleId) qc.invalidateQueries({ queryKey: hostVehicleQueryKey(vehicleId) });
    },
  });
};

export const useSubmitVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: number) => submitHostVehicle(vehicleId),
    onSuccess: (_, vehicleId) => {
      qc.invalidateQueries({ queryKey: hostVehiclesQueryKey });
      qc.invalidateQueries({ queryKey: hostVehicleQueryKey(vehicleId) });
    },
  });
};

export const useDeleteVehicleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: number) => deleteHostVehicle(vehicleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostVehiclesQueryKey }),
  });
};

export const useAddVehiclePhotosMutation = (vehicleId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photos: VehiclePhotoPayload[]) => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return addVehiclePhotos(vehicleId, photos);
    },
    onSuccess: () => {
      if (vehicleId) qc.invalidateQueries({ queryKey: hostVehicleQueryKey(vehicleId) });
    },
  });
};

export const useDeleteVehiclePhotoMutation = (vehicleId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: number) => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return deleteVehiclePhoto(vehicleId, photoId);
    },
    onSuccess: () => {
      if (vehicleId) qc.invalidateQueries({ queryKey: hostVehicleQueryKey(vehicleId) });
    },
  });
};

export const useAddVehicleCalendarBlockMutation = (vehicleId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { startDate: string; endDate: string; reason?: string }) => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return addVehicleCalendarBlock(vehicleId, payload);
    },
    onSuccess: () => {
      if (vehicleId) qc.invalidateQueries({ queryKey: hostVehicleQueryKey(vehicleId) });
    },
  });
};

export const useDeleteVehicleCalendarBlockMutation = (vehicleId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId: number) => {
      if (!vehicleId) throw new Error('Missing vehicle id');
      return deleteVehicleCalendarBlock(vehicleId, blockId);
    },
    onSuccess: () => {
      if (vehicleId) qc.invalidateQueries({ queryKey: hostVehicleQueryKey(vehicleId) });
    },
  });
};
