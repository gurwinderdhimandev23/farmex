"use client";

import React, { Suspense } from "react";
import { RegisterForm } from "../components/RegisterForm";
import { Truck, Sparkles, Loader2 } from "lucide-react";

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-900">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 my-8">
        <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
                <p className="text-xs text-slate-500">Join FarmEx as Farmer or Transporter</p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800">
              <Sparkles className="w-3 h-3 text-amber-500" /> Fast Onboarding
            </span>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading registration form...</span>
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
