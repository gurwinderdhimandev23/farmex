"use client";

import React, { useState, useEffect } from "react";
import { useAdminPricing } from "../hooks/useAdminPricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { IndianRupee, MapPin, AlertTriangle, Truck, Save, Sliders, CheckCircle2, ShieldAlert } from "lucide-react";
import { DEFAULT_VEHICLE_RATE_CARDS } from "@/lib/pricing-utils";
import { VehicleRateCard } from "@/types/api";

export const AdminPricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("RATE_CARDS");
  const [rateCards, setRateCards] = useState<VehicleRateCard[]>(DEFAULT_VEHICLE_RATE_CARDS as any);
  const [isSavingRateCard, setIsSavingRateCard] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const {
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
  } = useAdminPricing();

  useEffect(() => {
    fetch("/api/v1/admin/pricing/rates")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setRateCards(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateCardField = (category: string, field: keyof VehicleRateCard, val: number | string) => {
    setRateCards((prev) =>
      prev.map((c) => (c.category === category ? { ...c, [field]: Number(val) } : c))
    );
  };

  const handleSaveAllRateCards = async () => {
    setIsSavingRateCard(true);
    setSaveSuccessMsg("");
    try {
      for (const card of rateCards) {
        await fetch("/api/v1/admin/pricing/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });
      }
      setSaveSuccessMsg("All vehicle rate cards and commission rules saved successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch {
      alert("Failed to save rate cards.");
    } finally {
      setIsSavingRateCard(false);
    }
  };

  const pricingTabs = [
    { id: "RATE_CARDS", label: "⚙️ Master Rate Cards & Commission" },
    { id: "BOOKINGS", label: `📦 Booking Approvals (${enquiries.length})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Freight & Labour Pricing Desk</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure dynamic vehicle rate cards, standard freight formulas, and platform commissions.
          </p>
        </div>
      </div>

      <Tabs tabs={pricingTabs} activeTab={activeTab} onChange={setActiveTab} />

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-3 text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: MASTER RATE CARDS & COMMISSION EDITOR */}
      {activeTab === "RATE_CARDS" && (
        <div className="space-y-6">
          {/* Formula Callout Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Sliders className="w-4 h-4" />
              <span>Official Freight Calculation Engine & Rules</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Distance Charge = Distance (KM) × Rate/KM | Total Freight = Base Freight + Distance Charge
            </p>
            <p className="text-xs text-amber-300 font-mono">
              Platform Share = Total Freight × Commission% (Default: 15%) | Driver Payout = Total Freight × Driver Share% (Default: 85%)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rateCards.map((card) => (
              <Card key={card.category} className="border-2 border-slate-200 shadow-xs">
                <CardHeader className="bg-slate-50/80 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-600" /> {card.displayName}
                    </CardTitle>
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                      {card.category}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Min Weight (Qtl)"
                      type="number"
                      value={card.capacityMinQtl}
                      onChange={(e) => handleUpdateCardField(card.category, "capacityMinQtl", e.target.value)}
                    />
                    <Input
                      label="Max Weight (Qtl)"
                      type="number"
                      value={card.capacityMaxQtl}
                      onChange={(e) => handleUpdateCardField(card.category, "capacityMaxQtl", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Base Basic Freight (₹)"
                      type="number"
                      value={card.basicFreight}
                      onChange={(e) => handleUpdateCardField(card.category, "basicFreight", e.target.value)}
                      leftIcon={<IndianRupee className="w-4 h-4 text-emerald-600" />}
                    />
                    <Input
                      label="Rate Per KM (₹ / KM)"
                      type="number"
                      value={card.ratePerKm}
                      onChange={(e) => handleUpdateCardField(card.category, "ratePerKm", e.target.value)}
                      leftIcon={<IndianRupee className="w-4 h-4 text-emerald-600" />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Input
                      label="Platform Commission (%)"
                      type="number"
                      value={card.platformFeePct}
                      onChange={(e) => handleUpdateCardField(card.category, "platformFeePct", e.target.value)}
                      helperText="Default: 15%"
                    />
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-700">Driver Payout (%)</span>
                      <span className="text-base font-extrabold text-emerald-700 mt-1">
                        {100 - Number(card.platformFeePct || 15)}%
                      </span>
                      <span className="text-[10px] text-slate-400">Auto-split from freight</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveAllRateCards}
              isLoading={isSavingRateCard}
              leftIcon={<Save className="w-5 h-5" />}
              className="px-8 shadow-md"
            >
              Save Rate Cards & Commission Config
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL BOOKING APPROVALS */}
      {activeTab === "BOOKINGS" && (
        <>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : enquiries.length === 0 ? (
            <EmptyState
              title="No Pending Pricing Tasks"
              description="All approved enquiries have been priced."
              icon={IndianRupee}
            />
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => (
                <Card key={enq.id}>
                  <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-500">#{enq.enquiryNumber}</span>
                        <h3 className="font-bold text-base text-slate-900">
                          {enq.materialName} ({enq.quantityKg} Kg)
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{enq.pickupLocation} → {enq.destinationLocation}</span>
                      </p>

                      <p className="text-xs text-slate-500">
                        Vehicle Needed: <strong className="text-slate-800">{enq.vehicleRequirement || "Standard"}</strong> |{" "}
                        Labour: <strong className="text-slate-800">{enq.labourRequired ? "Required" : "Not Required"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      {enq.transportPricing ? (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Approved Total</span>
                          <p className="text-base font-extrabold text-emerald-700">
                            {formatCurrency(enq.transportPricing.totalAmount)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          Pricing Required
                        </span>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenPricingModal(enq)}
                        leftIcon={<IndianRupee className="w-4 h-4" />}
                      >
                        {enq.transportPricing ? "Update Pricing" : "Set Pricing"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        title="Set Enquiry Pricing"
        description={`Configure verified freight rates for enquiry #${selectedEnquiry?.enquiryNumber}`}
      >
        <div className="space-y-4">
          {upfrontQuote && (
            <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Farmer Upfront Estimate: ₹{upfrontQuote.totalAmount}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Farmer placed this booking seeing an upfront quote of <strong>₹{upfrontQuote.totalAmount}</strong> (Transport: ₹{upfrontQuote.transportPrice}, Labour: ₹{upfrontQuote.labourPrice}).
              </p>
              <div className="bg-amber-100/90 text-amber-950 font-bold p-2.5 rounded-lg border border-amber-300 flex items-start gap-2">
                <span className="shrink-0 text-base">⚠️</span>
                <span>
                  If you want to change this price, please contact the farmer first because they booked seeing this exact price. Otherwise, click <strong>"Confirm & Save Price"</strong>.
                </span>
              </div>
            </div>
          )}

          <Input
            label="Transport Base Freight (₹)"
            type="number"
            placeholder="e.g. 805"
            value={transportPrice}
            onChange={(e) => setTransportPrice(e.target.value)}
            leftIcon={<IndianRupee className="w-4 h-4 text-emerald-600" />}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Labour Loading/Unloading Total (₹)
              </label>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                selectedEnquiry?.labourRequired
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                {selectedEnquiry?.labourRequired ? "Farmer Opted: YES (ON)" : "Farmer Opted: NO (OFF)"}
              </span>
            </div>
            <Input
              type="number"
              placeholder="e.g. 350"
              value={labourPrice}
              onChange={(e) => setLabourPrice(e.target.value)}
              leftIcon={<IndianRupee className="w-4 h-4 text-slate-400" />}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              {selectedEnquiry?.labourRequired
                ? "💡 Farmer toggled Labour ON. Pre-filled with the upfront rate shown to farmer."
                : "💡 Farmer kept Labour OFF (₹0 charge)."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
            <span className="font-bold text-emerald-900">Total Approved Cost:</span>
            <span className="text-base font-extrabold text-emerald-700">
              {formatCurrency((Number(transportPrice) || 0) + (Number(labourPrice) || 0))}
            </span>
          </div>

          <Textarea
            label="Pricing Breakdown Notes"
            placeholder="e.g. Rate verified with farmer, standard mandi delivery"
            value={pricingNotes}
            onChange={(e) => setPricingNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePricing} isLoading={isSaving}>
              Confirm & Save Price
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
