"use client";

import React from "react";
import Link from "next/link";
import { Enquiry } from "@/types/api";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Truck,
  Phone,
  Calendar,
  Package,
  ChevronRight,
  User,
} from "lucide-react";

interface ShipmentRouteCardProps {
  enquiry: Enquiry;
  href?: string;
  actionButton?: React.ReactNode;
}

const ShipmentRouteCardComponent: React.FC<ShipmentRouteCardProps> = ({
  enquiry,
  href,
  actionButton,
}) => {
  const { t } = useLanguage();
  const assignedTrip = enquiry.trips && enquiry.trips.length > 0 ? enquiry.trips[0] : null;
  const assignedTransporter = assignedTrip?.transporter || enquiry.assignments?.[0]?.transporter || (enquiry as any).assignedTransporter;

  const cardContent = (
    <div className="group relative rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 shadow-lg hover:border-emerald-400/60 transition-all duration-300 overflow-hidden active:scale-[0.99] select-none">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 opacity-80" />

      {/* Header: Commodity Title & Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-2xs">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold text-emerald-400 tracking-wider">
                #{enquiry.enquiryNumber}
              </span>
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded">
                {enquiry.quantityKg} Kg
              </span>
              {enquiry.isSellFromFarm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  🌾 Ghar Se Beche
                </span>
              )}
              {enquiry.isSellFromFarm && enquiry.sampleStatus && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                  enquiry.sampleStatus === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                    : enquiry.sampleStatus === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : enquiry.sampleStatus === 'SAMPLE_COLLECTED'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400'
                }`}>
                  🧪 {enquiry.sampleStatus === 'APPROVED'
                    ? `Lab Approved ${enquiry.quotedPricePerQtl ? `(₹${enquiry.quotedPricePerQtl}/Qtl)` : ''}`
                    : enquiry.sampleStatus === 'REJECTED'
                    ? 'Lab Rejected'
                    : enquiry.sampleStatus === 'SAMPLE_COLLECTED'
                    ? 'Sample in Lab'
                    : 'Sample Scheduled'}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight mt-0.5">
              {enquiry.materialName}
            </h3>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <EnquiryStatusBadge status={enquiry.status} />
        </div>
      </div>

      {/* Route Visualizer Bar */}
      <div className="my-3.5 p-3 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs">
          {/* Pickup Dot */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-900 shrink-0 animate-pulse" />
            <span className="font-bold text-white truncate">{enquiry.pickupLocation}</span>
          </div>

          {/* Dotted Arrow */}
          <div className="flex-1 px-3 flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-emerald-500/40 relative flex items-center justify-center">
              <div className="absolute bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Direct</span>
              </div>
            </div>
          </div>

          {/* Destination Dot */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-white truncate">{enquiry.destinationLocation}</span>
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Transporter Details & Pricing Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
        {/* Left Info: Transporter & Pickup Date */}
        <div className="flex items-center gap-3 flex-wrap">
          {assignedTransporter ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{assignedTransporter.name}</span>
              <a
                href={`tel:${assignedTransporter.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="ml-1 p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                title="Call Transporter"
              >
                <Phone className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 italic flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {t("transporterLabel")} Pending
            </span>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("pickupDate")}: {formatDate(enquiry.pickupDate)}</span>
          </div>
        </div>

        {/* Right Info: Total Price & Arrow CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {enquiry.transportPricing ? (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t("estimatedPrice")}</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                {formatCurrency(enquiry.transportPricing.totalAmount)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/40">
              Pricing Pending
            </span>
          )}

          {actionButton ? (
            <div onClick={(e) => e.stopPropagation()}>{actionButton}</div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>;
  }

  return cardContent;
};

export const ShipmentRouteCard = React.memo(ShipmentRouteCardComponent);
