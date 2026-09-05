"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getData, postData, patchData, ENDPOINTS } from "@/lib/api-client";
import { Enquiry, TransportPricing, TransportAssignment, User } from "@/types/api";
import { getEnquiryUpfrontQuote, UpfrontQuoteBreakdown } from "@/lib/pricing-utils";

export const useAdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Transporters List State
  const [transporters, setTransporters] = useState<User[]>([]);
  const [isTransportersLoading, setIsTransportersLoading] = useState(false);

  // Review Modal State
  const [reviewEnquiry, setReviewEnquiry] = useState<Enquiry | null>(null);
  const [reviewAction, setReviewAction] = useState<"ADMIN_ACCEPTED" | "ADMIN_REJECTED">("ADMIN_ACCEPTED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Pricing Modal State
  const [pricingEnquiry, setPricingEnquiry] = useState<Enquiry | null>(null);
  const [upfrontQuote, setUpfrontQuote] = useState<UpfrontQuoteBreakdown | null>(null);
  const [transportPrice, setTransportPrice] = useState<number | string>("");
  const [labourPrice, setLabourPrice] = useState<number | string>(0);
  const [pricingNotes, setPricingNotes] = useState("");
  const [isSettingPricing, setIsSettingPricing] = useState(false);

  // Assign Transporter Modal State
  const [assignEnquiry, setAssignEnquiry] = useState<Enquiry | null>(null);
  const [transporterId, setTransporterId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Sample & Lab Modal State (Ghar Se Beche)
  const [sampleEnquiry, setSampleEnquiry] = useState<Enquiry | null>(null);
  const [sampleStatus, setSampleStatus] = useState<'PENDING_COLLECTION' | 'COLLECTION_ASSIGNED' | 'SAMPLE_COLLECTED' | 'APPROVED' | 'REJECTED'>('SAMPLE_COLLECTED');
  const [sampleCollectorNotes, setSampleCollectorNotes] = useState("");
  const [labReportImageUrl, setLabReportImageUrl] = useState<string | null>(null);
  const [labRemarks, setLabRemarks] = useState("");
  const [quotedPricePerQtl, setQuotedPricePerQtl] = useState<number | string>("");
  const [isUpdatingSample, setIsUpdatingSample] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getData<Enquiry[]>(ENDPOINTS.ENQUIRIES.ADMIN_ALL, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransporters = useCallback(async (enquiry?: Enquiry | null) => {
    setIsTransportersLoading(true);
    try {
      let endpoint: string = ENDPOINTS.ADMIN.TRANSPORTERS;
      const params: string[] = [];

      if (enquiry) {
        if (enquiry.pickupLatitude) params.push(`pickupLat=${enquiry.pickupLatitude}`);
        if (enquiry.pickupLongitude) params.push(`pickupLng=${enquiry.pickupLongitude}`);
        if (enquiry.id) params.push(`enquiryId=${enquiry.id}`);
      }

      if (params.length > 0) {
        endpoint = `${endpoint}?${params.join("&")}`;
      }

      const res = await getData<User[]>(endpoint, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setTransporters(res.data);
      }
    } finally {
      setIsTransportersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
    fetchTransporters();
  }, [fetchEnquiries, fetchTransporters]);

  // Reset fields when assignEnquiry modal opens/closes
  const handleOpenAssignModal = useCallback((enquiry: Enquiry | null) => {
    setAssignEnquiry(enquiry);
    setTransporterId("");
    setVehicleId("");
    setAssignNotes("");
    if (enquiry) {
      fetchTransporters(enquiry);
    }
  }, [fetchTransporters]);

  const handleOpenSampleModal = useCallback((enquiry: Enquiry) => {
    setSampleEnquiry(enquiry);
    setSampleStatus(enquiry.sampleStatus || 'SAMPLE_COLLECTED');
    setSampleCollectorNotes(enquiry.sampleCollectorNotes || "");
    setLabReportImageUrl(enquiry.labReportImageUrl || null);
    setLabRemarks(enquiry.labRemarks || "");
    setQuotedPricePerQtl(enquiry.quotedPricePerQtl ? Number(enquiry.quotedPricePerQtl) : "");
  }, []);

  const tabOptions = useMemo(() => [
    { id: "ALL", label: "All Enquiries", count: enquiries.length },
    {
      id: "GHAR_SE_BECHE",
      label: "🌾 Ghar Se Beche",
      count: enquiries.filter((e) => e.isSellFromFarm).length,
    },
    {
      id: "SUBMITTED",
      label: "Needs Review",
      count: enquiries.filter((e) => e.status === "SUBMITTED").length,
    },
    {
      id: "PRICING_PENDING",
      label: "Needs Pricing / Assign",
      count: enquiries.filter((e) => e.status === "ADMIN_ACCEPTED").length,
    },
    {
      id: "IN_TRANSIT",
      label: "Live Transit",
      count: enquiries.filter((e) =>
        ["TRANSPORTER_ASSIGNED", "TRANSPORTER_ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(e.status)
      ).length,
    },
    {
      id: "DELIVERED",
      label: "Delivered",
      count: enquiries.filter((e) => ["DELIVERED", "PAYMENT_COMPLETED"].includes(e.status)).length,
    },
  ], [enquiries]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
    if (activeTab === "GHAR_SE_BECHE" && !e.isSellFromFarm) return false;
      if (activeTab === "SUBMITTED" && e.status !== "SUBMITTED") return false;
      if (activeTab === "PRICING_PENDING" && e.status !== "ADMIN_ACCEPTED") return false;
      if (
        activeTab === "IN_TRANSIT" &&
        !["TRANSPORTER_ASSIGNED", "TRANSPORTER_ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(e.status)
      )
        return false;
      if (activeTab === "DELIVERED" && !["DELIVERED", "PAYMENT_COMPLETED"].includes(e.status)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFarmer = e.farmer?.name?.toLowerCase().includes(q) || e.farmer?.phone?.includes(q);
        const matchesMaterial = e.materialName.toLowerCase().includes(q);
        const matchesLocation = e.pickupLocation.toLowerCase().includes(q) || e.destinationLocation.toLowerCase().includes(q);
        const matchesNumber = e.enquiryNumber.toLowerCase().includes(q);
        return matchesFarmer || matchesMaterial || matchesLocation || matchesNumber;
      }
      return true;
    });
  }, [enquiries, activeTab, searchQuery]);

  const handleConfirmSampleWorkflow = async (targetStatus?: 'PENDING_COLLECTION' | 'COLLECTION_ASSIGNED' | 'SAMPLE_COLLECTED' | 'APPROVED' | 'REJECTED') => {
    if (!sampleEnquiry) return;
    const finalStatus = targetStatus || sampleStatus;

    setIsUpdatingSample(true);
    try {
      const res = await patchData<Enquiry>(
        ENDPOINTS.ENQUIRIES.UPDATE_SAMPLE(sampleEnquiry.id),
        {
          sampleStatus: finalStatus,
          sampleCollectorNotes: sampleCollectorNotes.trim() || undefined,
          labReportImageUrl: labReportImageUrl || undefined,
          labRemarks: labRemarks.trim() || undefined,
          quotedPricePerQtl: quotedPricePerQtl ? Number(quotedPricePerQtl) : undefined,
        },
        { showSuccessToast: `Sample status updated to ${finalStatus}!` }
      );
      if (res.success) {
        setSampleEnquiry(null);
        fetchEnquiries();
      }
    } finally {
      setIsUpdatingSample(false);
    }
  };

  const handleConfirmReview = async () => {
    if (!reviewEnquiry) return;
    setIsReviewing(true);
    try {
      const res = await patchData<Enquiry>(
        ENDPOINTS.ENQUIRIES.REVIEW(reviewEnquiry.id),
        { status: reviewAction, notes: reviewNotes.trim() || undefined },
        { showSuccessToast: `Enquiry marked as ${reviewAction === "ADMIN_ACCEPTED" ? "Approved" : "Rejected"}` }
      );
      if (res.success && res.data) {
        setEnquiries((prev) => prev.map((e) => (e.id === reviewEnquiry.id ? res.data : e)));
        setReviewEnquiry(null);
      }
    } finally {
      setIsReviewing(false);
    }
  };

  const handleConfirmPricing = async () => {
    if (!pricingEnquiry || !transportPrice || Number(transportPrice) < 0) {
      alert("Please enter a valid transport price");
      return;
    }
    setIsSettingPricing(true);
    try {
      const res = await postData<TransportPricing>(
        ENDPOINTS.PRICING.ENQUIRY_PRICING(pricingEnquiry.id),
        {
          transportPrice: Number(transportPrice),
          labourPrice: Number(labourPrice) || 0,
          notes: pricingNotes.trim() || undefined,
        },
        { showSuccessToast: "Pricing submitted for enquiry!" }
      );
      if (res.success) {
        setPricingEnquiry(null);
        fetchEnquiries();
      }
    } finally {
      setIsSettingPricing(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!assignEnquiry || !transporterId.trim()) {
      alert("Please select a transporter for this assignment");
      return;
    }
    setIsAssigning(true);
    try {
      const res = await postData<TransportAssignment>(
        ENDPOINTS.TRIPS.ASSIGN,
        {
          enquiryId: assignEnquiry.id,
          transporterId: transporterId.trim(),
          vehicleId: vehicleId.trim() || undefined,
          notes: assignNotes.trim() || undefined,
        },
        { showSuccessToast: "Transporter assigned successfully!" }
      );
      if (res.success) {
        setAssignEnquiry(null);
        fetchEnquiries();
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOpenPricingModal = (enq: Enquiry) => {
    const quote = getEnquiryUpfrontQuote(enq);
    setUpfrontQuote(quote);
    setPricingEnquiry(enq);
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

  return {
    enquiries,
    filteredEnquiries,
    isLoading,
    transporters,
    isTransportersLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tabOptions,
    reviewEnquiry,
    setReviewEnquiry,
    reviewAction,
    setReviewAction,
    reviewNotes,
    setReviewNotes,
    isReviewing,
    pricingEnquiry,
    setPricingEnquiry,
    upfrontQuote,
    handleOpenPricingModal,
    transportPrice,
    setTransportPrice,
    labourPrice,
    setLabourPrice,
    pricingNotes,
    setPricingNotes,
    isSettingPricing,
    assignEnquiry,
    setAssignEnquiry: handleOpenAssignModal,
    transporterId,
    setTransporterId,
    vehicleId,
    setVehicleId,
    assignNotes,
    setAssignNotes,
    isAssigning,
    handleConfirmReview,
    handleConfirmPricing,
    handleConfirmAssign,
    sampleEnquiry,
    setSampleEnquiry,
    sampleStatus,
    setSampleStatus,
    sampleCollectorNotes,
    setSampleCollectorNotes,
    labReportImageUrl,
    setLabReportImageUrl,
    labRemarks,
    setLabRemarks,
    quotedPricePerQtl,
    setQuotedPricePerQtl,
    isUpdatingSample,
    handleOpenSampleModal,
    handleConfirmSampleWorkflow,
    refetch: fetchEnquiries,
    refetchTransporters: fetchTransporters,
  };
};

