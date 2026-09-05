"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTransporterDashboard } from "../hooks/useTransporterDashboard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getTripStatusConfig } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthStore } from "@/store/useAuthStore";
import { patchData, ENDPOINTS } from "@/lib/api-client";
import { toast } from "sonner";
import { DocumentUploader } from "@/components/ui/DocumentUploader";
import { Input } from "@/components/ui/Input";
import {
  Truck,
  PackageCheck,
  IndianRupee,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Phone,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Navigation,
  Loader2,
  AlertTriangle,
  FileText,
  Upload,
  X,
  Send,
} from "lucide-react";

export const TransporterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { refreshUser } = useAuthStore();
  const { t, language } = useLanguage();
  const isHi = language === "hi";
  const { requests, allTrips, activeTrips, completedTrips, earnings, isLoading } = useTransporterDashboard();
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [isUpdatingGPS, setIsUpdatingGPS] = useState(false);

  // Re-apply KYC Modal State
  const [isReapplyOpen, setIsReapplyOpen] = useState(false);
  const [reapplyLicense, setReapplyLicense] = useState(user?.transporterProfile?.licenseNumber || "");
  const [reapplyLicensePhotoUrl, setReapplyLicensePhotoUrl] = useState<string | null>(user?.transporterProfile?.licensePhotoUrl || null);
  const [reapplyAadhaar, setReapplyAadhaar] = useState(user?.transporterProfile?.aadhaarNumber || "");
  const [reapplyFrontUrl, setReapplyFrontUrl] = useState<string | null>(user?.transporterProfile?.aadhaarFrontUrl || null);
  const [reapplyBackUrl, setReapplyBackUrl] = useState<string | null>(user?.transporterProfile?.aadhaarBackUrl || null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Sync state when user changes
  React.useEffect(() => {
    if (user?.transporterProfile) {
      setReapplyLicense(user.transporterProfile.licenseNumber || "");
      setReapplyLicensePhotoUrl(user.transporterProfile.licensePhotoUrl || null);
      setReapplyAadhaar(user.transporterProfile.aadhaarNumber || "");
      setReapplyFrontUrl(user.transporterProfile.aadhaarFrontUrl || null);
      setReapplyBackUrl(user.transporterProfile.aadhaarBackUrl || null);
    }
  }, [user]);

  // Determine displayed list
  let displayedList = allTrips;
  if (selectedFilter === "ACTIVE") {
    displayedList = activeTrips;
  } else if (selectedFilter === "COMPLETED") {
    displayedList = completedTrips;
  }

  const completedCount = Math.max(earnings?.totalTripsCompleted || 0, completedTrips.length);

  const isVerified = user?.transporterProfile?.isVerified === true;
  const kycStatus = user?.transporterProfile?.kycStatus || (isVerified ? "APPROVED" : "PENDING");
  const currentAddress = user?.transporterProfile?.address || "Station location not set yet";

  const handleReapplyKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reapplyLicense.trim()) {
      toast.error("Commercial Driving License number is required");
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const res = await patchData(
        ENDPOINTS.AUTH.ME,
        {
          licenseNumber: reapplyLicense.trim(),
          licensePhotoUrl: reapplyLicensePhotoUrl || undefined,
          aadhaarNumber: reapplyAadhaar.trim() || undefined,
          aadhaarFrontUrl: reapplyFrontUrl || undefined,
          aadhaarBackUrl: reapplyBackUrl || undefined,
          kycStatus: "PENDING", // Resets back to pending for Admin re-verification
        },
        { showSuccessToast: isHi ? "✅ दस्तावेज दोबारा जमा हो गए! एडमिन जल्द जांच करेगा।" : "✅ KYC documents re-submitted for Admin verification!" }
      );

      if (res.success) {
        await refreshUser();
        setIsReapplyOpen(false);
      }
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // 1-Click GPS Quick Location Update handler
  const handleQuickGPSUpdate = () => {
    if (!navigator.geolocation) {
      toast.error(isHi ? "GPS उपलब्ध नहीं है" : "GPS Geolocation is not supported");
      return;
    }

    setIsUpdatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocode to get clean address
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en,hi" } }
          );

          let addr = `GPS Station (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) addr = data.display_name;
          }

          const patchRes = await patchData(
            ENDPOINTS.AUTH.ME,
            { address: addr, latitude: lat, longitude: lng },
            { showSuccessToast: isHi ? "📍 लाइव लोकेशन और GPS अपडेट हो गई!" : "📍 Live station location & GPS updated!" }
          );

          if (patchRes.success) {
            await refreshUser();
          }
        } catch {
          toast.error("Failed to update GPS location");
        } finally {
          setIsUpdatingGPS(false);
        }
      },
      (err) => {
        setIsUpdatingGPS(false);
        toast.error(`GPS Error: ${err.message}. Please allow browser location access.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl overflow-hidden border border-emerald-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("transporterPortal")}</span>
              </div>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-400/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Driver
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> KYC Under Review
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t("heroGreeting")}, <span className="text-emerald-400">{user?.name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {t("heroTransporterSubtitle")}
            </p>
          </div>

          <Link href="/transporter/requests" className="w-full sm:w-auto">
            <Button
              variant="accent"
              size="lg"
              leftIcon={<PackageCheck className="w-5 h-5 text-slate-950" />}
              className="shadow-lg shadow-amber-500/25 w-full sm:w-auto whitespace-nowrap font-extrabold"
              disabled={!isVerified}
            >
              {t("navPickupRequests")} ({requests.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KYC UNDER REVIEW / REJECTED BANNER */}
      {!isVerified && (
        <div className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
          kycStatus === "REJECTED"
            ? "bg-rose-950/80 border-rose-500/50 text-rose-100"
            : "bg-amber-950/80 border-amber-500/50 text-amber-100"
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              kycStatus === "REJECTED" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
            }`}>
              {kycStatus === "REJECTED" ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white">
                {kycStatus === "REJECTED"
                  ? isHi ? "❌ आपकी KYC अस्वीकृत (Reject) हो गई है" : "❌ Transporter KYC Rejected"
                  : isHi ? "⏳ आपका खाता सत्यापन (KYC Under Review) में है" : "⏳ Transporter KYC Under Review"}
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {kycStatus === "REJECTED"
                  ? user?.transporterProfile?.rejectionReason || (isHi ? "कृपया अपनी प्रोफाइल में जाकर सही ड्राइविंग लाइसेंस या आधार कार्ड फोटो दोबारा अपलोड करें।" : "Please re-upload clear photos of your Driving License or Aadhaar card in your profile.")
                  : isHi
                  ? "एडमिन द्वारा आपके कमर्शियल ड्राइविंग लाइसेंस और आधार कार्ड की जांच की जा रही है। अप्रूव होते ही आपके पास पिकअप रिक्वेस्ट और ट्रिप्स आनी शुरू हो जाएंगी।"
                  : "Admin is verifying your Commercial Driving License and Aadhaar KYC documents. Once approved, nearby pickup requests and trips will start arriving."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {kycStatus === "REJECTED" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReapplyOpen(true)}
                leftIcon={<Upload className="w-4 h-4" />}
                className="w-full sm:w-auto text-xs font-black shadow-md shadow-emerald-500/20"
              >
                {isHi ? "दस्तावेज़ दोबारा अपलोड करें" : "Re-upload & Re-apply"}
              </Button>
            ) : (
              <Link href="/transporter/profile" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs font-extrabold text-amber-200 border-amber-500/40 hover:bg-amber-900/40">
                  {isHi ? "दस्तावेज़ देखें" : "View Documents"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 1-TAP LIVE GPS LOCATION UPDATER WIDGET */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
              {isHi ? "आपकी वर्तमान बेस लोकेशन / पार्किंग" : "Your Active Base Station / Garage"}
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-slate-100 truncate max-w-xl">
              {currentAddress}
            </p>
            {user?.transporterProfile?.latitude && user?.transporterProfile?.longitude && (
              <p className="text-[10px] text-slate-400 font-mono">
                📍 Lat: {Number(user.transporterProfile.latitude).toFixed(4)}, Lng: {Number(user.transporterProfile.longitude).toFixed(4)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleQuickGPSUpdate}
            disabled={isUpdatingGPS}
            leftIcon={isUpdatingGPS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-emerald-950" />}
            className="w-full md:w-auto whitespace-nowrap text-xs font-black shadow-md shadow-emerald-500/20"
          >
            {isUpdatingGPS
              ? isHi ? "GPS लोकेशन लॉक हो रही है..." : "Locking GPS Coordinates..."
              : isHi ? "📍 1-टैप: वर्तमान GPS लोकेशन सेट करें" : "📍 1-Tap: Set Live Phone GPS"}
          </Button>

          <Link href="/transporter/profile" className="shrink-0 hidden sm:block">
            <Button variant="outline" size="sm" className="text-xs font-bold text-slate-300">
              {isHi ? "मैप पर बदलें" : "Change on Map"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link href="/transporter/requests" className="group p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold">{t("navPickupRequests")}</h4>
            <p className="text-[10px] text-amber-950 font-bold">{requests.length} {t("pendingRequestsStat")}</p>
          </div>
        </Link>

        <Link href="/transporter/trips" className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold">{t("navTrips")}</h4>
            <p className="text-[10px] text-emerald-100 font-bold">{allTrips.length} {t("filterAll")}</p>
          </div>
        </Link>

        <Link href="/transporter/earnings" className="col-span-2 sm:col-span-1 group p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold">{t("navEarnings")}</h4>
            <p className="text-[10px] text-slate-300 font-bold">{t("cashCollectedStat")}</p>
          </div>
        </Link>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card hoverEffect className="border-amber-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("pendingRequestsStat")}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{requests.length}</h3>
              <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> {t("pendingRequestsStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
              <PackageCheck className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="border-emerald-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("activeRoadTripsStat")}</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{activeTrips.length}</h3>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <Truck className="w-3 h-3" /> {t("activeRoadTripsStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Truck className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="border-teal-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("completedTripsStat")}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</h3>
              <span className="text-[10px] font-semibold text-teal-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> {t("deliveredMandiStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-2xs">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="border-emerald-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("cashCollectedStat")}</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
                {formatCurrency(earnings?.totalEarningsCash || 0)}
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <IndianRupee className="w-3 h-3" /> {t("cashCollectedStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <IndianRupee className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Trips & History */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {t("myTripsHistoryTitle")}
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === "ALL"
                  ? "bg-emerald-600 text-white font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("filterAll")} ({allTrips.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("ACTIVE")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("filterActive")} ({activeTrips.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("COMPLETED")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === "COMPLETED"
                  ? "bg-emerald-600 text-white font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("filterCompleted")} ({completedTrips.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : displayedList.length === 0 ? (
          <EmptyState
            title={t("noTripsFoundTitle")}
            description={t("noTripsFoundDesc")}
            actionLabel={t("viewAll")}
            onAction={() => setSelectedFilter("ALL")}
          />
        ) : (
          <div className="space-y-3.5">
            {displayedList.map((trip) => {
              const statusCfg = getTripStatusConfig(trip.status);
              const farmerPhone = trip.enquiry?.farmer?.phone;
              return (
                <Link key={trip.id} href={`/transporter/trips/${trip.id}`} className="block">
                  <div className="group relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                            #{trip.tripNumber}
                          </span>
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded">
                            {trip.enquiry?.quantityKg} Kg
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight mt-0.5">
                          {trip.enquiry?.materialName || "Shipment Produce"}
                        </h3>
                      </div>

                      <span className={`px-3 py-1 rounded-xl text-xs font-black border ${statusCfg.badgeClass}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Route Visualizer */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="truncate">{trip.enquiry?.pickupLocation}</span>
                      <div className="px-3 text-emerald-700 flex items-center gap-1 text-xs">
                        <Truck className="w-4 h-4 text-emerald-600" /> →
                      </div>
                      <span className="truncate text-right">{trip.enquiry?.destinationLocation}</span>
                    </div>

                    {/* Contact & CTA Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          {t("farmerLabel")}: {trip.enquiry?.farmer?.name || "Farmer"}
                        </span>
                        {farmerPhone && (
                          <a
                            href={`tel:${farmerPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                            title="Call Farmer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        {t("viewDetails")}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* RE-APPLY KYC DOCUMENTS MODAL                              */}
      {/* ========================================================= */}
      {isReapplyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> {isHi ? "दस्तावेज़ दोबारा अपलोड करें (Re-apply KYC)" : "Re-apply for Transporter KYC"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi ? "सही दस्तावेज़ अपलोड करके दोबारा वेरिफिकेशन के लिए भेजें" : "Upload clear photos of your credentials and submit for Admin re-verification"}
                </p>
              </div>
              <button
                onClick={() => setIsReapplyOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReapplyKycSubmit} className="space-y-4 py-4">
              {/* Previous Rejection Reason Callout */}
              {user?.transporterProfile?.rejectionReason && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> {isHi ? "एडमिन द्वारा रिजेक्शन का कारण:" : "Admin Rejection Reason:"}
                  </p>
                  <p className="font-semibold">{user.transporterProfile.rejectionReason}</p>
                </div>
              )}

              <Input
                label={isHi ? "कमर्शियल ड्राइविंग लाइसेंस नंबर" : "Commercial Driving License No."}
                placeholder="e.g. DL-0420110012345"
                value={reapplyLicense}
                onChange={(e) => setReapplyLicense(e.target.value)}
                required
                leftIcon={<Truck className="w-4 h-4 text-slate-400" />}
              />

              <DocumentUploader
                label={isHi ? "कमर्शियल ड्राइविंग लाइसेंस फोटो" : "Commercial Driving License Photo"}
                value={reapplyLicensePhotoUrl}
                onChange={setReapplyLicensePhotoUrl}
                folder="kyc"
                description={isHi ? "ड्राइविंग लाइसेंस की साफ़ फोटो" : "Clear photo of your Driving License"}
              />

              <Input
                label={isHi ? "12-अंकों का आधार नंबर" : "12-Digit Aadhaar Number (Optional / Masked)"}
                placeholder="e.g. 1234 5678 9012"
                value={reapplyAadhaar}
                onChange={(e) => setReapplyAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                maxLength={12}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <DocumentUploader
                  label={isHi ? "आधार फ्रंट फोटो (फोटो वाली साइड)" : "Aadhaar Front Photo"}
                  value={reapplyFrontUrl}
                  onChange={setReapplyFrontUrl}
                  folder="kyc"
                  description={isHi ? "नाम और फोटो वाली साइड" : "Front side with photo"}
                />
                <DocumentUploader
                  label={isHi ? "आधार बैक फोटो (पते वाली साइड)" : "Aadhaar Back Photo"}
                  value={reapplyBackUrl}
                  onChange={setReapplyBackUrl}
                  folder="kyc"
                  description={isHi ? "पते वाली साइड" : "Back side with address"}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="outline" size="md" onClick={() => setIsReapplyOpen(false)}>
                  {isHi ? "रद्द करें" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingKyc}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="shadow-md shadow-emerald-500/20"
                >
                  {isHi ? "दस्तावेज़ जमा करें (Re-submit)" : "Re-submit for Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
