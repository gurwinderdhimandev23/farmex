"use client";

import React from "react";
import Link from "next/link";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EnquiryStatusBadge } from "@/features/enquiries/components/EnquiryStatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Truck,
  IndianRupee,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { stats, recentEnquiries, isLoading } = useAdminDashboard();

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl overflow-hidden border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Platform Administration & Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mandi Express <span className="text-emerald-400">Control Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Monitor agricultural freight enquiries, manage transporter assignments, verify fair pricing, and maintain master rate catalogues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/enquiries">
              <Button variant="accent" size="md">
                Review Enquiries ({stats?.pendingEnquiriesCount || 0})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row 1: Users & Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Farmers</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.totalFarmers || 0}</h3>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" /> Active accounts
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Transporters</span>

              <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.totalTransporters || 0}</h3>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <Truck className="w-3 h-3" /> Verified drivers
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Enquiries</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingEnquiriesCount || 0}</h3>
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Action required
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cash Revenue</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(stats?.totalRevenueCash || 0)}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <IndianRupee className="w-3 h-3" /> Settled cash volume
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Row 2: Operational Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Active Enquiries</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats?.activeEnquiriesCount || 0}</p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            In Pipeline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Active Trips on Road</span>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats?.activeTripsCount || 0}</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
            Live Transit
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Completed Mandi Deliveries</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{stats?.completedDeliveriesCount || 0}</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            Delivered
          </span>
        </div>
      </div>

      {/* Recent Enquiries Section: Mobile Responsive Cards + Desktop Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" /> Recent Platform Enquiries
          </h2>
          <Link href="/admin/enquiries" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            <Skeleton className="h-28 w-full rounded-2xl" />
          ) : recentEnquiries.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No enquiries created yet.</div>
          ) : (
            recentEnquiries.map((enq) => (
              <div key={enq.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">#{enq.enquiryNumber}</span>
                  <EnquiryStatusBadge status={enq.status} />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{enq.materialName} ({enq.quantityKg} Kg)</h4>
                  <p className="text-xs text-slate-500 font-medium">Farmer: {enq.farmer?.name} ({enq.farmer?.phone})</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-bold truncate">
                  {enq.pickupLocation} → {enq.destinationLocation}
                </div>

                <Link href="/admin/enquiries" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                    Manage Enquiry
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentEnquiries.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No enquiries created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Enquiry #</th>
                      <th className="px-5 py-3.5">Farmer</th>
                      <th className="px-5 py-3.5">Cargo & Weight</th>
                      <th className="px-5 py-3.5">Route</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentEnquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-800">
                          #{enq.enquiryNumber}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          {enq.farmer?.name || "Farmer"}
                          <span className="block text-[10px] text-slate-400">{enq.farmer?.phone}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {enq.materialName} ({enq.quantityKg} Kg)
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                          {enq.pickupLocation} → {enq.destinationLocation}
                        </td>
                        <td className="px-5 py-4">
                          <EnquiryStatusBadge status={enq.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/admin/enquiries`}>
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

