"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RootPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role === "FARMER") {
        router.push("/farmer");
      } else if (user?.role === "TRANSPORTER") {
        router.push("/transporter");
      } else if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <div className="space-y-4 max-w-sm w-full">
        <div className="h-10 w-10 mx-auto rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <Skeleton className="h-4 w-48 mx-auto bg-slate-800" />
      </div>
    </div>
  );
}
