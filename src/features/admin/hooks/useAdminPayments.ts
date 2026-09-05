"use client";

import { useEffect, useState } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Payment } from "@/types/api";

export const useAdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await getData<Payment[]>(ENDPOINTS.PAYMENTS.ADMIN_ALL, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setPayments(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalSettledCash = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return {
    payments,
    isLoading,
    totalSettledCash,
    refetch: fetchPayments,
  };
};
