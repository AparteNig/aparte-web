'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getHostProfile, updateHostProfileSection, uploadHostAvatar } from '@/lib/api-client';
import type { HostProfile } from '@/types/host';

export const hostProfileQueryKey = ['hostProfile'];

export const useHostProfileQuery = () =>
  useQuery<HostProfile>({
    queryKey: hostProfileQueryKey,
    queryFn: async () => {
      const data = await getHostProfile();
      return data.hostProfile;
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && /401|forbidden/i.test(error.message)) {
        return false;
      }
      return failureCount < 2;
    },
  });

export const useUpdateHostProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateHostProfileSection,
    onSuccess: (data) => {
      queryClient.setQueryData(hostProfileQueryKey, data.hostProfile);
    },
  });
};

export const useUploadHostAvatarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadHostAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(hostProfileQueryKey, data.hostProfile);
    },
  });
};
