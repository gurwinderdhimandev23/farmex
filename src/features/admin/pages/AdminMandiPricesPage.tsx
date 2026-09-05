"use client";

import React from "react";
import { useAdminMandiPrices } from "../hooks/useAdminMandiPrices";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, TrendingUp, Sparkles, Layers } from "lucide-react";

export const AdminMandiPricesPage: React.FC = () => {
  const {
    prices,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingPrice,
    productName,
    setProductName,
    mandiName,
    setMandiName,
    unit,
    setUnit,
    grades,
    handleAddGrade,
    handleRemoveGrade,
    handleGradeChange,
    isSaving,
    handleOpenAdd,
    handleOpenEdit,
    handleSave,
    handleDelete,
  } = useAdminMandiPrices();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mandi Rates Catalogue</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish and maintain daily crop market benchmark rates with quality grade price ranges.
          </p>
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Publish Rate
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : prices.length === 0 ? (
        <EmptyState
          title="No Mandi Rates Published"
          description="Publish daily market rates with quality grades (e.g. Wheat at Khanna Mandi -> Grade A: ₹2,400-₹2,600, Grade B: ₹2,200-₹2,400)."
          actionLabel="Publish First Rate"
          onAction={handleOpenAdd}
          icon={TrendingUp}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prices.map((mp) => {
            const hasGrades = mp.grades && mp.grades.length > 0;
            const minOverall = hasGrades
              ? Math.min(...mp.grades.map((g) => Number(g.minPrice)))
              : Number(mp.price || 0);
            const maxOverall = hasGrades
              ? Math.max(...mp.grades.map((g) => Number(g.maxPrice)))
              : Number(mp.price || 0);

            return (
              <Card key={mp.id} hoverEffect className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                        {mp.mandiName}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{mp.productName}</h3>
                      <p className="text-[10px] text-slate-400">Updated {formatDate(mp.updatedAt)}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-700">
                        {minOverall === maxOverall
                          ? `₹${minOverall.toLocaleString("en-IN")}`
                          : `₹${minOverall.toLocaleString("en-IN")} - ₹${maxOverall.toLocaleString("en-IN")}`}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">per {mp.unit}</span>
                    </div>
                  </div>

                  {/* Quality Grades Breakdown */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Quality Grades ({hasGrades ? mp.grades.length : 1})
                    </span>

                    <div className="space-y-1.5">
                      {hasGrades ? (
                        mp.grades.map((g, idx) => (
                          <div
                            key={g.id || idx}
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {g.gradeName}
                            </span>
                            <span className="font-extrabold text-emerald-700">
                              ₹{Number(g.minPrice).toLocaleString("en-IN")} - ₹{Number(g.maxPrice).toLocaleString("en-IN")}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">/{mp.unit}</span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">Standard Grade</span>
                          <span className="font-extrabold text-emerald-700">
                            {formatCurrency(mp.price || 0)} <span className="text-[10px] text-slate-400 font-normal">/{mp.unit}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEdit(mp)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                      onClick={() => handleDelete(mp.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* PUBLISH / EDIT MODAL */}
      <Modal
        maxWidth="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPrice ? "Edit Mandi Rates & Gradess" : "Publish Daily Mandi Price"}
        description="Provide crop benchmark rates with grade-wise min and max price ranges."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Crop / Produce Name"
              placeholder="e.g. Wheat, Paddy, Cotton"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <Input
              label="Mandi / Market Name"
              placeholder="e.g. Khanna Grain Mandi"
              value={mandiName}
              onChange={(e) => setMandiName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Rate Unit"
            placeholder="e.g. Quintal, Tonne, Kg"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />

          {/* QUALITY GRADES SECTION */}
          <div className="border-t border-slate-200 pt-4 mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Quality Grades & Price Range (₹)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Enter Grade Name, Min Price, and Max Price. Click (+) to add more grades.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddGrade}
                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Grade
              </button>
            </div>

            {/* DYNAMIC GRADE INPUT ROWS */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {grades.map((gradeItem, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Grade Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={gradeItem.gradeName}
                      onChange={(e) => handleGradeChange(index, "gradeName", e.target.value)}
                      placeholder="e.g. Grade A / Super"
                      required
                      className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Min Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={gradeItem.minPrice}
                      onChange={(e) => handleGradeChange(index, "minPrice", e.target.value)}
                      placeholder="e.g. 400"
                      min="1"
                      step="any"
                      required
                      className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Max Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={gradeItem.maxPrice}
                      onChange={(e) => handleGradeChange(index, "maxPrice", e.target.value)}
                      placeholder="e.g. 500"
                      min="1"
                      step="any"
                      required
                      className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Dynamic Action Buttons: Plus (+) & Delete */}
                  <div className="flex items-center gap-1 self-end sm:self-center mt-2 sm:mt-4 shrink-0">
                    <button
                      type="button"
                      onClick={handleAddGrade}
                      title="Add Another Grade Row"
                      className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {grades.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGrade(index)}
                        title="Remove Grade Row"
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              {editingPrice ? "Update Mandi Rates" : "Publish Rate"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

