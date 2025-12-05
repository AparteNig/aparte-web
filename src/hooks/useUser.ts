"use client";

import { useCallback, useMemo } from "react";

type UserDetails = {
  fullName?: string;
  email?: string;
};

const useUser = () => {
  const userDetails = useMemo<UserDetails | null>(() => null, []);
  const profileImage: string | null = null;

  const logoutUser = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/host/login";
    }
  }, []);

  return { userDetails, profileImage, logoutUser };
};

export default useUser;
