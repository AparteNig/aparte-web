"use client";

import { useEffect, useState } from "react";

export const useLocation = () => {
  const [address, setAddress] = useState("Address not found");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const handleSuccess = (position: GeolocationPosition) => {
      if (!active) return;
      const { latitude, longitude } = position.coords;
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      setError(null);
      setIsLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      if (!active) return;
      setError(err.message);
      setIsLoading(false);
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, []);

  return { address, error, isLoading };
};
