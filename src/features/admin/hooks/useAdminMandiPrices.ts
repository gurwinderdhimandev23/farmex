"use client";

import { useEffect, useState } from "react";
import { getData, postData, patchData, deleteData, ENDPOINTS } from "@/lib/api-client";
import { MandiPrice } from "@/types/api";

export interface GradeFormItem {
  id?: string;
  gradeName: string;
  minPrice: string | number;
  maxPrice: string | number;
}

const DEFAULT_GRADE: GradeFormItem = {
  gradeName: "Grade A",
  minPrice: "",
  maxPrice: "",
};

export const useAdminMandiPrices = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<MandiPrice | null>(null);
  const [productName, setProductName] = useState("");
  const [mandiName, setMandiName] = useState("");
  const [unit, setUnit] = useState("Quintal");
  const [grades, setGrades] = useState<GradeFormItem[]>([{ ...DEFAULT_GRADE }]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const res = await getData<MandiPrice[]>(ENDPOINTS.MANDI_PRICES.BASE, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setPrices(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleOpenAdd = () => {
    setEditingPrice(null);
    setProductName("");
    setMandiName("");
    setUnit("Quintal");
    setGrades([{ ...DEFAULT_GRADE }]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mp: MandiPrice) => {
    setEditingPrice(mp);
    setProductName(mp.productName);
    setMandiName(mp.mandiName);
    setUnit(mp.unit || "Quintal");
    if (mp.grades && mp.grades.length > 0) {
      setGrades(
        mp.grades.map((g) => ({
          id: g.id,
          gradeName: g.gradeName,
          minPrice: g.minPrice,
          maxPrice: g.maxPrice,
        }))
      );
    } else if (mp.price) {
      setGrades([
        {
          gradeName: "Grade A",
          minPrice: mp.price,
          maxPrice: mp.price,
        },
      ]);
    } else {
      setGrades([{ ...DEFAULT_GRADE }]);
    }
    setIsModalOpen(true);
  };

  const handleAddGrade = () => {
    setGrades((prev) => {
      const nextLetter = String.fromCharCode(65 + prev.length);
      const gradeLabel = prev.length < 26 ? `Grade ${nextLetter}` : `Grade ${prev.length + 1}`;
      return [...prev, { gradeName: gradeLabel, minPrice: "", maxPrice: "" }];
    });
  };

  const handleRemoveGrade = (index: number) => {
    setGrades((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleGradeChange = (
    index: number,
    field: keyof Omit<GradeFormItem, "id">,
    value: string
  ) => {
    setGrades((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !mandiName.trim() || !unit.trim()) {
      alert("Please fill in Crop Name, Mandi Name, and Unit.");
      return;
    }

    if (grades.length === 0) {
      alert("Please add at least one quality grade.");
      return;
    }

    for (let i = 0; i < grades.length; i++) {
      const g = grades[i];
      if (!g.gradeName.trim()) {
        alert(`Grade #${i + 1} name cannot be empty.`);
        return;
      }
      const min = Number(g.minPrice);
      const max = Number(g.maxPrice);
      if (isNaN(min) || min <= 0) {
        alert(`Please enter a valid Min Price for ${g.gradeName || `Grade #${i + 1}`}`);
        return;
      }
      if (isNaN(max) || max <= 0) {
        alert(`Please enter a valid Max Price for ${g.gradeName || `Grade #${i + 1}`}`);
        return;
      }
      if (max < min) {
        alert(`Max Price cannot be less than Min Price for ${g.gradeName}`);
        return;
      }
    }

    const payload = {
      productName: productName.trim(),
      mandiName: mandiName.trim(),
      unit: unit.trim(),
      grades: grades.map((g) => ({
        id: g.id,
        gradeName: g.gradeName.trim(),
        minPrice: Number(g.minPrice),
        maxPrice: Number(g.maxPrice),
      })),
    };

    setIsSaving(true);
    try {
      if (editingPrice) {
        const res = await patchData<MandiPrice>(
          ENDPOINTS.MANDI_PRICES.BY_ID(editingPrice.id),
          payload,
          { showSuccessToast: "Mandi benchmark rates updated!" }
        );
        if (res.success) {
          setIsModalOpen(false);
          fetchPrices();
        }
      } else {
        const res = await postData<MandiPrice>(
          ENDPOINTS.MANDI_PRICES.BASE,
          payload,
          { showSuccessToast: "Daily Mandi rates with grades published!" }
        );
        if (res.success) {
          setIsModalOpen(false);
          fetchPrices();
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop price?")) return;
    const res = await deleteData(ENDPOINTS.MANDI_PRICES.BY_ID(id), { showSuccessToast: "Mandi price removed." });
    if (res.success) {
      setPrices((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return {
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
    refetch: fetchPrices,
  };
};

