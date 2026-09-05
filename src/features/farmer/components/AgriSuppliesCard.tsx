"use client";

import React, { useState } from "react";
import { Package, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

export function AgriSuppliesCard() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [supplyType, setSupplyType] = useState("Fertilizers");
  const [quantity, setQuantity] = useState("10 Bags");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-emerald-900/40 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden my-4">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 text-slate-950 font-bold">
          <Package className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full mb-1">
            NEW
          </span>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {t("orderAgriSupplies")}
          </h3>
          <p className="text-sm text-emerald-200/80 mt-1">
            {t("orderAgriSuppliesDesc")}
          </p>

          {!isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all flex items-center gap-2 text-base cursor-pointer"
            >
              {t("orderNow")} <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-emerald-500/30 relative z-10">
          {submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h4 className="text-lg font-bold text-white">{t("orderSuccessTitle")}</h4>
              <p className="text-sm text-emerald-200 mt-1">
                {t("orderSuccessDesc")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setIsOpen(false);
                }}
                className="mt-3 text-xs text-emerald-400 underline font-bold cursor-pointer"
              >
                {t("cancel")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  {t("itemRequired")}
                </label>
                <select
                  value={supplyType}
                  onChange={(e) => setSupplyType(e.target.value)}
                  className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
                >
                  <option value="Fertilizers">Fertilizers / खाद (यूरिया / डीएपी)</option>
                  <option value="Pesticides">Pesticides / कीटनाशक दवाएं</option>
                  <option value="Seeds">High Quality Seeds / उन्नत बीज</option>
                  <option value="Cattle Feed">Cattle Feed / पशु आहार</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  {t("itemQuantity")}
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 10 Bags or 5 Quintals"
                  className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  {t("farmDeliveryAddress")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Address"
                    required
                    className="flex-1 bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400"
                  />
                  <VoiceInputButton
                    onTranscript={(text) => setDeliveryLocation((prev) => (prev ? `${prev} ${text}` : text))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  {loading ? t("submitting") : t("submitOrder")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
