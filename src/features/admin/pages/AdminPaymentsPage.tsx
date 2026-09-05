"use client";

import React from "react";
import { useAdminPayments } from "../hooks/useAdminPayments";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IndianRupee, Receipt } from "lucide-react";

export const AdminPaymentsPage: React.FC = () => {
  const { payments, isLoading, totalSettledCash } = useAdminPayments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Cash Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit log of all on-delivery cash collections recorded across completed trips.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Settled Cash</span>
            <span className="text-base font-extrabold text-emerald-800">{formatCurrency(totalSettledCash)}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Payments Recorded Yet"
                description="When transporters record cash collections upon mandi delivery, receipts appear here."
                icon={Receipt}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Receipt #</th>
                    <th className="px-5 py-3.5">Enquiry ID</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Recorded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-800">#{p.receiptNumber}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">{p.enquiryId.substring(0, 10)}...</td>
                      <td className="px-5 py-4 font-extrabold text-emerald-700">{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{p.paymentMethod}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(p.createdAt, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
