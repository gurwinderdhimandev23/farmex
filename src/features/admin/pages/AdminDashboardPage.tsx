"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EnquiryStatusBadge } from "@/features/enquiries/components/EnquiryStatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Enquiry } from "@/types/api";
import {
  Users,
  Truck,
  IndianRupee,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Eye,
  RefreshCw,
  MapPin,
  Calendar,
  Package,
  Weight,
  Phone,
  FileText,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { stats, recentEnquiries, isLoading, refreshDashboard } = useAdminDashboard();
  const [selectedBooking, setSelectedBooking] = useState<Enquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "ACTIVE" | "COMPLETED">("ALL");

  const filteredEnquiries = useMemo(() => {
    return recentEnquiries.filter((enq) => {
      // Tab Filter
      if (activeTab === "PENDING" && enq.status !== "SUBMITTED") return false;
      if (
        activeTab === "ACTIVE" &&
        !["ADMIN_ACCEPTED", "TRANSPORTER_ASSIGNED", "TRANSPORTER_ACCEPTED", "PICKUP", "IN_TRANSIT", "ON_DESTINATION"].includes(enq.status)
      ) {
        return false;
      }
      if (activeTab === "COMPLETED" && !["DELIVERED", "PAYMENT_COMPLETED"].includes(enq.status)) return false;

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        enq.enquiryNumber?.toLowerCase().includes(q) ||
        enq.farmer?.name?.toLowerCase().includes(q) ||
        enq.farmer?.phone?.includes(q) ||
        enq.materialName?.toLowerCase().includes(q) ||
        enq.pickupLocation?.toLowerCase().includes(q) ||
        enq.destinationLocation?.toLowerCase().includes(q)
      );
    });
  }, [recentEnquiries, activeTab, searchQuery]);

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
              <Button variant="accent" size="md" className="font-bold shadow-lg shadow-amber-500/20">
                All Enquiries Hub ({stats?.pendingEnquiriesCount || 0} Pending)
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

      {/* Recent Enquiries Section with Direct Detail View & Filtering */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" /> Platform Bookings & Enquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any booking to view its full farmer, driver, route, and rate details directly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshDashboard()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Link href="/admin/enquiries" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
              Go to All Enquiries Tab <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "ALL", label: "All Bookings" },
                { id: "PENDING", label: "Action Required (New)" },
                { id: "ACTIVE", label: "In Progress" },
                { id: "COMPLETED", label: "Completed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search by ID, name, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No bookings match your current filter.
            </div>
          ) : (
            filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                onClick={() => setSelectedBooking(enq)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 cursor-pointer hover:border-emerald-400 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">#{enq.enquiryNumber}</span>
                  <EnquiryStatusBadge status={enq.status} />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900">{enq.materialName} ({enq.quantityKg} Kg)</h4>
                    {enq.transportPricing?.totalAmount && (
                      <span className="text-xs font-black text-emerald-700">
                        {formatCurrency(enq.transportPricing.totalAmount)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Farmer: {enq.farmer?.name} ({enq.farmer?.phone})</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-bold truncate">
                  {enq.pickupLocation} → {enq.destinationLocation}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(enq.pickupDate)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(enq);
                    }}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Interactive Table */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No bookings found. Try adjusting your search query or tab filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Enquiry #</th>
                      <th className="px-5 py-3.5">Farmer</th>
                      <th className="px-5 py-3.5">Cargo & Weight</th>
                      <th className="px-5 py-3.5">Route</th>
                      <th className="px-5 py-3.5">Scheduled Date</th>
                      <th className="px-5 py-3.5">Price</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnquiries.map((enq) => (
                      <tr
                        key={enq.id}
                        onClick={() => setSelectedBooking(enq)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-slate-800">
                          #{enq.enquiryNumber}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          <span className="font-bold text-slate-900 block">{enq.farmer?.name || "Farmer"}</span>
                          <span className="text-[10px] text-slate-400">{enq.farmer?.phone}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {enq.materialName}
                          <span className="block text-[11px] font-normal text-slate-500">
                            {Number(enq.quantityKg) / 100} Qtl ({enq.quantityKg} Kg)
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                          <span className="font-medium text-slate-800 block truncate">{enq.pickupLocation}</span>
                          <span className="text-[10px] text-slate-400 block truncate">➔ {enq.destinationLocation}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {formatDate(enq.pickupDate)}
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-700">
                          {enq.transportPricing?.totalAmount
                            ? formatCurrency(enq.transportPricing.totalAmount)
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <EnquiryStatusBadge status={enq.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(enq);
                            }}
                            leftIcon={<Eye className="w-3.5 h-3.5 text-emerald-600" />}
                          >
                            View Details
                          </Button>
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

      {/* DIRECT BOOKING DETAIL MODAL (No need to navigate away!) */}
      <Modal
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        title={`Booking Details #${selectedBooking?.enquiryNumber || ""}`}
        description="Comprehensive farmer enquiry, route, rate, and assignment overview"
        maxWidth="2xl"
      >
        {selectedBooking && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Top Status & Date Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  #{selectedBooking.enquiryNumber}
                </span>
                <EnquiryStatusBadge status={selectedBooking.status} />
              </div>
              <div className="text-right text-slate-500">
                <span>Created: {formatDate(selectedBooking.createdAt, true)}</span>
              </div>
            </div>

            {/* Farmer Contact Info */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Farmer Contact
              </span>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {selectedBooking.farmer?.name || "Farmer"}
                    </h4>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {selectedBooking.farmer?.phone}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${selectedBooking.farmer?.phone}`}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Farmer
                </a>
              </div>
            </div>

            {/* Route & Schedule Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> Pickup Location
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedBooking.pickupLocation}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {formatDate(selectedBooking.pickupDate)} • {selectedBooking.preferredTimeSlot || "Morning"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" /> Destination Mandi
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedBooking.destinationLocation}</p>
              </div>
            </div>

            {/* Commodity, Vehicle & Pricing */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Package className="w-3 h-3 text-emerald-600" /> Commodity & Weight
                </span>
                <p className="font-bold text-slate-900 mt-1">{selectedBooking.materialName}</p>
                <p className="text-slate-500 font-medium text-[11px]">
                  {Number(selectedBooking.quantityKg) / 100} Qtl ({selectedBooking.quantityKg} Kg)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-emerald-600" /> Vehicle Type
                </span>
                <p className="font-bold text-slate-900 mt-1 truncate">
                  {selectedBooking.vehicleRequirement || "Standard"}
                </p>
                <p className="text-slate-500 font-medium text-[11px]">
                  Labour: {selectedBooking.labourRequired ? "Yes" : "No"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-emerald-600" /> Final Total Fare
                </span>
                <p className="text-base font-black text-emerald-700 mt-1">
                  {selectedBooking.transportPricing?.totalAmount
                    ? formatCurrency(selectedBooking.transportPricing.totalAmount)
                    : "Under Review"}
                </p>
              </div>
            </div>

            {/* Special Instructions for Driver */}
            {selectedBooking.notes && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600" /> Special Instructions / Notes:
                </span>
                <p className="text-amber-950 font-medium whitespace-pre-wrap">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>

              <Link href={`/admin/enquiries`} onClick={() => setSelectedBooking(null)}>
                <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Manage in All Enquiries Hub
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

