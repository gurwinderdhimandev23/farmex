"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  TrendingUp,
  Truck,
  PackageCheck,
  IndianRupee,
  User,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCta?: boolean;
}

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role;

  if (!role) return null;

  const farmerTabs: NavItem[] = [
    { label: t("navDashboard"), href: "/farmer", icon: LayoutDashboard },
    { label: t("navEnquiries"), href: "/farmer/enquiries", icon: FileText },
    { label: t("newBooking"), href: "/farmer/enquiries/new", icon: PlusCircle, isCta: true },
    { label: t("navMandiPrices"), href: "/farmer/mandi-prices", icon: TrendingUp },
    { label: t("navProfile"), href: "/farmer/profile", icon: User },
  ];

  const transporterTabs: NavItem[] = [
    { label: t("navDashboard"), href: "/transporter", icon: LayoutDashboard },
    { label: t("navPickupRequests"), href: "/transporter/requests", icon: PackageCheck },
    { label: t("navTrips"), href: "/transporter/trips", icon: Truck },
    { label: t("navEarnings"), href: "/transporter/earnings", icon: IndianRupee },
    { label: t("navProfile"), href: "/transporter/profile", icon: User },
  ];

  const adminTabs: NavItem[] = [
    { label: t("navDashboard"), href: "/admin", icon: LayoutDashboard },
    { label: t("navEnquiries"), href: "/admin/enquiries", icon: FileText },
    { label: t("navTrips"), href: "/admin/trips", icon: Truck },
    { label: t("pricingBreakdown"), href: "/admin/pricing", icon: IndianRupee },
    { label: t("labourCharge"), href: "/admin/labour", icon: User },
  ];

  const tabs = role === "FARMER" ? farmerTabs : role === "TRANSPORTER" ? transporterTabs : adminTabs;

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-emerald-900/40 md:hidden select-none px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isCta) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-slate-900 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-400 mt-0.5">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110 text-emerald-400")} />
              <span className="text-[10px] mt-0.5 font-semibold tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
