"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEnquiryForm } from "../hooks/useEnquiryForm";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MapPin, Package, Users, ArrowRight, AlertTriangle, Truck, Sparkles, CheckCircle2 } from "lucide-react";
import { AIVoiceBookingButton } from "@/components/ui/AIVoiceBookingButton";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { useLanguage } from "@/context/LanguageContext";
import { getAllVehicleQuotes, getBestVehicleQuote } from "@/lib/pricing-utils";

interface PriceBreakdown {
  distanceKm: number;
  weightQuintals: number;
  baseTransportPrice?: number;
  platformFee?: number;
  transportPrice: number;
  labourPrice: number;
  totalAmount: number;
  labourRatePerQuintal: number;
}

export const EnquiryForm: React.FC = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const {
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
    quantityKg,
    distanceKm,
    setDistanceKm,
    setQuantityKg,
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
    selectedLabours,
    setSelectedLabours,
    selectedVehicleCategory,
    setSelectedVehicleCategory,
    isSellFromFarm,
    setIsSellFromFarm,
    samplePreferredDate,
    setSamplePreferredDate,
    samplePreferredSlot,
    setSamplePreferredSlot,
    handleSubmit,
  } = useEnquiryForm();

  const [nearbyDriversCount, setNearbyDriversCount] = useState<number>(0);
  const [labourAvailable, setLabourAvailable] = useState<boolean>(true);
  const [isAiFilled, setIsAiFilled] = useState(false);

  const numQty = parseFloat(String(quantityKg)) || 0; // In Quintals (1 Quintal = 100 Kg)
  const numDist = parseFloat(String(distanceKm)) || 0;
  const hasEnteredSpecs = numQty > 0 && numDist > 0;

  const allVehicleQuotes = hasEnteredSpecs ? getAllVehicleQuotes(numQty, numDist) : [];
  const bestVehicleQuote = hasEnteredSpecs ? getBestVehicleQuote(numQty, numDist) : null;
  const effectiveSelectedCategory =
    selectedVehicleCategory || (bestVehicleQuote ? bestVehicleQuote.category : "");
  const activeChosenQuote =
    allVehicleQuotes.find((q) => q.category === effectiveSelectedCategory) || bestVehicleQuote;

  // Real-time Instant Pricing (Formula: Selected Vehicle Freight + Labour Workers Count)
  const numWorkers = labourRequired ? Math.max(1, Number(labourCount) || 1) : 0;
  const liveLabourPrice = hasEnteredSpecs && labourRequired ? numWorkers * 350 : 0;
  const liveVehicleFreight = activeChosenQuote ? activeChosenQuote.totalFreight : 0;
  const liveTotalAmount = liveVehicleFreight + liveLabourPrice;

  // Fetch real available transporters count from database (on mount and on location change)
  useEffect(() => {
    const encLocation = encodeURIComponent(pickupLocation.trim());
    const weightParam = numQty * 100 || 1000;
    const url = pickupLocation.trim()
      ? `/api/v1/transporters/nearby?weightKg=${weightParam}&labourRequired=${labourRequired}&pickupLocation=${encLocation}`
      : `/api/v1/transporters/nearby?weightKg=${weightParam}&labourRequired=${labourRequired}`;

    const timer = setTimeout(() => {
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data && typeof res.data.count === "number") {
            setNearbyDriversCount(res.data.count);
            setLabourAvailable(res.data.labourAvailable !== false);
          }
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupLocation, numQty, labourRequired]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* MODE SELECTOR TABS (Mandi Transport vs Ghar Se Beche / Sell from Home) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-900/90 border-2 border-emerald-500/30 rounded-2xl shadow-xl">
        <button
          type="button"
          onClick={() => setIsSellFromFarm(false)}
          className={`flex items-center justify-center gap-3 p-4 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            !isSellFromFarm
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 shadow-lg"
              : "bg-slate-950/60 text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-5 h-5" />
          <span>{language === "hi" ? "🚚 मंडी तक ढुलाई (Transport)" : "🚚 Mandi Transport"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSellFromFarm(true)}
          className={`flex items-center justify-center gap-3 p-4 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
            isSellFromFarm
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg"
              : "bg-slate-950/60 text-slate-400 hover:text-white"
          }`}
        >
          <Package className="w-5 h-5" />
          <span>{language === "hi" ? "🌾 घर से बेचें (Sell from Home & Sample)" : "🌾 Sell from Home (Procurement)"}</span>
        </button>
      </div>

      {/* GHAR SE BECHE INFO BANNER */}
      {isSellFromFarm && (
        <div className="bg-amber-950/80 border-2 border-amber-500/60 text-amber-100 p-4 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm sm:text-base">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              {language === "hi"
                ? "🌾 'घर से बेचें' खरीद सेवा (Sell from Home)"
                : "🌾 'Sell from Home' Direct Procurement Service"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {language === "hi"
              ? "1. FarmEx एजेंट आपके घर/खेत से सैंपल लेकर जाएगा। ➔ 2. लैब से टेस्ट रिपोर्ट और भाव तय होगा। ➔ 3. भाव पसंद आने पर गाड़ी घर/खेत से फसल उठाकर सीधा भुगतान करेगी!"
              : "1. Field agent collects sample from your home/farm ➔ 2. Quality testing & verified rate from Lab ➔ 3. Direct doorstep pickup & on-the-spot payment!"}
          </p>
        </div>
      )}

      {/* AI VOICE BOOKING HERO CARD */}
      <AIVoiceBookingButton
        onDataExtracted={(aiData) => {
          const cleanLoc = (str?: string) => {
            if (!str) return "";
            return str
              .replace(/\b(bhejna\s+hai|bhejna\s+tha|bhejna|bhej\s+do|bhejenge|bhej|bhejo)\b/gi, "")
              .replace(/\b(jana\s+hai|le\s+jana\s+hai|leke\s+jana|pahunchana\s+hai|pahunchana)\b/gi, "")
              .replace(/\b(se|tak|ko|me|mein|pe|par)\b/gi, "")
              .replace(/(भेजना\s*है|भेजना\s*था|भेजना|भेज\s*दो|भेजेंगे|भेज|भेजो)/g, "")
              .replace(/(जाना\s*है|ले\s*जाना\s*है|लेके\s*जाना|पहुँचाना\s*है|पहुंचाना\s*है|पहुँचाना)/g, "")
              .replace(/(से|तक|को|में|पे|पर)/g, "")
              .replace(/[,;:.!?_+\-()"'`]/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          };

          if (aiData.materialName) setMaterialName(aiData.materialName);
          if (aiData.quantityKg) {
            const num = Number(aiData.quantityKg);
            const q = num > 150 ? Math.round(num / 100) : num;
            setQuantityKg(q.toString());
          }
          if (aiData.pickupLocation) setPickupLocation(cleanLoc(aiData.pickupLocation));
          if (aiData.destinationLocation) setDestinationLocation(cleanLoc(aiData.destinationLocation));
          if (aiData.distanceKm) setDistanceKm(aiData.distanceKm.toString());
          if (aiData.pickupDate) setPickupDate(aiData.pickupDate);
          if (aiData.preferredTimeSlot) setPreferredTimeSlot(aiData.preferredTimeSlot);
          if (aiData.labourRequired !== undefined) setLabourRequired(aiData.labourRequired);
          if (aiData.notes) setNotes((prev) => (prev ? `${prev} | ${aiData.notes}` : (aiData.notes || "")));
          setIsAiFilled(true);
        }}
      />

      {/* AI AUTO-FILL CONFIRMATION BANNER */}
      {isAiFilled && (
        <div className="bg-emerald-950/90 border-2 border-emerald-400/80 text-emerald-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">
                {language === "hi" ? "✨ AI आवाज़ द्वारा फॉर्म भर दिया गया है!" : "✨ Form Auto-Filled by AI Voice Assistant!"}
              </span>
              <span className="text-[11px] text-emerald-300">
                {language === "hi"
                  ? "सभी फ़ील्ड्स नीचे भर दी गई हैं। कृपया जांच लें और यदि चाहें तो कोई भी विवरण बदल सकते हैं।"
                  : "All booking details have been filled into the form. You can review or modify any field below."}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAiFilled(false)}
            className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800/80 rounded-lg text-emerald-200 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            {language === "hi" ? "ठीक है" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Route & Locations */}
      <Card className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-emerald-400">
            <MapPin className="w-5 h-5 text-emerald-400" /> {t("pickupLocation")} & {t("destinationLocation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <LocationPicker
            label={t("pickupLocation")}
            placeholder={t("pickupLocationPlaceholder")}
            value={pickupLocation}
            latitude={pickupLatitude}
            longitude={pickupLongitude}
            required
            onChange={(loc) => {
              setPickupLocation(loc.address);
              setPickupLatitude(loc.latitude);
              setPickupLongitude(loc.longitude);
            }}
          />

          <LocationPicker
            label={t("destinationLocation")}
            placeholder={t("destinationLocationPlaceholder")}
            value={destinationLocation}
            latitude={destinationLatitude}
            longitude={destinationLongitude}
            required
            onChange={(loc) => {
              setDestinationLocation(loc.address);
              setDestinationLatitude(loc.latitude);
              setDestinationLongitude(loc.longitude);
            }}
          />

          {isSellFromFarm ? (
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                {language === "hi" ? "सैंपल कलेक्शन तारीख" : "Sample Collection Date"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={samplePreferredDate || pickupDate}
                onChange={(e) => {
                  setSamplePreferredDate(e.target.value);
                  setPickupDate(e.target.value);
                }}
                required
                className="w-full bg-slate-950 border-2 border-amber-500/40 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-base font-medium focus:outline-none"
              />
              <span className="text-[11px] text-amber-400/80 mt-1 block">
                {language === "hi" ? "💡 इस दिन एजेंट आपके खेत पर आएगा" : "💡 Agent will visit on this date"}
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1.5">
                {t("pickupDate")} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                className="w-full bg-slate-950 border-2 border-emerald-500/30 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-base font-medium focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1.5">
              {isSellFromFarm ? (language === "hi" ? "सैंपल कलेक्शन समय स्लॉट" : "Sample Time Slot") : t("preferredTimeSlot")}
            </label>
            <select
              value={isSellFromFarm ? samplePreferredSlot : preferredTimeSlot}
              onChange={(e) => {
                if (isSellFromFarm) setSamplePreferredSlot(e.target.value);
                else setPreferredTimeSlot(e.target.value);
              }}
              className="w-full bg-slate-950 border-2 border-emerald-500/30 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-base font-medium focus:outline-none"
            >
              <option value="Morning (09:00 AM - 12:00 PM)">सुबह (09:00 AM - 12:00 PM)</option>
              <option value="Afternoon (12:00 PM - 04:00 PM)">दोपहर (12:00 PM - 04:00 PM)</option>
              <option value="Evening (04:00 PM - 07:00 PM)">शाम (04:00 PM - 07:00 PM)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Specs (Commodity, Weight & Distance) */}
      <Card className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-emerald-400">
            <Package className="w-5 h-5 text-emerald-400" /> {language === "hi" ? "फसल व कुल वजन (क्विंटल)" : "Cargo & Weight (Quintals)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1.5">
              {t("cropMaterial")} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder={t("cropMaterialPlaceholder")}
              required
              className="w-full bg-slate-950 border-2 border-emerald-500/30 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-base font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1.5">
              {language === "hi" ? "कुल वजन (क्विंटल में)" : "Total Weight (in Quintals)"} <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              placeholder={language === "hi" ? "उदा. 10 या 50" : "e.g. 10 or 50"}
              required
              min="0.1"
              step="any"
              className="w-full bg-slate-950 border-2 border-emerald-500/30 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-base font-medium focus:outline-none"
            />
            <span className="text-xs text-emerald-400/80 mt-1 block font-semibold">
              💡 {parseFloat(String(quantityKg))
                ? language === "hi"
                  ? `${parseFloat(String(quantityKg))} क्विंटल = ${parseFloat(String(quantityKg)) * 100} किलो (${(parseFloat(String(quantityKg)) / 10).toFixed(1)} टन)`
                  : `${parseFloat(String(quantityKg))} Quintals = ${parseFloat(String(quantityKg)) * 100} Kg (${(parseFloat(String(quantityKg)) / 10).toFixed(1)} Tonnes)`
                : language === "hi"
                ? "1 क्विंटल = 100 किलो (उदा. 10 या 50 भरें)"
                : "1 Quintal = 100 Kg (e.g. enter 10 or 50)"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1.5">
              {language === "hi" ? "अनुमानित दूरी (KM)" : "Approx Distance (KM)"} <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder={language === "hi" ? "उदा. 15" : "e.g. 15"}
              required
              min="1"
              className="w-full bg-slate-950 border-2 border-emerald-500/30 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-base font-medium focus:outline-none"
            />
            <span className="text-[11px] text-emerald-400/80 mt-1 block font-semibold">
              💡 {language === "hi" ? "दूरी के अनुसार भाड़ा (₹3.50/KM/क्विंटल)" : "Distance used for fare (₹3.50/KM/quintal)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Labour Assistance Option (ON/OFF Toggle + Worker Count Stepper) */}
      <Card className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  labourRequired
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white">
                    {language === "hi" ? "लोडिंग और अनलोडिंग के लिए मजदूर/लेबर चाहिए?" : "Need Labour for Loading & Unloading?"}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border transition-colors ${
                      labourRequired
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {labourRequired
                      ? language === "hi" ? "चालू (ON)" : "ON"
                      : language === "hi" ? "बंद (OFF)" : "OFF"}
                  </span>
                </div>
                <p className="text-xs text-emerald-300/80 mt-1 font-medium">
                  {labourRequired
                    ? language === "hi"
                      ? `लेबर जोड़ी गई: ₹350/मजदूर x ${labourCount || 1} व्यक्ति = ₹${liveLabourPrice}`
                      : `Labour added: ₹350/person x ${labourCount || 1} workers = ₹${liveLabourPrice}`
                    : language === "hi"
                    ? "लेबर की आवश्यकता नहीं है (₹0)"
                    : "No labour assistance needed (₹0)"}
                </p>
              </div>
            </div>

            {/* Interactive Toggle Switch Button */}
            <button
              type="button"
              role="switch"
              aria-checked={labourRequired}
              onClick={() => {
                const nextVal = !labourRequired;
                setLabourRequired(nextVal);
                if (nextVal && (!labourCount || labourCount < 1)) {
                  setLabourCount(2);
                }
              }}
              className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none shadow-inner border ${
                labourRequired
                  ? "bg-emerald-500 border-emerald-400"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  labourRequired ? "translate-x-9" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* DYNAMIC LABOUR WORKER COUNT INPUT BOX (When Enabled) */}
          {labourRequired && (
            <div className="pt-3 border-t border-emerald-500/20 bg-emerald-950/40 p-4 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-300 block">
                    {language === "hi" ? "कितने मजदूर / बंदे चाहिए?" : "Number of Labourers / Helpers Needed"}
                  </label>
                  <span className="text-[11px] text-slate-300">
                    {language === "hi" ? "मानक दर: ₹350 प्रति मजदूर (लोडिंग + अनलोडिंग)" : "Standard Rate: ₹350 per worker (Loading + Unloading)"}
                  </span>
                </div>

                {/* Worker Stepper Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLabourCount(Math.max(1, (Number(labourCount) || 1) - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-95 flex items-center justify-center border border-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={labourCount}
                    onChange={(e) => setLabourCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-slate-950 border-2 border-emerald-400 rounded-lg py-1.5 text-center text-white font-black text-base focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setLabourCount((Number(labourCount) || 1) + 1)}
                    className="w-9 h-9 rounded-lg bg-emerald-600 text-slate-950 font-black text-lg hover:bg-emerald-500 active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {language === "hi" ? "सुझाव:" : "Quick Select:"}
                </span>
                {[1, 2, 3, 4, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setLabourCount(count)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      Number(labourCount) === count
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                        : "bg-slate-950/80 text-slate-300 border-slate-700 hover:border-emerald-500/50"
                    }`}
                  >
                    {count} {language === "hi" ? "बंदे" : "workers"} (₹{count * 350})
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UPFRONT PRICING & VEHICLE OPTIONS CARD */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400/60 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-white space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
          <div>
            <span className="text-xs font-extrabold tracking-wider text-emerald-400 uppercase bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              ⚡ {language === "hi" ? "आधिकारिक किराया सूची (Rate Card)" : "Official Freight Rate Card"}
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {language === "hi" ? "गाड़ियों का अनुमानित किराया व विवरण" : "Vehicle Freight Breakdown"}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400">
              {hasEnteredSpecs ? `₹${liveTotalAmount}` : "—"}
            </div>
            <span className="text-xs font-semibold text-emerald-200/80">
              {hasEnteredSpecs && activeChosenQuote
                ? `${activeChosenQuote.displayName} ${
                    activeChosenQuote.category === bestVehicleQuote?.category && !selectedVehicleCategory
                      ? "(Best Match)"
                      : language === "hi"
                      ? "(चयनित)"
                      : "(Selected)"
                  }`
                : language === "hi"
                ? "वजन और दूरी दर्ज करने पर तय होगा"
                : "Calculated on weight & distance"}
            </span>
          </div>
        </div>

        {/* Dynamic 4-Vehicle Rate Cards with Interactive Selection */}
        {hasEnteredSpecs && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300">
                {language === "hi"
                  ? "👉 कृपया अपनी पसंद की गाड़ी चुनें:"
                  : "👉 Please select your preferred vehicle:"}
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                {language === "hi"
                  ? "योग्य (Eligible) गाड़ियों पर क्लिक करके चुनें"
                  : "Click any eligible vehicle card to select"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {allVehicleQuotes.map((v) => {
                const isSelected = v.category === effectiveSelectedCategory;
                return (
                  <div
                    key={v.category}
                    onClick={() => {
                      if (v.isEligible) {
                        setSelectedVehicleCategory(v.category);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                      !v.isEligible
                        ? "bg-slate-950/40 border-slate-800 opacity-40 cursor-not-allowed select-none"
                        : isSelected
                        ? "bg-emerald-950/90 border-emerald-400 shadow-xl ring-2 ring-emerald-400/60 cursor-pointer scale-[1.02]"
                        : "bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {v.isEligible && (
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "border-emerald-400 bg-emerald-500"
                                  : "border-slate-500 bg-transparent"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                          )}
                          <h5 className={`font-black text-sm truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                            {v.displayName}
                          </h5>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                            !v.isEligible
                              ? "bg-slate-800 text-slate-500"
                              : isSelected
                              ? "bg-emerald-400 text-slate-950 font-black"
                              : "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {!v.isEligible
                            ? language === "hi" ? "अमान्य" : "N/A"
                            : isSelected
                            ? language === "hi" ? "✓ चयनित" : "✓ Selected"
                            : language === "hi" ? "चुनें" : "Select"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium mb-2">
                        {language === "hi"
                          ? `क्षमता: ${v.capacityMinQtl}–${v.capacityMaxQtl} क्विंटल`
                          : `Cap: ${v.capacityMinQtl}–${v.capacityMaxQtl} Qtl`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>{language === "hi" ? "मूल किराया:" : "Base Rate:"}</span>
                        <span className="font-bold text-white">₹{v.basicFreight}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>{language === "hi" ? `दूरी (${numDist} KM):` : `Distance (${numDist} KM):`}</span>
                        <span className="font-bold text-white">₹{v.distanceCharges}</span>
                      </div>
                      <div
                        className={`flex justify-between font-black pt-1.5 border-t border-slate-800 text-sm ${
                          isSelected ? "text-emerald-300" : "text-slate-200"
                        }`}
                      >
                        <span>{language === "hi" ? "कुल भाड़ा:" : "Total Freight:"}</span>
                        <span>₹{v.totalFreight}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-bold">{t("labourCharge")}</span>
            <span className="text-sm font-black text-white">
              {hasEnteredSpecs ? (labourRequired ? `₹${liveLabourPrice} (${labourCount || 1} ${language === "hi" ? "मजदूर" : "workers"})` : "₹0") : "—"}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-bold">{language === "hi" ? "प्लेटफॉर्म शुल्क" : "Platform Margin"}</span>
            <span className="text-sm font-black text-amber-400">15% {language === "hi" ? "शामिल" : "Included"}</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-bold">{t("nearbyMatching")}</span>
            <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> {nearbyDriversCount} {t("activeDriversCount")}
            </span>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-bold text-emerald-300 mb-1">
            {t("specialNotes")}
          </label>
          <Textarea
            placeholder={t("notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-950/90 border border-emerald-500/30 text-white text-sm"
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.push("/farmer/enquiries")}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 text-slate-300 font-extrabold rounded-xl hover:bg-slate-700 transition-all text-base cursor-pointer"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg cursor-pointer"
        >
          {isSubmitting ? t("submitting") : t("confirmBooking")} <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </form>
  );
};
