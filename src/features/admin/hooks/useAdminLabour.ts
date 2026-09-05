"use client";

import { useEffect, useState } from "react";
import { getData, postData, patchData, ENDPOINTS } from "@/lib/api-client";
import { LabourType } from "@/types/api";

export const useAdminLabour = () => {
  const [labourTypes, setLabourTypes] = useState<LabourType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabourType | null>(null);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLabourTypes = async () => {
    setIsLoading(true);
    try {
      const res = await getData<LabourType[]>(ENDPOINTS.PRICING.LABOUR_TYPES, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setLabourTypes(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourTypes();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName("");
    setBasePrice("");
    setDescription("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LabourType) => {
    setEditingItem(item);
    setName(item.name);
    setBasePrice(item.basePrice);
    setDescription(item.description || "");
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !basePrice || Number(basePrice) <= 0) {
      alert("Please enter a valid name and price");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const res = await patchData<LabourType>(
          ENDPOINTS.PRICING.LABOUR_TYPE_BY_ID(editingItem.id),
          { name: name.trim(), basePrice: Number(basePrice), description: description.trim() || undefined, isActive },
          { showSuccessToast: "Labour type updated!" }
        );
        if (res.success) {
          setIsModalOpen(false);
          fetchLabourTypes();
        }
      } else {
        const res = await postData<LabourType>(
          ENDPOINTS.PRICING.LABOUR_TYPES,
          { name: name.trim(), basePrice: Number(basePrice), description: description.trim() || undefined, isActive },
          { showSuccessToast: "Labour type added!" }
        );
        if (res.success) {
          setIsModalOpen(false);
          fetchLabourTypes();
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
    refetch: fetchLabourTypes,
  };
};
