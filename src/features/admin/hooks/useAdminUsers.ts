"use client";

import { useState, useEffect, useCallback } from "react";
import { getData, postData, patchData, deleteData, ENDPOINTS } from "@/lib/api-client";
import { User, UserRole, KycStatus, Vehicle } from "@/types/api";
import { toast } from "sonner";

export interface AdminUserListItem extends User {
  _count?: {
    enquiries?: number;
  };
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRoleTab, setActiveRoleTab] = useState<"ALL" | "FARMER" | "TRANSPORTER" | "PENDING_KYC" | "BLOCKED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [kycModalUser, setKycModalUser] = useState<AdminUserListItem | null>(null);
  const [editModalUser, setEditModalUser] = useState<AdminUserListItem | null>(null);
  const [addVehicleUser, setAddVehicleUser] = useState<AdminUserListItem | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Actions loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint: string = ENDPOINTS.ADMIN.USERS;
      const params: string[] = [];

      if (activeRoleTab === "FARMER") params.push("role=FARMER");
      if (activeRoleTab === "TRANSPORTER") params.push("role=TRANSPORTER");
      if (activeRoleTab === "PENDING_KYC") {
        params.push("role=TRANSPORTER");
        params.push("kycStatus=PENDING");
      }
      if (activeRoleTab === "BLOCKED") params.push("isActive=false");
      if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);

      if (params.length > 0) {
        endpoint = `${endpoint}?${params.join("&")}`;
      }

      const res = await getData<AdminUserListItem[]>(endpoint, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeRoleTab, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // KYC Approval
  const handleApproveKyc = async (user: AdminUserListItem) => {
    setIsSubmitting(true);
    try {
      const res = await patchData(
        ENDPOINTS.ADMIN.USER_BY_ID(user.id),
        { kycStatus: "APPROVED", isVerified: true },
        { showSuccessToast: `✅ KYC for ${user.name} approved & verified!` }
      );
      if (res.success) {
        setKycModalUser(null);
        await fetchUsers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // KYC Rejection
  const handleRejectKyc = async (user: AdminUserListItem, reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await patchData(
        ENDPOINTS.ADMIN.USER_BY_ID(user.id),
        { kycStatus: "REJECTED", isVerified: false, rejectionReason: reason.trim() },
        { showSuccessToast: `❌ KYC for ${user.name} rejected.` }
      );
      if (res.success) {
        setKycModalUser(null);
        await fetchUsers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active / Block User
  const handleToggleUserStatus = async (user: AdminUserListItem) => {
    const newStatus = !user.isActive;
    setIsSubmitting(true);
    try {
      const res = await patchData(
        ENDPOINTS.ADMIN.USER_BY_ID(user.id),
        { isActive: newStatus },
        { showSuccessToast: `User ${user.name} ${newStatus ? "Activated" : "Suspended"}` }
      );
      if (res.success) {
        await fetchUsers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Profile by Admin
  const handleUpdateUserProfile = async (
    userId: string,
    data: {
      name?: string;
      phone?: string;
      newPassword?: string;
      address?: string;
      village?: string;
      district?: string;
      state?: string;
      pincode?: string;
      latitude?: number | null;
      longitude?: number | null;
      licenseNumber?: string;
    }
  ) => {
    setIsSubmitting(true);
    try {
      const res = await patchData(
        ENDPOINTS.ADMIN.USER_BY_ID(userId),
        data,
        { showSuccessToast: "User details updated successfully!" }
      );
      if (res.success) {
        setEditModalUser(null);
        await fetchUsers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Vehicle to Transporter
  const handleAddVehicle = async (
    userId: string,
    vehicleData: { registrationNumber: string; vehicleType: string; capacityTonnes: number }
  ) => {
    setIsSubmitting(true);
    try {
      const res = await postData<Vehicle>(
        ENDPOINTS.ADMIN.USER_VEHICLES(userId),
        vehicleData,
        { showSuccessToast: `Vehicle ${vehicleData.registrationNumber} added!` }
      );
      if (res.success) {
        setAddVehicleUser(null);
        await fetchUsers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create User by Admin
  const handleCreateUser = async (userData: {
    name: string;
    phone: string;
    password?: string;
    role: UserRole;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
    licenseNumber?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await postData(
        ENDPOINTS.ADMIN.USERS,
        userData,
        { showSuccessToast: `New ${userData.role} ${userData.name} created successfully!` }
      );
      if (res.success) {
        setIsAddUserOpen(false);
        await fetchUsers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    users,
    isLoading,
    activeRoleTab,
    setActiveRoleTab,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    kycModalUser,
    setKycModalUser,
    editModalUser,
    setEditModalUser,
    addVehicleUser,
    setAddVehicleUser,
    isAddUserOpen,
    setIsAddUserOpen,
    isSubmitting,
    fetchUsers,
    handleApproveKyc,
    handleRejectKyc,
    handleToggleUserStatus,
    handleUpdateUserProfile,
    handleAddVehicle,
    handleCreateUser,
  };
};
