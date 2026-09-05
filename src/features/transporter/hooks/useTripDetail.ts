"use client";

import { useEffect, useState } from "react";
import { getData, patchData, postData, ENDPOINTS } from "@/lib/api-client";
import { Trip, TripStatus, Payment } from "@/types/api";

export const useTripDetail = (id: string) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status progression modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"PICKUP" | "IN_TRANSIT" | "ON_DESTINATION" | "DELIVERED">("PICKUP");
  const [startOdometer, setStartOdometer] = useState<number | string>("");
  const [endOdometer, setEndOdometer] = useState<number | string>("");
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment Recording Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const fetchTrip = async () => {
    setIsLoading(true);
    try {
      const res = await getData<Trip>(ENDPOINTS.TRIPS.BY_ID(id));
      if (res.success && res.data) {
        setTrip(res.data);
        if (res.data.enquiry?.transportPricing?.totalAmount) {
          setPaymentAmount(Number(res.data.enquiry.transportPricing.totalAmount));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const getNextStatusAction = (currentStatus: TripStatus): {
    nextStatus: "PICKUP" | "IN_TRANSIT" | "ON_DESTINATION" | "DELIVERED" | null;
    label: string;
  } => {
    switch (currentStatus) {
      case "ASSIGNED":
      case "ACCEPTED":
        return { nextStatus: "PICKUP", label: "Mark Produce Picked Up" };
      case "PICKUP":
        return { nextStatus: "IN_TRANSIT", label: "Start Trip (In Transit)" };
      case "IN_TRANSIT":
        return { nextStatus: "ON_DESTINATION", label: "Mark Arrived at Mandi" };
      case "ON_DESTINATION":
        return { nextStatus: "DELIVERED", label: "Confirm Delivered" };
      default:
        return { nextStatus: null, label: "Trip Completed" };
    }
  };

  const handleOpenStatusModal = () => {
    if (!trip) return;
    const next = getNextStatusAction(trip.status);
    if (next.nextStatus) {
      setTargetStatus(next.nextStatus);
      setStatusNotes("");
      setIsStatusModalOpen(true);
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!trip) return;
    setIsUpdatingStatus(true);
    try {
      const res = await patchData<Trip>(
        ENDPOINTS.TRIPS.STATUS(trip.id),
        {
          status: targetStatus,
          notes: statusNotes.trim() || undefined,
          startOdometer: startOdometer ? Number(startOdometer) : undefined,
          endOdometer: endOdometer ? Number(endOdometer) : undefined,
        },
        { showSuccessToast: `Trip status advanced to ${targetStatus}!` }
      );
      if (res.success && res.data) {
        setTrip(res.data);
        setIsStatusModalOpen(false);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!trip || !paymentAmount || Number(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    setIsRecordingPayment(true);
    try {
      const res = await postData<Payment>(
        ENDPOINTS.PAYMENTS.RECORD_CASH,
        {
          enquiryId: trip.enquiryId,
          tripId: trip.id,
          amount: Number(paymentAmount),
          idempotencyKey: `cash-${trip.id}-${Date.now()}`,
          notes: paymentNotes.trim() || undefined,
        },
        { showSuccessToast: "Cash payment recorded successfully!" }
      );

      if (res.success) {
        setIsPaymentModalOpen(false);
        fetchTrip();
      }
    } finally {
      setIsRecordingPayment(false);
    }
  };

  return {
    trip,
    isLoading,
    isStatusModalOpen,
    setIsStatusModalOpen,
    targetStatus,
    startOdometer,
    setStartOdometer,
    endOdometer,
    setEndOdometer,
    statusNotes,
    setStatusNotes,
    isUpdatingStatus,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentAmount,
    setPaymentAmount,
    paymentNotes,
    setPaymentNotes,
    isRecordingPayment,
    getNextStatusAction,
    handleOpenStatusModal,
    handleConfirmStatusUpdate,
    handleRecordPayment,
    refetch: fetchTrip,
  };
};
