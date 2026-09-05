"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Trip, TransportAssignment } from "@/types/api";

interface TransporterEarningsSummary {
  totalTripsCompleted: number;
  totalEarningsCash: number;
}

export const useTransporterDashboard = () => {
  const [requests, setRequests] = useState<TransportAssignment[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [earnings, setEarnings] = useState<TransporterEarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [reqRes, tripsRes, earnRes] = await Promise.all([
          getData<TransportAssignment[]>(`${ENDPOINTS.TRIPS.MY_REQUESTS}?limit=10`, { showErrorToast: false }),
          getData<Trip[]>(`${ENDPOINTS.TRIPS.MY_ACTIVE}?limit=20`, { showErrorToast: false }),
          getData<TransporterEarningsSummary>(ENDPOINTS.PAYMENTS.MY_EARNINGS, { showErrorToast: false }),
        ]);

        if (reqRes.success && Array.isArray(reqRes.data)) {
          setRequests(reqRes.data);
        }
        if (tripsRes.success && Array.isArray(tripsRes.data)) {
          setAllTrips(tripsRes.data);
        }
        if (earnRes.success && earnRes.data) {
          setEarnings(earnRes.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const activeTrips = allTrips.filter((t) =>
    ["ASSIGNED", "ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(t.status)
  );

  const completedTrips = allTrips.filter((t) =>
    ["DELIVERED", "CANCELLED"].includes(t.status)
  );

  return {
    requests,
    allTrips,
    activeTrips,
    completedTrips,
    earnings,
    isLoading,
  };
};
