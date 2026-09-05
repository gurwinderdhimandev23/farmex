"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Trip } from "@/types/api";

export const useTransporterTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await getData<Trip[]>(ENDPOINTS.TRIPS.MY_ACTIVE, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setTrips(res.data);
        const hasActive = res.data.some((t) =>
          ["ASSIGNED", "ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(t.status)
        );
        const hasCompleted = res.data.some((t) => ["DELIVERED", "CANCELLED"].includes(t.status));
        
        // Smart tab selection: default to ACTIVE if active trips exist, otherwise COMPLETED or ALL
        if (!hasActive && hasCompleted) {
          setActiveTab("COMPLETED");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const activeTrips = trips.filter((t) =>
    ["ASSIGNED", "ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(t.status)
  );
  const completedTrips = trips.filter((t) => ["DELIVERED", "CANCELLED"].includes(t.status));

  let displayedTrips = trips;
  if (activeTab === "ACTIVE") {
    displayedTrips = activeTrips;
  } else if (activeTab === "COMPLETED") {
    displayedTrips = completedTrips;
  }

  const tabOptions = [
    { id: "ALL", label: `All Trips (${trips.length})`, count: trips.length },
    { id: "ACTIVE", label: `Active (${activeTrips.length})`, count: activeTrips.length },
    { id: "COMPLETED", label: `Completed (${completedTrips.length})`, count: completedTrips.length },
  ];

  return {
    trips,
    displayedTrips,
    isLoading,
    activeTab,
    setActiveTab,
    tabOptions,
    refetch: fetchTrips,
  };
};
