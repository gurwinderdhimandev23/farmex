"use client";

import React from "react";
import Link from "next/link";
import { useFarmerEnquiries } from "../hooks/useFarmerEnquiries";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ShipmentRouteCard } from "@/features/enquiries/components/ShipmentRouteCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/context/LanguageContext";
import { PlusCircle, Search } from "lucide-react";

export const EnquiriesPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    filteredEnquiries,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tabOptions,
  } = useFarmerEnquiries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("myEnquiriesTitle")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("heroFarmerSubtitle")}
          </p>
        </div>
        <Link href="/farmer/enquiries/new">
          <Button variant="accent" size="md" leftIcon={<PlusCircle className="w-4 h-4 text-slate-950" />}>
            {t("newBooking")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("cropMaterialPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 shadow-2xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <EmptyState
          title={t("noEnquiriesTitle")}
          description={
            searchQuery
              ? `No bookings match "${searchQuery}".`
              : t("noEnquiriesDesc")
          }
          actionLabel={t("newBooking")}
          onAction={() => (window.location.href = "/farmer/enquiries/new")}
          actionIcon={<PlusCircle className="w-4 h-4" />}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredEnquiries.map((enq) => (
            <ShipmentRouteCard
              key={enq.id}
              enquiry={enq}
              href={`/farmer/enquiries/${enq.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
