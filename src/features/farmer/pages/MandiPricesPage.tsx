"use client";

import React from "react";
import Link from "next/link";
import { useMandiPrices } from "../hooks/useMandiPrices";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Search, Sparkles, Layers, Truck, ArrowRight } from "lucide-react";

export const MandiPricesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { filteredPrices, isLoading, searchQuery, setSearchQuery } = useMandiPrices();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t("mandiCropsStat")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("mandiRatesTodayTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === "hi"
              ? "विभिन्न मंडियों के ताज़ा भाव और क्वालिटी अनुसार ग्रेड के रेट देखें व तुरंत गाड़ी बुक करें।"
              : "Live mandi benchmark rates categorized by quality grades. Book transport directly for your produce."}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "फसल, मंडी या ग्रेड खोजें..."
                : "Search crop, mandi or grade..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-slate-900 shadow-xs placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      ) : filteredPrices.length === 0 ? (
        <EmptyState
          title={t("noTripsFoundTitle")}
          description={
            searchQuery
              ? `No crop rates match "${searchQuery}".`
              : t("noTripsFoundDesc")
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrices.map((mp) => {
            const hasGrades = mp.grades && mp.grades.length > 0;
            const minOverall = hasGrades
              ? Math.min(...mp.grades.map((g) => Number(g.minPrice)))
              : Number(mp.price || 0);
            const maxOverall = hasGrades
              ? Math.max(...mp.grades.map((g) => Number(g.maxPrice)))
              : Number(mp.price || 0);

            return (
              <Card
                key={mp.id}
                hoverEffect
                className="bg-white border border-slate-200/90 shadow-sm rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block">
                        📍 {mp.mandiName}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {mp.productName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {language === "hi" ? "अपडेट:" : "Updated"}{" "}
                        {formatDate(mp.updatedAt)}
                      </p>
                    </div>

                    {/* Overall Benchmark Range */}
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                        {t("priceRange")}
                      </span>
                      <span className="text-lg font-black text-emerald-700 block">
                        {minOverall === maxOverall
                          ? `₹${minOverall.toLocaleString("en-IN")}`
                          : `₹${minOverall.toLocaleString("en-IN")} - ₹${maxOverall.toLocaleString("en-IN")}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        per {mp.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quality Grades Breakdown Box */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        {t("gradeBreakdown")} ({hasGrades ? mp.grades.length : 1})
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {language === "hi" ? "न्यूनतम - अधिकतम" : "Min - Max"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {hasGrades ? (
                        mp.grades.map((g, idx) => (
                          <div
                            key={g.id || idx}
                            className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between transition-colors hover:bg-emerald-50/50 hover:border-emerald-300"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                              <span className="text-xs font-black text-slate-800">
                                {g.gradeName}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-emerald-700">
                                ₹{Number(g.minPrice).toLocaleString("en-IN")} - ₹
                                {Number(g.maxPrice).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium ml-1">
                                /{mp.unit}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">
                            Standard
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            {formatCurrency(mp.price || 0)} /{mp.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book Transport Direct Action */}
                  <div className="pt-2">
                    <Link
                      href={`/farmer/enquiries/new`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white text-xs font-black shadow-xs transition-all hover:scale-[1.01]"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t("newBooking")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
