"use client";

import React from "react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-2xs">
      <div className="px-2 text-emerald-800 flex items-center gap-1 text-xs font-bold border-r border-slate-200 pr-2">
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Lang</span>
      </div>

      {options.map((opt) => {
        const isActive = language === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-emerald-600 text-white shadow-xs font-black scale-105"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
