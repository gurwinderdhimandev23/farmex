"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Payment } from "@/types/api";

interface TransporterEarningsSummary {
  totalTripsCompleted: number;
  totalEarningsCash: number;
  recentPayments: Payment[];
}

export const useTransporterEarnings = () => {
  const [earnings, setEarnings] = useState<TransporterEarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarnings = async () => {
    setIsLoading(true);
    try {
      const res = await getData<TransporterEarningsSummary>(ENDPOINTS.PAYMENTS.MY_EARNINGS, { showErrorToast: false });
      if (res.success && res.data) {
        setEarnings(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return {
    earnings,
    isLoading,
    refetch: fetchEarnings,
  };
};
