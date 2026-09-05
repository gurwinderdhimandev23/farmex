"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminLabour } from "../hooks/useAdminLabour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Plus,
  Edit,
  IndianRupee,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";

export const AdminLabourPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const {
    labourTypes,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    name,
    setName,
    basePrice,
    setBasePrice,
    description,
    setDescription,
    isActive,
    setIsActive,
    isSaving,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSave,
  } = useAdminLabour();

  // Quick rate-per-quintal state
  const activeRate = labourTypes[0] ? Number(labourTypes[0].basePrice) : 35;
  const [rateInput, setRateInput] = useState<number | string>(activeRate);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Sync rateInput when labourTypes load
  React.useEffect(() => {
    if (labourTypes[0]) {
      setRateInput(Number(labourTypes[0].basePrice));
    }
  }, [labourTypes]);

  const handleQuickSaveRate = async () => {
    const newRate = Number(rateInput);
    if (!newRate || newRate <= 0) {
      alert("Please enter a valid rate per quintal");
      return;
    }
    setIsUpdatingRate(true);
    try {
      if (labourTypes[0]) {
        await fetch(`/api/v1/pricing/labour-types/${labourTypes[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ basePrice: newRate }),
        });
      } else {
        await fetch(`/api/v1/pricing/labour-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Standard Farm Labour",
            basePrice: newRate,
            description: "Standard loading & unloading rate per quintal",
          }),
        });
      }
      window.location.reload();
    } catch {
      alert("Failed to update rate");
    } finally {
      setIsUpdatingRate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600" />
            {isHi ? "लेबर दर प्रबंधन" : "Labour Rate & Pricing Settings"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isHi
              ? "क्विंटल के अनुसार लोडिंग-अनलोडिंग लेबर दर निर्धारित करें।"
              : "Configure standard per-quintal labour charges applied when farmers toggle Labour ON."}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAddModal}
        >
          {isHi ? "नया लेबर प्रकार जोड़ें" : "Add Labour Service"}
        </Button>
      </div>

      {/* Main Labour Rate Setting Card */}
      <Card className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/40 rounded-2xl shadow-xl text-white overflow-hidden">
        <CardHeader className="border-b border-emerald-500/20 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg font-black flex items-center gap-2 text-emerald-300">
              <Sliders className="w-5 h-5 text-emerald-400" />
              {isHi ? "क्विंटल के हिसाब से मानक लेबर दर" : "Standard Labour Rate Per Quintal"}
            </CardTitle>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
              ⚡ {isHi ? "किसान टॉगल से जुड़ा हुआ" : "Synced with Farmer Toggle"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
                {isHi ? "लेबर चार्ज प्रति क्विंटल (₹/क्विंटल)" : "Labour Charge per Quintal (₹/Quintal)"}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    placeholder="35"
                    className="w-full bg-slate-950 border-2 border-emerald-500/40 focus:border-emerald-400 rounded-xl pl-9 pr-4 py-3 text-white text-xl font-black focus:outline-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleQuickSaveRate}
                  isLoading={isUpdatingRate}
                  className="px-6 h-[50px] font-bold"
                >
                  {isHi ? "दर सेव करें" : "Save Rate"}
                </Button>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                {isHi
                  ? "जब किसान फॉर्म में 'लेबर चाहिए' (ON) टॉगल करेगा, तो यह दर उसके क्विंटल से गुणा होकर कुल किराए में अपने आप जुड़ जाएगी।"
                  : "When a farmer toggles Labour ON, this rate is multiplied by their total quintals and pre-filled in Admin's confirmation modal."}
              </p>
            </div>

            {/* Live Calculation Preview Table */}
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-2.5">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block border-b border-emerald-500/20 pb-2">
                📊 {isHi ? "लाइव कैलकुलेशन का उदाहरण" : "Live Price Calculation Preview"}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-slate-400 block text-[11px]">10 क्विंटल</span>
                  <strong className="text-emerald-300 font-black text-sm block mt-0.5">
                    ₹{10 * (Number(rateInput) || 35)}
                  </strong>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-slate-400 block text-[11px]">20 क्विंटल</span>
                  <strong className="text-emerald-300 font-black text-sm block mt-0.5">
                    ₹{20 * (Number(rateInput) || 35)}
                  </strong>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-slate-400 block text-[11px]">50 क्विंटल</span>
                  <strong className="text-emerald-300 font-black text-sm block mt-0.5">
                    ₹{50 * (Number(rateInput) || 35)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labour Services & Types List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {isHi ? "कॉन्फ़िगर की गई लेबर सेवाएं" : "Configured Labour Services"}
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {labourTypes.length} {isHi ? "सेवाएं सक्रिय" : "services configured"}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : labourTypes.length === 0 ? (
          <EmptyState
            title={isHi ? "कोई लेबर प्रकार नहीं मिला" : "No Labour Services Configured"}
            description={
              isHi
                ? "मानक लेबर दर दर्ज करके ऊपर सेव करें।"
                : "Enter standard labour rate above and click Save Rate."
            }
            icon={Users}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labourTypes.map((lt) => (
              <Card key={lt.id} className="bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900">{lt.name}</h4>
                      {lt.isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {lt.description || "Standard loading and unloading helper service"}
                    </p>
                    <div className="text-sm font-extrabold text-emerald-700 pt-1">
                      {formatCurrency(Number(lt.basePrice))} / क्विंटल
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="w-4 h-4 text-slate-500" />}
                    onClick={() => handleOpenEditModal(lt)}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Labour Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Labour Service" : "Add New Labour Service"}
        description="Configure helper charges and descriptions."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g. Loading & Unloading Helper"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Rate per Quintal (₹)"
            type="number"
            placeholder="e.g. 35"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            leftIcon={<IndianRupee className="w-4 h-4 text-slate-400" />}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="e.g. Rate inclusive of farm pickup loading and mandi drop unloading"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-slate-700">
              Active for Bookings
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
