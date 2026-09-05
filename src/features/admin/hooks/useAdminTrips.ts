"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Trip } from "@/types/api";

export const useAdminTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await getData<Trip[]>(ENDPOINTS.TRIPS.ADMIN_ALL, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setTrips(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    isLoading,
    refetch: fetchTrips,
  };
};
