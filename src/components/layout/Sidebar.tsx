"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  PlusCircle,
  TrendingUp,
  FileText,
  IndianRupee,
  Users,
  Layers,
  Settings,
  LogOut,
  X,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role;

  // Lock background body scrolling when mobile drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { t } = useLanguage();

  const farmerNav = [
    {
      group: "OVERVIEW",
      items: [
        { label: t("navDashboard"), href: "/farmer", icon: LayoutDashboard },
      ],
    },
    {
      group: "ENQUIRIES",
      items: [
        { label: t("navEnquiries"), href: "/farmer/enquiries", icon: FileText },
        { label: t("navBookTransport"), href: "/farmer/enquiries/new", icon: PlusCircle },
      ],
    },
    {
      group: "MARKET INTELLIGENCE",
      items: [
        { label: t("navMandiPrices"), href: "/farmer/mandi-prices", icon: TrendingUp },
      ],
    },
    {
      group: "ACCOUNT & SESSION",
      items: [
        { label: t("navLogout"), href: "#logout", icon: LogOut, isLogout: true },
      ],
    },
  ];

  const transporterNav = [
    {
      group: "OVERVIEW",
      items: [
        { label: t("navDashboard"), href: "/transporter", icon: LayoutDashboard },
      ],
    },
    {
      group: "TRANSPORT & TRIPS",
      items: [
        { label: t("navPickupRequests"), href: "/transporter/requests", icon: PackageCheck },
        { label: t("navTrips"), href: "/transporter/trips", icon: Truck },
      ],
    },
    {
      group: "FINANCE & ACCOUNT",
      items: [
        { label: t("navEarnings"), href: "/transporter/earnings", icon: IndianRupee },
        { label: t("navLogout"), href: "#logout", icon: LogOut, isLogout: true },
      ],
    },
  ];

  const adminNav = [
    {
      group: "OVERVIEW",
      items: [
        { label: t("navDashboard"), href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      group: "OPERATIONS & USERS",
      items: [
        { label: "Users & KYC", href: "/admin/users", icon: Users },
        { label: "All Enquiries", href: "/admin/enquiries", icon: FileText },
        { label: "Trips Monitoring", href: "/admin/trips", icon: Truck },
      ],
    },
    {
      group: "PRICING & MASTERS",
      items: [
        { label: "Pricing Review", href: "/admin/pricing", icon: IndianRupee },
        { label: "Labour Master", href: "/admin/labour", icon: Users },
        { label: "Mandi Rates Master", href: "/admin/mandi-prices", icon: TrendingUp },
      ],
    },
    {
      group: "FINANCIALS & ACCOUNT",
      items: [
        { label: "Cash Payments", href: "/admin/payments", icon: IndianRupee },
        { label: t("navLogout"), href: "#logout", icon: LogOut, isLogout: true },
      ],
    },
  ];

  const navGroups = role === "FARMER" ? farmerNav : role === "TRANSPORTER" ? transporterNav : adminNav;


  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 h-screen glass-panel-dark flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:shrink-0 border-r border-emerald-900/30 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-emerald-900/40">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 border border-emerald-400/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                Farm<span className="text-amber-400">Ex</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 uppercase font-semibold tracking-wider block">
                Mandi Express
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold tracking-wider text-emerald-500/70 uppercase">
                {group.group}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isLogoutItem = (item as any).isLogout;

                if (isLogoutItem) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                        logout();
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 w-full transition-all duration-200 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                      isActive
                        ? "bg-emerald-600/90 text-white shadow-md shadow-emerald-600/20 border border-emerald-400/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-emerald-950/40"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-amber-300" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>


        {/* User Card Footer */}
        <div className="p-4 border-t border-emerald-900/40 bg-black/20">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-200 shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || "Logged User"}</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
