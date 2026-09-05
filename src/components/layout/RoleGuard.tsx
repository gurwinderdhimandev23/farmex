"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserRole } from "@/types/api";
import { Skeleton } from "@/components/ui/Skeleton";

export interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const allowedRolesKey = allowedRoles?.join(',');
  const userRole = user?.role;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect to user's permitted role dashboard
        if (userRole === "FARMER") router.push("/farmer");
        else if (userRole === "TRANSPORTER") router.push("/transporter");
        else if (userRole === "ADMIN") router.push("/admin");
      }
    }
  }, [isLoading, isAuthenticated, userRole, allowedRolesKey, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};
