"use client";

import { useState, useEffect } from "react";
import { postData, patchData, ENDPOINTS } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/api";

export const useTransporterProfile = () => {
  const { user, refreshUser } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Base Location & Coordinates State
  const [address, setAddress] = useState(user?.transporterProfile?.address || "");
  const [latitude, setLatitude] = useState<number | null>(
    user?.transporterProfile?.latitude ? Number(user.transporterProfile.latitude) : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    user?.transporterProfile?.longitude ? Number(user.transporterProfile.longitude) : null
  );
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // KYC & Document State
  const [licenseNumber, setLicenseNumber] = useState(user?.transporterProfile?.licenseNumber || "");
  const [licensePhotoUrl, setLicensePhotoUrl] = useState<string | null>(user?.transporterProfile?.licensePhotoUrl || null);
  const [aadhaarNumber, setAadhaarNumber] = useState(user?.transporterProfile?.aadhaarNumber || "");
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState<string | null>(user?.transporterProfile?.aadhaarFrontUrl || null);
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState<string | null>(user?.transporterProfile?.aadhaarBackUrl || null);
  const [isUpdatingKyc, setIsUpdatingKyc] = useState(false);

  useEffect(() => {
    if (user?.transporterProfile) {
      setAddress(user.transporterProfile.address || "");
      if (user.transporterProfile.latitude) setLatitude(Number(user.transporterProfile.latitude));
      if (user.transporterProfile.longitude) setLongitude(Number(user.transporterProfile.longitude));
      if (user.transporterProfile.licenseNumber) setLicenseNumber(user.transporterProfile.licenseNumber);
      if (user.transporterProfile.licensePhotoUrl) setLicensePhotoUrl(user.transporterProfile.licensePhotoUrl);
      if (user.transporterProfile.aadhaarNumber) setAadhaarNumber(user.transporterProfile.aadhaarNumber);
      if (user.transporterProfile.aadhaarFrontUrl) setAadhaarFrontUrl(user.transporterProfile.aadhaarFrontUrl);
      if (user.transporterProfile.aadhaarBackUrl) setAadhaarBackUrl(user.transporterProfile.aadhaarBackUrl);
    }
  }, [user]);

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsUpdatingLocation(true);
    try {
      const res = await patchData<User>(
        ENDPOINTS.AUTH.ME,
        { address: address.trim(), latitude, longitude },
        { showSuccessToast: "Base operating location & GPS coordinates saved!" }
      );
      if (res.success) {
        await refreshUser();
      }
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleUpdateKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingKyc(true);
    try {
      const res = await patchData<User>(
        ENDPOINTS.AUTH.ME,
        {
          licenseNumber: licenseNumber.trim() || undefined,
          licensePhotoUrl: licensePhotoUrl || undefined,
          aadhaarNumber: aadhaarNumber.trim() || undefined,
          aadhaarFrontUrl: aadhaarFrontUrl || undefined,
          aadhaarBackUrl: aadhaarBackUrl || undefined,
          kycStatus: 'PENDING', // Reset to pending for admin re-verification
        },
        { showSuccessToast: "KYC documents submitted for Admin review!" }
      );
      if (res.success) {
        await refreshUser();
      }
    } finally {
      setIsUpdatingKyc(false);
    }
  };

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
    address,
    setAddress,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    isUpdatingLocation,
    handleUpdateLocation,
    licenseNumber,
    setLicenseNumber,
    licensePhotoUrl,
    setLicensePhotoUrl,
    aadhaarNumber,
    setAadhaarNumber,
    aadhaarFrontUrl,
    setAadhaarFrontUrl,
    aadhaarBackUrl,
    setAadhaarBackUrl,
    isUpdatingKyc,
    handleUpdateKyc,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    isUpdatingPassword,
    handlePasswordChange,
  };
};
