"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { AdminDashboardStats, Enquiry } from "@/types/api";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [statsRes, enqRes] = await Promise.all([
          getData<AdminDashboardStats>(ENDPOINTS.ADMIN.DASHBOARD, { showErrorToast: false }),
          getData<Enquiry[]>(`${ENDPOINTS.ENQUIRIES.ADMIN_ALL}?limit=6`, { showErrorToast: false }),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (enqRes.success && Array.isArray(enqRes.data)) {
          setRecentEnquiries(enqRes.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return {
    stats,
    recentEnquiries,
    isLoading,
  };
};
