"use client";

import React from "react";
import { useTransporterRequests } from "../hooks/useTransporterRequests";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { PackageCheck, Check, X, Clock, AlertCircle } from "lucide-react";

export const TransporterRequestsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    requests,
    isLoading,
    setSelectedRequestId,
    rejectionReason,
    setRejectionReason,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isResponding,
    handleAccept,
    handleReject,
  } = useTransporterRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("pickupRequestsTitle")}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t("heroTransporterSubtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title={t("noTripsFoundTitle")}
          description={t("noTripsFoundDesc")}
          icon={PackageCheck}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="bg-white border border-slate-200/80 shadow-sm">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      Assignment #{req.id.substring(0, 8)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Response Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Assigned: {formatDate(req.assignedAt, true)}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Status: {req.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<X className="w-4 h-4 text-rose-600" />}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={isResponding}
                    className="flex-1 md:flex-none text-rose-700 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                  >
                    {t("rejectRequest")}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={() => handleAccept(req.id)}
                    isLoading={isResponding}
                    className="flex-1 md:flex-none cursor-pointer"
                  >
                    {t("acceptRequest")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={t("rejectRequest")}
        description="Reason for declining request"
      >
        <div className="space-y-4">
          <Textarea
            label={t("specialNotes")}
            placeholder="Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              isLoading={isResponding}
            >
              {t("rejectRequest")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
