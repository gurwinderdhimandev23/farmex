"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getData, ENDPOINTS } from "@/lib/api-client";
import { Enquiry } from "@/types/api";

export const useFarmerEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getData<Enquiry[]>(ENDPOINTS.ENQUIRIES.MY_ENQUIRIES, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const tabOptions = useMemo(() => [
    { id: "ALL", label: "All Bookings", count: enquiries.length },
    {
      id: "PENDING",
      label: "Pending Review",
      count: enquiries.filter((e) => ["SUBMITTED", "ADMIN_ACCEPTED"].includes(e.status)).length,
    },
    {
      id: "IN_TRANSIT",
      label: "In Transit",
      count: enquiries.filter((e) =>
        ["TRANSPORTER_ASSIGNED", "TRANSPORTER_ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(e.status)
      ).length,
    },
    {
      id: "COMPLETED",
      label: "Completed",
      count: enquiries.filter((e) => ["DELIVERED", "PAYMENT_COMPLETED"].includes(e.status)).length,
    },
  ], [enquiries]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (activeTab === "PENDING" && !["SUBMITTED", "ADMIN_ACCEPTED"].includes(e.status)) return false;
      if (
        activeTab === "IN_TRANSIT" &&
        !["TRANSPORTER_ASSIGNED", "TRANSPORTER_ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(e.status)
      )
        return false;
      if (activeTab === "COMPLETED" && !["DELIVERED", "PAYMENT_COMPLETED"].includes(e.status)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMaterial = e.materialName.toLowerCase().includes(q);
        const matchesPickup = e.pickupLocation.toLowerCase().includes(q);
        const matchesDest = e.destinationLocation.toLowerCase().includes(q);
        const matchesNum = e.enquiryNumber.toLowerCase().includes(q);
        return matchesMaterial || matchesPickup || matchesDest || matchesNum;
      }
      return true;
    });
  }, [enquiries, activeTab, searchQuery]);

  return {
    enquiries,
    filteredEnquiries,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tabOptions,
    refetch: fetchEnquiries,
  };
};
