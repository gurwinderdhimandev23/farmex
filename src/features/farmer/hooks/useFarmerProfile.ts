"use client";

import { useState } from "react";
import { postData, ENDPOINTS } from "@/lib/api-client";

export const useFarmerProfile = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setIsUpdatingPassword(true);
    try {
      const res = await postData<{ message: string }>(
        ENDPOINTS.AUTH.CHANGE_PASSWORD,
        { oldPassword, newPassword },
        { showSuccessToast: "Password updated successfully!" }
      );
      if (res.success) {
        setOldPassword("");
        setNewPassword("");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    isUpdatingPassword,
    handlePasswordChange,
  };
};
