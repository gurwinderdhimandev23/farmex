import React from "react";
import { EnquiryStatus } from "@/types/api";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnquiryTimelineProps {
  status: EnquiryStatus;
}

export const EnquiryTimeline: React.FC<EnquiryTimelineProps> = ({ status }) => {
  const steps: { label: string; keyStatuses: EnquiryStatus[] }[] = [
    { label: "Submitted", keyStatuses: ["SUBMITTED"] },
    { label: "Admin Approved", keyStatuses: ["ADMIN_ACCEPTED"] },
    { label: "Transporter Assigned", keyStatuses: ["TRANSPORTER_ASSIGNED", "TRANSPORTER_ACCEPTED"] },
    { label: "In Transit", keyStatuses: ["PICKUP", "IN_TRANSIT", "ON_DESTINATION"] },
    { label: "Delivered", keyStatuses: ["DELIVERED", "PAYMENT_COMPLETED"] },
  ];

  const getStatusIndex = (st: EnquiryStatus): number => {
    if (st === "CANCELLED" || st === "ADMIN_REJECTED" || st === "TRANSPORTER_REJECTED") return -1;
    if (st === "SUBMITTED") return 0;
    if (st === "ADMIN_ACCEPTED") return 1;
    if (st === "TRANSPORTER_ASSIGNED" || st === "TRANSPORTER_ACCEPTED") return 2;
    if (st === "PICKUP" || st === "IN_TRANSIT" || st === "ON_DESTINATION") return 3;
    if (st === "DELIVERED" || st === "PAYMENT_COMPLETED") return 4;
    return 0;
  };

  const currentIndex = getStatusIndex(status);
  const isFailed = status === "CANCELLED" || status === "ADMIN_REJECTED" || status === "TRANSPORTER_REJECTED";

  if (isFailed) {
    return (
      <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Enquiry Status: {status.replace("_", " ")}</p>
          <p className="text-xs text-rose-600 mt-0.5">This transport enquiry cannot progress further.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between">
        {/* Connecting Track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-slate-200 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-emerald-500 transition-all duration-500 z-0"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs",
                  isDone
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : isCurrent
                    ? "bg-amber-500 text-slate-950 ring-4 ring-amber-100 animate-pulse"
                    : "bg-white text-slate-400 border border-slate-200"
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : isCurrent ? <Clock className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "absolute -bottom-6 text-[10px] font-bold text-center whitespace-nowrap",
                  isCurrent ? "text-amber-700" : isDone ? "text-emerald-800" : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" />
    </div>
  );
};
