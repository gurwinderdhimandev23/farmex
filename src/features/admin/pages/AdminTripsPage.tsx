"use client";

import React from "react";
import { useAdminTrips } from "../hooks/useAdminTrips";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, getTripStatusConfig } from "@/lib/utils";
import { Truck, MapPin } from "lucide-react";

export const AdminTripsPage: React.FC = () => {
  const { trips, isLoading } = useAdminTrips();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Trips Monitoring</h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Live tracking and audit log of all active and completed agricultural transport trips.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          title="No Trips Dispatched Yet"
          description="When Transporters accept assigned enquiries, active road trips will be tracked here."
          icon={Truck}
        />
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const statusCfg = getTripStatusConfig(trip.status);
            return (
              <Card key={trip.id}>
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500">#{trip.tripNumber}</span>
                      <h3 className="font-bold text-base text-slate-900">
                        {trip.enquiry?.materialName || "Cargo"} ({trip.enquiry?.quantityKg || 0} Kg)
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusCfg.badgeClass}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{trip.enquiry?.pickupLocation} → {trip.enquiry?.destinationLocation}</span>
                      </span>
                      <span>Dispatched: {formatDate(trip.createdAt, true)}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>
                        Farmer: <strong className="text-slate-800">{trip.enquiry?.farmer?.name || "Farmer"}</strong>
                      </span>
                      <span>
                        Transporter: <strong className="text-slate-800">{trip.transporter?.name || "Operator"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Odometer Range</span>
                    <span className="text-xs font-bold text-slate-800">
                      {trip.startOdometer ? `${trip.startOdometer} km` : "Start: —"} →{" "}
                      {trip.endOdometer ? `${trip.endOdometer} km` : "End: —"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
