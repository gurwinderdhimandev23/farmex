"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Enquiry, MandiPrice } from "@/types/api";

export const useFarmerDashboard = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [enqRes, mandiRes] = await Promise.all([
          getData<Enquiry[]>(`${ENDPOINTS.ENQUIRIES.MY_ENQUIRIES}?limit=5`, { showErrorToast: false }),
          getData<MandiPrice[]>(`${ENDPOINTS.MANDI_PRICES.BASE}?limit=4`, { showErrorToast: false }),
        ]);

        if (enqRes.success && Array.isArray(enqRes.data)) {
          setEnquiries(enqRes.data);
        }
        if (mandiRes.success && Array.isArray(mandiRes.data)) {
          setMandiPrices(mandiRes.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalSubmitted = enquiries.length;
  const inTransitCount = enquiries.filter((e) =>
    ["PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(e.status)
  ).length;
  const completedCount = enquiries.filter((e) =>
    ["DELIVERED", "PAYMENT_COMPLETED"].includes(e.status)
  ).length;

  return {
    enquiries,
    mandiPrices,
    isLoading,
    totalSubmitted,
    inTransitCount,
    completedCount,
  };
};
