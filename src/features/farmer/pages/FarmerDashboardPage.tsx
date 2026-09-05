"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFarmerDashboard } from "../hooks/useFarmerDashboard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShipmentRouteCard } from "@/features/enquiries/components/ShipmentRouteCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { AgriSuppliesCard } from "../components/AgriSuppliesCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  PlusCircle,
  Truck,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const FarmerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    enquiries,
    mandiPrices,
    isLoading,
    totalSubmitted,
    inTransitCount,
    completedCount,
  } = useFarmerDashboard();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white shadow-xl overflow-hidden border border-emerald-500/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("instantUpfrontBadge")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t("heroGreeting")}, <span className="text-emerald-400">{user?.name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200">
              {t("heroFarmerSubtitle")}
            </p>
          </div>

          <Link href="/farmer/enquiries/new" className="w-full sm:w-auto">
            <Button
              variant="accent"
              size="lg"
              leftIcon={<PlusCircle className="w-5 h-5 text-slate-950" />}
              className="shadow-lg shadow-amber-500/25 w-full sm:w-auto whitespace-nowrap font-black text-base py-4"
            >
              {t("newBooking")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link href="/farmer/enquiries/new" className="group p-4.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-slate-950 shadow-lg hover:scale-[1.02] transition-all flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
            <PlusCircle className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h4 className="text-sm font-black">{t("newBooking")}</h4>
            <p className="text-xs text-emerald-950 font-bold">{t("upfrontGuaranteedBadge")}</p>
          </div>
        </Link>

        <Link href="/farmer/mandi-prices" className="group p-4.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg hover:scale-[1.02] transition-all flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h4 className="text-sm font-black">{t("navMandiPrices")}</h4>
            <p className="text-xs text-amber-950 font-bold">{t("mandiRatesTodayTitle")}</p>
          </div>
        </Link>

        <Link href="/farmer/enquiries" className="col-span-2 sm:col-span-1 group p-4.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 text-white shadow-lg hover:scale-[1.02] transition-all flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-black">{t("navEnquiries")}</h4>
            <p className="text-xs text-emerald-300 font-bold">{t("viewAll")}</p>
          </div>
        </Link>
      </div>

      {/* NEW FEATURE CARD: ORDER PESTICIDES & FERTILIZERS */}
      <AgriSuppliesCard />

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card hoverEffect className="border-emerald-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("totalEnquiriesStat")}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalSubmitted}</h3>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <FileText className="w-3 h-3" /> {t("totalEnquiriesStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FileText className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="border-amber-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("inTransitStat")}</span>
              <h3 className="text-2xl font-black text-amber-700 mt-0.5">{inTransitCount}</h3>
              <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> {t("inTransitStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
              <Truck className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="border-emerald-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("deliveredMandiStat")}</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{completedCount}</h3>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> {t("deliveredMandiStat")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="border-teal-200/80 bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("mandiCropsStat")}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{mandiPrices.length}</h3>
              <span className="text-[10px] font-semibold text-teal-700 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {t("mandiRatesTodayTitle")}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-2xs">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" /> {t("recentBookingsTitle")}
            </h2>
            <Link href="/farmer/enquiries" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              {t("viewAll")} ({enquiries.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : enquiries.length === 0 ? (
            <EmptyState
              title={t("noTripsFoundTitle")}
              description={t("noTripsFoundDesc")}
              actionLabel={t("newBooking")}
              onAction={() => (window.location.href = "/farmer/enquiries/new")}
              actionIcon={<PlusCircle className="w-4 h-4" />}
            />
          ) : (
            <div className="space-y-3.5">
              {enquiries.slice(0, 5).map((enq) => (
                <ShipmentRouteCard
                  key={enq.id}
                  enquiry={enq}
                  href={`/farmer/enquiries/${enq.id}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Mandi Rates */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" /> {t("mandiRatesTodayTitle")}
            </h2>
            <Link href="/farmer/mandi-prices" className="text-xs font-bold text-emerald-700 hover:underline">
              {t("viewAll")}
            </Link>
          </div>

          <Card className="rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-4 space-y-2.5">
              {mandiPrices.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No rates published today.</p>
              ) : (
                mandiPrices.slice(0, 5).map((mp) => {
                  const hasGrades = mp.grades && mp.grades.length > 0;
                  const minOverall = hasGrades
                    ? Math.min(...mp.grades.map((g) => Number(g.minPrice)))
                    : Number(mp.price || 0);
                  const maxOverall = hasGrades
                    ? Math.max(...mp.grades.map((g) => Number(g.maxPrice)))
                    : Number(mp.price || 0);

                  return (
                    <Link
                      key={mp.id}
                      href="/farmer/mandi-prices"
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-emerald-500/40 hover:bg-emerald-50/40 transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{mp.productName}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">📍 {mp.mandiName}</p>
                        {hasGrades && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            {mp.grades.length} Grades
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 block">
                          {minOverall === maxOverall
                            ? `₹${minOverall.toLocaleString("en-IN")}`
                            : `₹${minOverall.toLocaleString("en-IN")} - ₹${maxOverall.toLocaleString("en-IN")}`}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">per {mp.unit}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
