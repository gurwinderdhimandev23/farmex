"use client";

import React from "react";
import { EnquiryForm } from "../components/EnquiryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const NewEnquiryPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <Link
          href="/farmer/enquiries"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Farm-to-Mandi Transport</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Enter pickup farm location, Mandi destination, crop weight, and labour requirements.
        </p>
      </div>

      <EnquiryForm />
    </div>
  );
};
