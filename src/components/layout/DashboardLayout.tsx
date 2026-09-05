"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { RoleGuard } from "./RoleGuard";
import { UserRole } from "@/types/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, allowedRoles }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen flex bg-slate-50/50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
        <BottomNav />
      </div>
    </RoleGuard>
  );
};

