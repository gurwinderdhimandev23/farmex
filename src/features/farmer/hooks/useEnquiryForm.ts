"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getData, postData, ENDPOINTS } from "@/lib/api-client";
import { LabourType, Enquiry } from "@/types/api";
import { getAllVehicleQuotes, getBestVehicleQuote } from "@/lib/pricing-utils";

export const useEnquiryForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labourTypes, setLabourTypes] = useState<LabourType[]>([]);

  // Form States
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupLatitude, setPickupLatitude] = useState<number | null>(null);
  const [pickupLongitude, setPickupLongitude] = useState<number | null>(null);

  const [destinationLocation, setDestinationLocation] = useState("");
  const [destinationLatitude, setDestinationLatitude] = useState<number | null>(null);
  const [destinationLongitude, setDestinationLongitude] = useState<number | null>(null);

  const [materialName, setMaterialName] = useState("");
  // Weight in Quintals as requested by client (1 Quintal = 100 Kg)
  const [quantityQuintals, setQuantityQuintals] = useState<number | string>("");
  const [distanceKm, setDistanceKm] = useState<number | string>("");
  const [vehicleRequirement, setVehicleRequirement] = useState("Pickup (1.5 - 2 Tonne)");
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<string>("");
  const [pickupDate, setPickupDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Morning (06:00 AM - 11:00 AM)");
  const [labourRequired, setLabourRequired] = useState(false);
  const [labourCount, setLabourCount] = useState<number>(2);
  const [notes, setNotes] = useState("");
  const [isReturnLoad, setIsReturnLoad] = useState(false);

  // Sell from Farm (Ghar Se Beche) States
  const [isSellFromFarm, setIsSellFromFarm] = useState(false);
  const [samplePreferredDate, setSamplePreferredDate] = useState("");
  const [samplePreferredSlot, setSamplePreferredSlot] = useState("Morning (09:00 AM - 12:00 PM)");

  // Selected Labour Items
  const [selectedLabours, setSelectedLabours] = useState<{ labourTypeId: string; quantity: number; notes: string }[]>([]);

  // Auto-calculate distance when both pickup and destination coordinates are available
  useEffect(() => {
    if (
      pickupLatitude !== null &&
      pickupLongitude !== null &&
      destinationLatitude !== null &&
      destinationLongitude !== null
    ) {
      const R = 6371; // Earth's radius in KM
      const dLat = ((destinationLatitude - pickupLatitude) * Math.PI) / 180;
      const dLon = ((destinationLongitude - pickupLongitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickupLatitude * Math.PI) / 180) *
          Math.cos((destinationLatitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightDist = R * c;
      // Multiply by 1.25 for approximate Indian road driving distance
      const roadDistKm = Math.max(5, Math.round(straightDist * 1.25));
      setDistanceKm(roadDistKm.toString());
    }
  }, [pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().split("T")[0]);

    getData<LabourType[]>(ENDPOINTS.PRICING.LABOUR_TYPES, { showErrorToast: false }).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setLabourTypes(res.data.filter((lt) => lt.isActive));
      }
    });
  }, []);

  const handleAddLabourItem = () => {
    if (labourTypes.length > 0) {
      setSelectedLabours((prev) => [
        ...prev,
        { labourTypeId: labourTypes[0].id, quantity: 1, notes: "" },
      ]);
    }
  };

  const handleRemoveLabourItem = (idx: number) => {
    setSelectedLabours((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation.trim()) {
      toast.error("कृपया पिकअप स्थान (खेत / गाँव) भरें / Please enter pickup location");
      return;
    }
    if (!destinationLocation.trim()) {
      toast.error("कृपया गंतव्य मंडी भरें / Please enter destination Mandi");
      return;
    }
    if (!materialName.trim()) {
      toast.error("कृपया फसल का नाम भरें / Please enter crop name");
      return;
    }
    const qNum = parseFloat(String(quantityQuintals));
    if (isNaN(qNum) || qNum <= 0) {
      toast.error("कृपया फसल का वजन क्विंटल में दर्ज करें / Please enter weight in Quintals");
      return;
    }
    if (!pickupDate) {
      toast.error("कृपया तारीख चुनें / Please select pickup date");
      return;
    }

    setIsSubmitting(true);
    try {
      // Safe Date Formatting
      let formattedDate: string;
      try {
        if (pickupDate.includes("T")) {
          formattedDate = new Date(pickupDate).toISOString();
        } else {
          formattedDate = new Date(`${pickupDate}T09:00:00.000Z`).toISOString();
        }
      } catch {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        formattedDate = tomorrow.toISOString();
      }

      // Convert Quintals to Kg for database storage (1 Quintal = 100 Kg)
      const totalKg = Math.round(qNum * 100);

      // Only pass valid labour items if selected
      const numWorkers = labourRequired ? Math.max(1, Number(labourCount) || 1) : 0;
      const validLabourItems = labourRequired
        ? [{ labourTypeId: labourTypes[0]?.id || "standard_labour", quantity: numWorkers, notes: `${numWorkers} workers requested` }]
        : undefined;

      // Calculate and attach upfront quote breakdown for chosen or best matching vehicle
      const numDist = parseFloat(String(distanceKm)) || 20;
      const allQuotes = getAllVehicleQuotes(qNum, numDist);
      const chosenQuote = (selectedVehicleCategory ? allQuotes.find((q) => q.category === selectedVehicleCategory) : null) || getBestVehicleQuote(qNum, numDist);
      const transportTotal = chosenQuote.totalFreight;
      const labourTotal = labourRequired ? (numWorkers * 350) : 0;
      const quoteTotal = transportTotal + labourTotal;

      const upfrontTag = `[Upfront Quote: Total ₹${quoteTotal} | Transport: ₹${transportTotal} | Labour (${numWorkers} persons): ₹${labourTotal} | Distance: ${numDist} KM | Vehicle: ${chosenQuote.displayName}]`;
      const finalNotes = notes.trim() ? `${upfrontTag} ${notes.trim()}` : upfrontTag;

      let formattedSampleDate: string | undefined;
      if (isSellFromFarm && samplePreferredDate) {
        try {
          formattedSampleDate = new Date(`${samplePreferredDate}T09:00:00.000Z`).toISOString();
        } catch {
          formattedSampleDate = formattedDate;
        }
      }

      const res = await postData<Enquiry>(
        ENDPOINTS.ENQUIRIES.BASE,
        {
          pickupLocation: pickupLocation.trim(),
          pickupLatitude: pickupLatitude !== null ? pickupLatitude : undefined,
          pickupLongitude: pickupLongitude !== null ? pickupLongitude : undefined,
          destinationLocation: destinationLocation.trim(),
          destinationLatitude: destinationLatitude !== null ? destinationLatitude : undefined,
          destinationLongitude: destinationLongitude !== null ? destinationLongitude : undefined,
          materialName: materialName.trim(),
          quantityKg: totalKg,
          vehicleRequirement: chosenQuote.displayName || vehicleRequirement,
          pickupDate: formattedDate,
          preferredTimeSlot,
          labourRequired,
          labourItems: validLabourItems,
          notes: finalNotes,
          isReturnLoad,
          isSellFromFarm,
          samplePreferredDate: formattedSampleDate,
          samplePreferredSlot: isSellFromFarm ? samplePreferredSlot : undefined,
        },
        { showSuccessToast: isSellFromFarm ? "'Ghar Se Beche' request submitted successfully!" : "Transport booking submitted successfully!" }
      );

      if (res.success && res.data) {
        router.push(`/farmer/enquiries/${res.data.id}`);
      } else if (!res.success) {
        toast.error(res.error?.message || "Booking submission failed. Please verify your details.");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error creating enquiry. Please check connection.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    distanceKm,
    setDistanceKm,
    isSubmitting,
    labourTypes,
    pickupLocation,
    setPickupLocation,
    pickupLatitude,
    setPickupLatitude,
    pickupLongitude,
    setPickupLongitude,
    destinationLocation,
    setDestinationLocation,
    destinationLatitude,
    setDestinationLatitude,
    destinationLongitude,
    setDestinationLongitude,
    materialName,
    setMaterialName,
    // Provide both quantityQuintals and backward-compatible quantityKg alias
    quantityQuintals,
    setQuantityQuintals,
    quantityKg: quantityQuintals,
    setQuantityKg: setQuantityQuintals,
    vehicleRequirement,
    setVehicleRequirement,
    selectedVehicleCategory,
    setSelectedVehicleCategory,
    pickupDate,
    setPickupDate,
    preferredTimeSlot,
    setPreferredTimeSlot,
    labourRequired,
    setLabourRequired,
    labourCount,
    setLabourCount,
    notes,
    setNotes,
    isReturnLoad,
    setIsReturnLoad,
    isSellFromFarm,
    setIsSellFromFarm,
    samplePreferredDate,
    setSamplePreferredDate,
    samplePreferredSlot,
    setSamplePreferredSlot,
    selectedLabours,
    setSelectedLabours,
    handleAddLabourItem,
    handleRemoveLabourItem,
    handleSubmit,
  };
};
