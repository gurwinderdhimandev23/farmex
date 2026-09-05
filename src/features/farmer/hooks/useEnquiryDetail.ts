"use client";

import { useEffect, useState } from "react";
import { getData, patchData, ENDPOINTS } from "@/lib/api-client";
import { Enquiry } from "@/types/api";

export const useEnquiryDetail = (id: string) => {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchEnquiry = async () => {
    setIsLoading(true);
    try {
      const res = await getData<Enquiry>(ENDPOINTS.ENQUIRIES.BY_ID(id));
      if (res.success && res.data) {
        setEnquiry(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEnquiry();
    }
  }, [id]);

  const handleCancelEnquiry = async () => {
    setIsCancelling(true);
    try {
      const res = await patchData<Enquiry>(
        ENDPOINTS.ENQUIRIES.CANCEL(id),
        { notes: "Cancelled by Farmer" },
        { showSuccessToast: "Enquiry cancelled." }
      );
      if (res.success && res.data) {
        setEnquiry(res.data);
        setIsCancelModalOpen(false);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = enquiry ? ["SUBMITTED", "ADMIN_ACCEPTED"].includes(enquiry.status) : false;

  return {
    enquiry,
    isLoading,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isCancelling,
    canCancel,
    cancelEnquiry: handleCancelEnquiry,
    refetch: fetchEnquiry,
  };
};
