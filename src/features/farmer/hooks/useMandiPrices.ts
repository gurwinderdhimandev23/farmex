"use client";

import { useEffect, useState, useMemo } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { MandiPrice } from "@/types/api";

export const useMandiPrices = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const res = await getData<MandiPrice[]>(ENDPOINTS.MANDI_PRICES.BASE, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setPrices(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchProduct = p.productName.toLowerCase().includes(q);
      const matchMandi = p.mandiName.toLowerCase().includes(q);
      const matchGrade = p.grades?.some((g) => g.gradeName.toLowerCase().includes(q));
      return matchProduct || matchMandi || matchGrade;
    });
  }, [prices, searchQuery]);

  return {
    prices,
    filteredPrices,
    isLoading,
    searchQuery,
    setSearchQuery,
    refetch: fetchPrices,
  };
};
