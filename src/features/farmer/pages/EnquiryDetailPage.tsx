"use client";

import React from "react";
import Link from "next/link";
import { useEnquiryDetail } from "../hooks/useEnquiryDetail";
import { EnquiryDetailsCard } from "@/features/enquiries/components/EnquiryDetailsCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, XCircle } from "lucide-react";

interface EnquiryDetailPageProps {
  id: string;
}

export const EnquiryDetailPage: React.FC<EnquiryDetailPageProps> = ({ id }) => {
  const { t } = useLanguage();
  const {
    enquiry,
    isLoading,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isCancelling,
    canCancel,
    cancelEnquiry,
  } = useEnquiryDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-base font-bold text-slate-800">Enquiry not found.</p>
        <Link href="/farmer/enquiries" className="text-sm text-emerald-700 font-bold hover:underline mt-2 inline-block">
          {t("backToEnquiries")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/farmer/enquiries"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="w-4 h-4" /> {t("backToEnquiries")}
      </Link>

      <EnquiryDetailsCard
        enquiry={enquiry}
        actionButtons={
          canCancel ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<XCircle className="w-4 h-4 text-rose-600" />}
              onClick={() => setIsCancelModalOpen(true)}
              className="text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              {t("cancel")}
            </Button>
          ) : null
        }
      />

      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={cancelEnquiry}
        title={t("cancel")}
        message="Are you sure you want to cancel this booking?"
        confirmLabel={t("cancel")}
        isDestructive
        isLoading={isCancelling}
      />
    </div>
  );
};
