"use client";

import React, { useState, useMemo } from "react";
import { useAdminEnquiries } from "../hooks/useAdminEnquiries";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { EnquiryStatusBadge } from "@/features/enquiries/components/EnquiryStatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, CheckCircle2, XCircle, IndianRupee, Truck, MapPin, Calendar, UserCheck, AlertCircle, Phone, AlertTriangle, Package, FlaskConical } from "lucide-react";
import { DocumentUploader } from "@/components/ui/DocumentUploader";

export const AdminEnquiriesPage: React.FC = () => {
  const {
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
    setAssignEnquiry,
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
  } = useAdminEnquiries();

  const [transporterSearchTerm, setTransporterSearchTerm] = useState("");

  const filteredTransporters = useMemo(() => {
    if (!transporterSearchTerm.trim()) return transporters;
    const term = transporterSearchTerm.toLowerCase();
    return transporters.filter(
      (t) => t.name.toLowerCase().includes(term) || t.phone.includes(term)
    );
  }, [transporters, transporterSearchTerm]);

  const selectedTransporter = useMemo(() => {
    return transporters.find((t) => t.id === transporterId);
  }, [transporters, transporterId]);

  const vehicleOptions = useMemo(() => {
    const vehicles = selectedTransporter?.transporterProfile?.vehicles || [];
    return [
      { value: "", label: "-- Auto / Transporter will assign vehicle --" },
      ...vehicles.map((v) => ({
        value: v.id,
        label: `${v.registrationNumber} (${v.vehicleType} - ${v.capacityTonnes} Tonnes)`,
      })),
    ];
  }, [selectedTransporter]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage All Enquiries</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Accept/Reject bookings, approve freight & labour prices, and dispatch transporters.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search farmer, crop, enquiry #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-xl border border-slate-200/80 focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <EmptyState
          title="No Enquiries in Category"
          description={searchQuery ? `No enquiries matched "₹{searchQuery}".` : "No enquiries in this filter."}
        />
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => (
            <Card key={enq.id}>
              <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500">#{enq.enquiryNumber}</span>
                    <h3 className="font-bold text-base text-slate-900">
                      {enq.materialName} ({enq.quantityKg} Kg)
                    </h3>
                    <EnquiryStatusBadge status={enq.status} />
                    {enq.isSellFromFarm && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        🌾 Ghar Se Beche
                      </span>
                    )}
                    {enq.distanceFromRewariKm && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                        📍 {enq.distanceFromRewariKm} KM from Rewari Hub
                      </span>
                    )}
                    {enq.isSellFromFarm && enq.sampleStatus && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        enq.sampleStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : enq.sampleStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : enq.sampleStatus === 'SAMPLE_COLLECTED'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        🧪 Sample: {enq.sampleStatus} {enq.quotedPricePerQtl ? `(₹${enq.quotedPricePerQtl}/Qtl)` : ''}
                      </span>
                    )}
                    {enq.isReturnLoad && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Return Load
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{enq.pickupLocation} → {enq.destinationLocation}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Pickup: {formatDate(enq.pickupDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                    <span>
                      Farmer: <strong className="text-slate-800">{enq.farmer?.name || "Farmer"}</strong> ({enq.farmer?.phone})
                    </span>

                    {(() => {
                      const assignedTransporter = enq.assignments?.[0]?.transporter || enq.trips?.[0]?.transporter;
                      if (!assignedTransporter) return null;
                      return (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-lg border border-emerald-200/90 font-medium">
                          <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          Transporter: <strong className="font-bold text-slate-900">{assignedTransporter.name}</strong> ({assignedTransporter.phone})
                        </span>
                      );
                    })()}

                    {enq.transportPricing && (
                      <span className="text-emerald-700 font-bold">
                        Priced: {formatCurrency(enq.transportPricing.totalAmount)}
                      </span>
                    )}
                  </div>

                </div>

                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {enq.isSellFromFarm && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FlaskConical className="w-4 h-4 text-amber-700" />}
                      onClick={() => handleOpenSampleModal(enq)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    >
                      Sample & Lab Desk
                    </Button>
                  )}

                  {enq.status === "SUBMITTED" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={() => {
                          setReviewEnquiry(enq);
                          setReviewAction("ADMIN_ACCEPTED");
                          setReviewNotes("");
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => {
                          setReviewEnquiry(enq);
                          setReviewAction("ADMIN_REJECTED");
                          setReviewNotes("");
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {enq.status === "ADMIN_ACCEPTED" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<IndianRupee className="w-4 h-4 text-emerald-600" />}
                        onClick={() => handleOpenPricingModal(enq)}
                      >
                        {enq.transportPricing ? "Edit Pricing" : "Set Pricing"}
                      </Button>

                      <Button
                        variant="accent"
                        size="sm"
                        disabled={enq.isSellFromFarm && enq.sampleStatus !== "APPROVED"}
                        leftIcon={<Truck className="w-4 h-4" />}
                        onClick={() => {
                          if (enq.isSellFromFarm && enq.sampleStatus !== "APPROVED") {
                            alert("Sample test report must be APPROVED before assigning a transporter!");
                            return;
                          }
                          setAssignEnquiry(enq);
                          setTransporterId("");
                          setVehicleId("");
                          setAssignNotes("");
                        }}
                        title={enq.isSellFromFarm && enq.sampleStatus !== "APPROVED" ? "Sample must be approved first" : undefined}
                      >
                        {enq.isSellFromFarm && enq.sampleStatus !== "APPROVED"
                          ? "⏳ Awaiting Lab Approval"
                          : "Assign Transporter"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewEnquiry}
        onClose={() => setReviewEnquiry(null)}
        title={reviewAction === "ADMIN_ACCEPTED" ? "Approve Enquiry" : "Reject Enquiry"}
        description={`Review booking #${reviewEnquiry?.enquiryNumber}`}
      >
        <div className="space-y-4">
          <Textarea
            label="Admin Review Remarks (Optional)"
            placeholder="e.g. Route confirmed, standard rate applicable"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReviewEnquiry(null)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === "ADMIN_ACCEPTED" ? "primary" : "destructive"}
              size="sm"
              onClick={handleConfirmReview}
              isLoading={isReviewing}
            >
              Confirm {reviewAction === "ADMIN_ACCEPTED" ? "Approval" : "Rejection"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Set Pricing Modal */}
      <Modal
        isOpen={!!pricingEnquiry}
        onClose={() => setPricingEnquiry(null)}
        title="Set Transport & Labour Pricing"
        description={`Set verified rates for enquiry #${pricingEnquiry?.enquiryNumber}`}
      >
        <div className="space-y-4">
          {upfrontQuote && (
            <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Farmer Upfront Estimate: ₹{upfrontQuote.totalAmount}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Farmer booked this transport seeing an upfront quote of <strong>₹{upfrontQuote.totalAmount}</strong> (Transport: ₹{upfrontQuote.transportPrice}, Labour: ₹{upfrontQuote.labourPrice}).
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
            label="Transport Freight Price (₹)"
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
                Labour Loading / Unloading Charge (₹)
              </label>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                pricingEnquiry?.labourRequired
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                {pricingEnquiry?.labourRequired ? "Farmer Opted: YES (ON)" : "Farmer Opted: NO (OFF)"}
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
              {pricingEnquiry?.labourRequired
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
            label="Pricing Notes"
            placeholder="e.g. Rate verified with farmer, standard mandi delivery"
            value={pricingNotes}
            onChange={(e) => setPricingNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPricingEnquiry(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmPricing}
              isLoading={isSettingPricing}
            >
              Confirm & Save Price
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Transporter Modal */}
      <Modal
        isOpen={!!assignEnquiry}
        onClose={() => setAssignEnquiry(null)}
        title="Assign Nearest Transporter & Vehicle"
        description={`Assign driver to enquiry #${assignEnquiry?.enquiryNumber} based on proximity`}
      >
        <div className="space-y-4">
          {/* Pickup Point Context Card */}
          {assignEnquiry && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 text-xs space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  {assignEnquiry.pickupLocation}
                </span>
                {assignEnquiry.pickupLatitude && assignEnquiry.pickupLongitude && (
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                    📍 {Number(assignEnquiry.pickupLatitude).toFixed(4)}, {Number(assignEnquiry.pickupLongitude).toFixed(4)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-3">
                <span>Produce: <strong className="text-emerald-400">{assignEnquiry.materialName}</strong> ({Number(assignEnquiry.quantityKg) / 100} Quintals)</span>
                <span>• Drop: {assignEnquiry.destinationLocation}</span>
              </div>
            </div>
          )}

          {/* Quick Search Filter by Mobile / Name */}
          <Input
            label="Filter Drivers (Name or Phone)"
            placeholder="Type driver phone or name..."
            value={transporterSearchTerm}
            onChange={(e) => setTransporterSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          {/* Transporter Pre-populated Select Dropdown (Sorted by Proximity) */}
          <Select
            label="Select Driver (Sorted: Nearest to Farthest)"
            required
            value={transporterId}
            onChange={(e) => {
              setTransporterId(e.target.value);
              setVehicleId("");
            }}
            options={[
              { value: "", label: "-- Select Transporter (Nearest First) --" },
              ...filteredTransporters.map((t, idx) => {
                const vCount = t.transporterProfile?.vehicles?.length || 0;
                const status = t.transporterProfile?.status || "AVAILABLE";
                const distText = t.distanceBadge ? `${t.distanceBadge} ` : "";
                const isNearest = idx === 0 && t.distanceKm !== undefined && t.distanceKm < 99999;
                return {
                  value: t.id,
                  label: `${isNearest ? "⭐ NEAREST: " : ""}${distText}• ${t.name} (${t.phone}) • [${status}]${vCount > 0 ? ` • ${vCount} Veh` : ""}`,
                };
              }),
            ]}
            helperText={
              isTransportersLoading
                ? "Calculating nearest drivers from pickup GPS coordinates..."
                : transporters.length === 0
                ? "No registered transporters in system."
                : `${filteredTransporters.length} driver(s) found • Sorted by distance`
            }
          />

          {/* Selected Transporter Details Card */}
          {selectedTransporter && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {selectedTransporter.name}
                </span>
                <div className="flex items-center gap-1.5">
                  {selectedTransporter.distanceBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {selectedTransporter.distanceBadge}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedTransporter.transporterProfile?.status || "AVAILABLE"}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone: {selectedTransporter.phone}
              </p>
              {selectedTransporter.transporterProfile?.address && (
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Base Location: {selectedTransporter.transporterProfile.address}
                </p>
              )}
            </div>
          )}

          {/* Vehicle Select Dropdown */}
          {selectedTransporter && (
            <Select
              label="Assign Specific Vehicle (Optional)"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              options={vehicleOptions}
              helperText={
                (selectedTransporter.transporterProfile?.vehicles?.length || 0) === 0
                  ? "Transporter has no active registered vehicles. Transporter can assign vehicle during pickup."
                  : undefined
              }
            />
          )}

          {transporters.length === 0 && !isTransportersLoading && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>No active transporters registered in system yet.</span>
            </div>
          )}

          <Textarea
            label="Assignment Instructions for Transporter"
            placeholder="e.g. Contact farmer 1 hour before pickup"
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAssignEnquiry(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAssign}
              isLoading={isAssigning}
              disabled={!transporterId}
            >
              Assign Transporter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ghar Se Beche: Sample Collection & Lab Testing Desk Modal */}
      <Modal
        isOpen={!!sampleEnquiry}
        onClose={() => setSampleEnquiry(null)}
        title="🌾 Ghar Se Beche: Sample & Lab Desk"
        description={`Procurement & Lab Testing for Booking #${sampleEnquiry?.enquiryNumber} (${sampleEnquiry?.materialName} - ${sampleEnquiry?.quantityKg} Kg)`}
        maxWidth="2xl"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* Summary Box */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
            <div className="flex justify-between font-bold text-amber-950">
              <span>Farmer: {sampleEnquiry?.farmer?.name} ({sampleEnquiry?.farmer?.phone})</span>
              <span>Distance from Rewari: {sampleEnquiry?.distanceFromRewariKm ? `${sampleEnquiry.distanceFromRewariKm} KM` : '~20 KM'}</span>
            </div>
            <p className="text-slate-600">
              Pickup Village / Farm: <strong>{sampleEnquiry?.pickupLocation}</strong>
            </p>
            <p className="text-slate-600">
              Requested Slot: <strong>{sampleEnquiry?.samplePreferredDate ? formatDate(sampleEnquiry.samplePreferredDate) : 'Default'}</strong> ({sampleEnquiry?.samplePreferredSlot || 'Morning'})
            </p>
          </div>

          {/* Status Selector */}
          <Select
            label="Sample Progress Status"
            value={sampleStatus}
            onChange={(e) => setSampleStatus(e.target.value as any)}
            options={[
              { value: "PENDING_COLLECTION", label: "1. 🟡 Pending Field Collection (Awaiting Agent)" },
              { value: "COLLECTION_ASSIGNED", label: "2. 🚚 Agent Dispatched to Farm" },
              { value: "SAMPLE_COLLECTED", label: "3. 🧪 Sample Collected & Under Testing in Rewari Lab" },
              { value: "APPROVED", label: "4. 🟢 Quality Approved & Rate Quoted" },
              { value: "REJECTED", label: "5. 🔴 Quality Rejected (Below Standard)" },
            ]}
          />

          {/* Collector Agent Notes */}
          <Input
            label="Field Agent & Collection Notes"
            placeholder="e.g. Agent Suresh collected 2kg sample from farmer field"
            value={sampleCollectorNotes}
            onChange={(e) => setSampleCollectorNotes(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quoted Price per Quintal */}
            <Input
              label="Quoted Rate per Quintal (₹ / Qtl)"
              type="number"
              placeholder="e.g. 5450"
              value={quotedPricePerQtl}
              onChange={(e) => setQuotedPricePerQtl(e.target.value)}
              helperText={
                quotedPricePerQtl && sampleEnquiry?.quantityKg
                  ? `Est. Farmer Gross: ₹${Math.round(Number(quotedPricePerQtl) * (Number(sampleEnquiry.quantityKg) / 100))}`
                  : "Rate offered to farmer post lab verification"
              }
            />

            {/* Lab Quality Remarks */}
            <Input
              label="Lab Quality Parameters & Remarks"
              placeholder="e.g. Moisture: 7.2%, Purity: 98.5%, Grade A"
              value={labRemarks}
              onChange={(e) => setLabRemarks(e.target.value)}
            />
          </div>

          {/* Lab Report Image Upload */}
          <div className="pt-2">
            <DocumentUploader
              label="Lab Test Certificate / Quality Report Photo"
              description="Upload verified photo/scan of the physical lab test certificate"
              value={labReportImageUrl}
              onChange={(url) => setLabReportImageUrl(url)}
              folder="lab_reports"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleConfirmSampleWorkflow("REJECTED")}
              isLoading={isUpdatingSample}
            >
              <XCircle className="w-4 h-4 mr-1" /> Reject Sample
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" onClick={() => setSampleEnquiry(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleConfirmSampleWorkflow()}
                isLoading={isUpdatingSample}
              >
                Save Status
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleConfirmSampleWorkflow("APPROVED")}
                isLoading={isUpdatingSample}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Publish Rate
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

