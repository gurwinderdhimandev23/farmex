"use client";

import React from "react";
import { Enquiry } from "@/types/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { EnquiryTimeline } from "./EnquiryTimeline";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getEnquiryRouteDistance } from "@/lib/pricing-utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Calendar,
  Clock,
  Package,
  Weight,
  Truck,
  Users,
  IndianRupee,
  Phone,
  FileText,
} from "lucide-react";

interface EnquiryDetailsCardProps {
  enquiry: Enquiry;
  actionButtons?: React.ReactNode;
}

const EnquiryDetailsCardComponent: React.FC<EnquiryDetailsCardProps> = ({ enquiry, actionButtons }) => {
  const { t } = useLanguage();
  const routeDist = getEnquiryRouteDistance(enquiry);
  const activeAssignment = enquiry.assignments?.find((a) => a.status === "ACCEPTED") || enquiry.assignments?.[0];
  const activeTrip = enquiry.trips?.[0];
  const assignedTransporter = activeAssignment?.transporter || activeTrip?.transporter;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white border border-slate-200/80 shadow-xs">
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-xl text-slate-900">{t("enquiryNumber")} #{enquiry.enquiryNumber}</CardTitle>
              <EnquiryStatusBadge status={enquiry.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t("createdDate")}: {formatDate(enquiry.createdAt, true)}
            </p>
          </div>
          {actionButtons && <div className="flex items-center gap-2 flex-wrap">{actionButtons}</div>}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Timeline */}
          <div className="pt-2 pb-4 border-b border-slate-100">
            <EnquiryTimeline status={enquiry.status} />
          </div>

          {/* Locations & Route Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("pickupLocation")}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{enquiry.pickupLocation}</p>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(enquiry.pickupDate)}
                  </span>
                  {enquiry.preferredTimeSlot && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {enquiry.preferredTimeSlot}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{t("destinationLocation")}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{enquiry.destinationLocation}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    📍 {routeDist} KM Route
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Commodity & Cargo Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
                <Package className="w-3 h-3 text-emerald-600" /> {t("cropMaterial")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{enquiry.materialName}</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
                <Weight className="w-3 h-3 text-emerald-600" /> {t("weightKgLabel") || "Total Weight"}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {Number(enquiry.quantityKg) / 100} {t("quintals") || "Quintals"}
                <span className="text-xs text-slate-500 font-normal ml-1">({enquiry.quantityKg} Kg)</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600" /> {t("nearbyMatching")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {enquiry.vehicleRequirement || "Matched Vehicle"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-600" /> {t("labourRequired")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {enquiry.labourRequired ? t("labourYes") : t("labourNo")}
              </p>
            </div>
          </div>

          {/* Pricing Summary (Single Final Rate) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> {t("estimatedPrice")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {enquiry.vehicleRequirement || "Matched Vehicle"} • {enquiry.labourRequired ? (t("labourYes")) : (t("labourNo"))}
              </p>
            </div>

            {enquiry.transportPricing ? (
              <div className="text-left sm:text-right">
                <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {formatCurrency(enquiry.transportPricing.totalAmount)}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full mt-1">
                  ✓ {t("upfrontGuaranteedBadge")}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                {t("upfrontGuaranteedBadge")}
              </p>
            )}
          </div>

          {/* Ghar Se Beche Lab Report Card */}
          {enquiry.isSellFromFarm && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  🌾 Ghar Se Beche (Procurement & Quality Lab Report)
                </h4>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  enquiry.sampleStatus === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : enquiry.sampleStatus === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : enquiry.sampleStatus === 'SAMPLE_COLLECTED'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  🧪 {enquiry.sampleStatus === 'APPROVED'
                    ? 'Lab Passed & Approved'
                    : enquiry.sampleStatus === 'REJECTED'
                    ? 'Sample Rejected'
                    : enquiry.sampleStatus === 'SAMPLE_COLLECTED'
                    ? 'Sample Testing in Lab'
                    : 'Sample Collection Pending'}
                </span>
              </div>

              {/* Sample Collection Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Sample Slot</span>
                  <span className="font-extrabold text-slate-900">
                    {enquiry.samplePreferredDate ? formatDate(enquiry.samplePreferredDate) : 'Standard'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{enquiry.samplePreferredSlot || 'Morning'}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Approved Rate</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    {enquiry.quotedPricePerQtl ? `₹${enquiry.quotedPricePerQtl} / Qtl` : 'Under Evaluation'}
                  </span>
                  {enquiry.quotedPricePerQtl && (
                    <span className="text-[10px] text-emerald-800 block font-bold">
                      Est. Payout: ₹{Math.round(Number(enquiry.quotedPricePerQtl) * (Number(enquiry.quantityKg) / 100))}
                    </span>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Distance from Rewari</span>
                  <span className="font-extrabold text-slate-900">
                    {enquiry.distanceFromRewariKm ? `${enquiry.distanceFromRewariKm} KM` : 'Direct Hub'}
                  </span>
                </div>
              </div>

              {/* Lab Remarks */}
              {enquiry.labRemarks && (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">📝 Lab Quality Parameters & Remarks:</span>
                  <p className="text-slate-800">{enquiry.labRemarks}</p>
                </div>
              )}

              {/* Uploaded Lab Report Image */}
              {enquiry.labReportImageUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">📄 Official Lab Test Certificate Image:</span>
                  <a
                    href={enquiry.labReportImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-xl border border-slate-300 max-w-sm hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={enquiry.labReportImageUrl}
                      alt="Lab Report"
                      className="w-full h-48 object-cover bg-slate-100"
                    />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Assigned Transporter details */}
          {assignedTransporter && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t("driverDetails")}</span>
                  <p className="text-sm font-bold text-slate-900">{assignedTransporter.name}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {assignedTransporter.phone}
                  </p>
                </div>
              </div>
              {activeTrip && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t("tripNumber")}</span>
                  <p className="text-xs font-mono font-bold text-slate-900">#{activeTrip.tripNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {enquiry.notes && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> {t("specialNotes")}
              </span>
              <p className="text-slate-600">{enquiry.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const EnquiryDetailsCard = React.memo(EnquiryDetailsCardComponent);
