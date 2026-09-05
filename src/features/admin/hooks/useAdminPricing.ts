"use client";

import { useEffect, useState } from "react";
import { getData, postData, ENDPOINTS } from "@/lib/api-client";
import { Enquiry, TransportPricing } from "@/types/api";
import { getEnquiryUpfrontQuote, UpfrontQuoteBreakdown } from "@/lib/pricing-utils";

export const useAdminPricing = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [upfrontQuote, setUpfrontQuote] = useState<UpfrontQuoteBreakdown | null>(null);
  const [transportPrice, setTransportPrice] = useState<number | string>("");
  const [labourPrice, setLabourPrice] = useState<number | string>(0);
  const [pricingNotes, setPricingNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await getData<Enquiry[]>(ENDPOINTS.ENQUIRIES.ADMIN_ALL, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data.filter((e) => ["ADMIN_ACCEPTED", "TRANSPORTER_ASSIGNED"].includes(e.status)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleOpenPricingModal = (enq: Enquiry) => {
    const quote = getEnquiryUpfrontQuote(enq);
    setUpfrontQuote(quote);
    setSelectedEnquiry(enq);
    setTransportPrice(
      enq.transportPricing?.transportPrice !== undefined && enq.transportPricing?.transportPrice !== null
        ? enq.transportPricing.transportPrice
        : quote.transportPrice
    );
    setLabourPrice(
      enq.transportPricing?.labourPrice !== undefined && enq.transportPricing?.labourPrice !== null
        ? enq.transportPricing.labourPrice
        : quote.labourPrice
    );
    setPricingNotes(enq.transportPricing?.notes || "");
  };

  const handleSavePricing = async () => {
    if (!selectedEnquiry || !transportPrice || Number(transportPrice) < 0) {
      alert("Please enter a valid transport price");
      return;
    }
    setIsSaving(true);
    try {
      const res = await postData<TransportPricing>(
        ENDPOINTS.PRICING.ENQUIRY_PRICING(selectedEnquiry.id),
        {
          transportPrice: Number(transportPrice),
          labourPrice: Number(labourPrice) || 0,
          notes: pricingNotes.trim() || undefined,
        },
        { showSuccessToast: "Pricing submitted for enquiry!" }
      );
      if (res.success) {
        setSelectedEnquiry(null);
        fetchEnquiries();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    enquiries,
    isLoading,
    selectedEnquiry,
    setSelectedEnquiry,
    upfrontQuote,
    transportPrice,
    setTransportPrice,
    labourPrice,
    setLabourPrice,
    pricingNotes,
    setPricingNotes,
    isSaving,
    handleOpenPricingModal,
    handleSavePricing,
    refetch: fetchEnquiries,
  };
};
