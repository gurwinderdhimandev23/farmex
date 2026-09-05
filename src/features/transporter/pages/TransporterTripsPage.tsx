"use client";

import React from "react";
import Link from "next/link";
import { useTransporterTrips } from "../hooks/useTransporterTrips";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, getTripStatusConfig } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Truck, MapPin, ArrowRight } from "lucide-react";

export const TransporterTripsPage: React.FC = () => {
  const { t } = useLanguage();
  const { displayedTrips, isLoading, activeTab, setActiveTab, tabOptions } = useTransporterTrips();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("myTripsHistoryTitle")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("heroTransporterSubtitle")}
          </p>
        </div>
      </div>

      <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : displayedTrips.length === 0 ? (
        <EmptyState
          title={t("noTripsFoundTitle")}
          description={t("noTripsFoundDesc")}
          icon={Truck}
        />
      ) : (
        <div className="space-y-3">
          {displayedTrips.map((trip) => {
            const statusCfg = getTripStatusConfig(trip.status);
            return (
              <Link key={trip.id} href={`/transporter/trips/${trip.id}`} className="block">
                <Card hoverEffect className="bg-white border border-slate-200/80 shadow-sm">
                  <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">#{trip.tripNumber}</span>
                        <h3 className="font-bold text-base text-slate-900">
                          {trip.enquiry?.materialName || "Shipment Produce"} ({trip.enquiry?.quantityKg || 0} Kg)
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusCfg.badgeClass}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {trip.enquiry?.pickupLocation} → {trip.enquiry?.destinationLocation}
                          </span>
                        </span>
                        <span>{t("createdDate")}: {formatDate(trip.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        {t("updateStatus")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
