"use client";

import { useEffect, useState } from "react";
import { getData, patchData, ENDPOINTS } from "@/lib/api-client";
import { TransportAssignment } from "@/types/api";

export const useTransporterRequests = () => {
  const [requests, setRequests] = useState<TransportAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await getData<TransportAssignment[]>(ENDPOINTS.TRIPS.MY_REQUESTS, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    setIsResponding(true);
    try {
      const res = await patchData<TransportAssignment>(
        ENDPOINTS.TRIPS.RESPOND(id),
        { status: "ACCEPTED" },
        { showSuccessToast: "Trip request accepted!" }
      );
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;
    setIsResponding(true);
    try {
      const res = await patchData<TransportAssignment>(
        ENDPOINTS.TRIPS.RESPOND(selectedRequestId),
        {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim() || "Driver unavailable",
        },
        { showSuccessToast: "Trip request declined." }
      );
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequestId));
        setIsRejectModalOpen(false);
        setSelectedRequestId(null);
        setRejectionReason("");
      }
    } finally {
      setIsResponding(false);
    }
  };

  return {
    requests,
    isLoading,
    selectedRequestId,
    setSelectedRequestId,
    rejectionReason,
    setRejectionReason,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isResponding,
    handleAccept,
    handleReject,
    refetch: fetchRequests,
  };
};
