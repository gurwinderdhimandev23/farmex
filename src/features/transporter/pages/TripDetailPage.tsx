"use client";

import React from "react";
import Link from "next/link";
import { useTripDetail } from "../hooks/useTripDetail";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate, getTripStatusConfig } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowLeft,
  Truck,
  MapPin,
  IndianRupee,
  Gauge,
  Phone,
  Package,
} from "lucide-react";

interface TripDetailPageProps {
  id: string;
}

export const TripDetailPage: React.FC<TripDetailPageProps> = ({ id }) => {
  const { t } = useLanguage();
  const {
    trip,
    isLoading,
    isStatusModalOpen,
    setIsStatusModalOpen,
    targetStatus,
    startOdometer,
    setStartOdometer,
    endOdometer,
    setEndOdometer,
    statusNotes,
    setStatusNotes,
    isUpdatingStatus,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentAmount,
    setPaymentAmount,
    paymentNotes,
    setPaymentNotes,
    isRecordingPayment,
    getNextStatusAction,
    handleOpenStatusModal,
    handleConfirmStatusUpdate,
    handleRecordPayment,
  } = useTripDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-base font-bold text-slate-800">Trip not found.</p>
        <Link href="/transporter/trips" className="text-sm text-emerald-700 font-bold hover:underline mt-2 inline-block">
          {t("backToTrips")}
        </Link>
      </div>
    );
  }

  const nextAction = getNextStatusAction(trip.status);
  const statusCfg = getTripStatusConfig(trip.status);
  const isPaid = trip.payments?.some((p) => p.paymentStatus === "PAID");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/transporter/trips"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" /> {t("backToTrips")}
        </Link>
      </div>

      <Card className="bg-white border border-slate-200/80 shadow-xs">
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-xl text-slate-900">{t("tripNumber")} #{trip.tripNumber}</CardTitle>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusCfg.badgeClass}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t("createdDate")}: {formatDate(trip.createdAt, true)}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {nextAction.nextStatus && (
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenStatusModal}
                leftIcon={<Truck className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {t("updateStatus")}
              </Button>
            )}

            {trip.status === "DELIVERED" && !isPaid && (
              <Button
                variant="accent"
                size="md"
                onClick={() => setIsPaymentModalOpen(true)}
                leftIcon={<IndianRupee className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {t("recordCashPayment")}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("pickupLocation")}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{trip.enquiry?.pickupLocation}</p>
                <p className="text-xs text-slate-600 mt-1">{t("pickupDate")}: {formatDate(trip.enquiry?.pickupDate)}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{t("destinationLocation")}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{trip.enquiry?.destinationLocation}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                <Package className="w-3 h-3 text-emerald-600" /> {t("cropMaterial")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{trip.enquiry?.materialName}</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-600" /> {t("weightKgLabel")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{trip.enquiry?.quantityKg} Kg</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-600" /> {t("startOdometer")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{trip.startOdometer || "—"} km</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-600" /> {t("endOdometer")}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{trip.endOdometer || "—"} km</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> {t("pricingBreakdown")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold">{t("transportCharge")}</span>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(trip.enquiry?.transportPricing?.transportPrice)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold">{t("labourCharge")}</span>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(trip.enquiry?.transportPricing?.labourPrice)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold">{t("cashCollectedStat")}</span>
                <p className="text-base font-extrabold text-emerald-700">
                  {formatCurrency(trip.enquiry?.transportPricing?.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {trip.enquiry?.farmer && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t("farmerLabel")}</span>
                <p className="text-sm font-bold text-slate-900">{trip.enquiry.farmer.name}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {trip.enquiry.farmer.phone}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={t("updateStatus")}
        description="Update trip milestone"
      >
        <div className="space-y-4">
          {targetStatus === "PICKUP" && (
            <Input
              label={t("startOdometer")}
              type="number"
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
              placeholder="e.g. 45200"
              required
            />
          )}

          {targetStatus === "DELIVERED" && (
            <Input
              label={t("endOdometer")}
              type="number"
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
              placeholder="e.g. 45280"
              required
            />
          )}

          <Textarea
            label={t("specialNotes")}
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Notes"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmStatusUpdate}
              isLoading={isUpdatingStatus}
            >
              {t("updateStatus")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={t("recordCashPayment")}
        description="Confirm cash received from farmer"
      >
        <div className="space-y-4">
          <Input
            label={t("cashCollectedStat")}
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />

          <Textarea
            label={t("specialNotes")}
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Notes"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleRecordPayment}
              isLoading={isRecordingPayment}
            >
              {t("recordCashPayment")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
