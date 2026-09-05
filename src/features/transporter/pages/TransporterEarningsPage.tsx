"use client";

import React from "react";
import { useTransporterEarnings } from "../hooks/useTransporterEarnings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { IndianRupee, CheckCircle2, Receipt } from "lucide-react";

export const TransporterEarningsPage: React.FC = () => {
  const { t } = useLanguage();
  const { earnings, isLoading } = useTransporterEarnings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("earningsTitle")}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t("heroTransporterSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">{t("cashCollectedStat")}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {formatCurrency(earnings?.totalEarningsCash || 0)}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Driver Share (85%)</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(Math.round((earnings?.totalEarningsCash || 0) * 0.85))}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">{t("completedTripsStat")}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {earnings?.totalTripsCompleted || 0}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Management Ledger Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/30 text-white rounded-2xl shadow-xl p-5">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
          <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
            <Receipt className="w-4 h-4" />
            <span>Cash Management Ledger (Freight vs Collection vs Settlement)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Ledger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Total Trips Freight</span>
            <span className="text-sm font-black text-white">{formatCurrency(earnings?.totalEarningsCash || 0)}</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Cash Collected on Farm</span>
            <span className="text-sm font-black text-emerald-400">{formatCurrency(earnings?.totalEarningsCash || 0)}</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Platform Commission (15%)</span>
            <span className="text-sm font-black text-amber-400">{formatCurrency(Math.round((earnings?.totalEarningsCash || 0) * 0.15))}</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Net Payout to Transporter</span>
            <span className="text-sm font-black text-blue-400">{formatCurrency(Math.round((earnings?.totalEarningsCash || 0) * 0.85))}</span>
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-slate-900">
            <Receipt className="w-4 h-4 text-emerald-600" /> {t("receiptNumber")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !earnings?.recentPayments || earnings.recentPayments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {t("noTripsFoundDesc")}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {earnings.recentPayments.map((payment) => (
                <div key={payment.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        #{payment.receiptNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {payment.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(payment.createdAt, true)}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-700 block">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {t("cash")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
