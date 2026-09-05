"use client";

import React from "react";
import { LoginForm } from "../components/LoginForm";
import { Truck, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-900">
      {/* Background Glows (Green & Amber) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Branding Column */}
        <div className="lg:col-span-6 text-white space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Direct Farm to Mandi Transport Ecosystem</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Empowering <span className="text-emerald-400">Farmers</span> & <span className="text-amber-400">Transporters</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto lg:mx-0">
              Fair pricing, real-time trip milestone tracking, and seamless mandi market access in one integrated portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-md mx-auto lg:mx-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Live Mandi Prices</h4>
              <p className="text-[11px] text-slate-400">Daily accurate crop prices</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Guaranteed Pricing</h4>
              <p className="text-[11px] text-slate-400">Admin verified transport rates</p>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/90 shadow-2xl p-6 sm:p-8 md:p-10 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
                <p className="text-xs text-slate-500">Access your FarmEx account</p>
              </div>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};
