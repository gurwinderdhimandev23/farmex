"use client";

import React, { useState } from "react";
import { useAdminUsers, AdminUserListItem } from "../hooks/useAdminUsers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { DocumentUploader } from "@/components/ui/DocumentUploader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Truck,
  Tractor,
  User,
  Phone,
  MapPin,
  Edit2,
  Lock,
  Ban,
  CheckCircle,
  X,
  Eye,
  AlertTriangle,
  FileText,
  Save,
  Key,
} from "lucide-react";

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    isLoading,
    activeRoleTab,
    setActiveRoleTab,
    searchQuery,
    setSearchQuery,
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
  } = useAdminUsers();

  // Edit Modal Form State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editLatitude, setEditLatitude] = useState<number | null>(null);
  const [editLongitude, setEditLongitude] = useState<number | null>(null);
  const [editLicenseNumber, setEditLicenseNumber] = useState("");

  // KYC Rejection state
  const [rejectionReason, setRejectionReason] = useState("");

  // Add Vehicle Form State
  const [vehicleReg, setVehicleReg] = useState("");
  const [vehicleType, setVehicleType] = useState("Eicher 14ft");
  const [vehicleCapacity, setVehicleCapacity] = useState("5");

  // Create User Form State
  const [newRole, setNewRole] = useState<"FARMER" | "TRANSPORTER">("FARMER");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newVillage, setNewVillage] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newState, setNewState] = useState("");
  const [newLicense, setNewLicense] = useState("");
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);

  // Open Edit Modal
  const openEditModal = (u: AdminUserListItem) => {
    setEditModalUser(u);
    setEditName(u.name || "");
    setEditPhone(u.phone || "");
    setEditPassword("");
    if (u.role === "FARMER" && u.farmerProfile) {
      setEditAddress(u.farmerProfile.address || "");
      setEditVillage(u.farmerProfile.village || "");
      setEditDistrict(u.farmerProfile.district || "");
      setEditState(u.farmerProfile.state || "");
      setEditPincode(u.farmerProfile.pincode || "");
      setEditLatitude(u.farmerProfile.latitude ? Number(u.farmerProfile.latitude) : null);
      setEditLongitude(u.farmerProfile.longitude ? Number(u.farmerProfile.longitude) : null);
    } else if (u.role === "TRANSPORTER" && u.transporterProfile) {
      setEditAddress(u.transporterProfile.address || "");
      setEditLicenseNumber(u.transporterProfile.licenseNumber || "");
      setEditLatitude(u.transporterProfile.latitude ? Number(u.transporterProfile.latitude) : null);
      setEditLongitude(u.transporterProfile.longitude ? Number(u.transporterProfile.longitude) : null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;

    await handleUpdateUserProfile(editModalUser.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      newPassword: editPassword.trim() || undefined,
      address: editAddress.trim() || undefined,
      village: editVillage.trim() || undefined,
      district: editDistrict.trim() || undefined,
      state: editState.trim() || undefined,
      pincode: editPincode.trim() || undefined,
      latitude: editLatitude,
      longitude: editLongitude,
      licenseNumber: editLicenseNumber.trim() || undefined,
    });
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addVehicleUser || !vehicleReg.trim()) return;

    await handleAddVehicle(addVehicleUser.id, {
      registrationNumber: vehicleReg.trim().toUpperCase(),
      vehicleType,
      capacityTonnes: Number(vehicleCapacity),
    });
    setVehicleReg("");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    await handleCreateUser({
      name: newName.trim(),
      phone: newPhone.trim(),
      password: newPassword.trim() || "123456",
      role: newRole,
      address: newAddress.trim() || undefined,
      village: newVillage.trim() || undefined,
      district: newDistrict.trim() || undefined,
      state: newState.trim() || undefined,
      licenseNumber: newLicense.trim() || undefined,
      latitude: newLatitude !== null ? newLatitude : undefined,
      longitude: newLongitude !== null ? newLongitude : undefined,
    });
  };

  const pendingKycCount = users.filter(
    (u) => u.role === "TRANSPORTER" && u.transporterProfile?.kycStatus === "PENDING"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" /> User Management & KYC Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage Farmer & Transporter profiles, verify Aadhaar & License documents, and assign vehicles.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            + Add New User
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveRoleTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeRoleTab === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveRoleTab("FARMER")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeRoleTab === "FARMER" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tractor className="w-3.5 h-3.5 text-emerald-600" /> Farmers
          </button>
          <button
            onClick={() => setActiveRoleTab("TRANSPORTER")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeRoleTab === "TRANSPORTER" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-slate-700" /> Transporters
          </button>
          <button
            onClick={() => setActiveRoleTab("PENDING_KYC")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeRoleTab === "PENDING_KYC" ? "bg-amber-500 text-slate-950 shadow-2xs" : "text-amber-800 bg-amber-100/60 hover:bg-amber-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pending KYC
            {pendingKycCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-950 text-white text-[10px] flex items-center justify-center font-black">
                {pendingKycCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveRoleTab("BLOCKED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeRoleTab === "BLOCKED" ? "bg-rose-100 text-rose-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-rose-500" /> Suspended
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:w-72">
          <Input
            placeholder="Search by name, phone, aadhaar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="No registered farmers or transporters match your search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Location & Coordinates</th>
                    <th className="py-3 px-4">KYC & Vehicles</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => {
                    const isFarmer = u.role === "FARMER";
                    const isTransporter = u.role === "TRANSPORTER";
                    const profile = isFarmer ? u.farmerProfile : u.transporterProfile;
                    const isVerified = isTransporter && u.transporterProfile?.isVerified;
                    const kycStatus = isTransporter ? (u.transporterProfile?.kycStatus || "PENDING") : null;

                    const locDisplay = isFarmer
                      ? [u.farmerProfile?.village, u.farmerProfile?.district, u.farmerProfile?.state].filter(Boolean).join(", ") || "Location not set"
                      : u.transporterProfile?.address || "Station not set";

                    const hasCoords = profile?.latitude && profile?.longitude;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          {isFarmer ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                              <Tractor className="w-3 h-3" /> Farmer
                            </span>
                          ) : isTransporter ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                              <Truck className="w-3 h-3" /> Transporter
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
                              <User className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4 max-w-[220px]">
                          <p className="truncate text-xs text-slate-800 font-semibold" title={locDisplay}>
                            {locDisplay}
                          </p>
                          {hasCoords ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-mono font-bold mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-500" />
                              {Number(profile?.latitude).toFixed(3)}, {Number(profile?.longitude).toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">GPS unpinned</span>
                          )}
                        </td>

                        {/* KYC & Vehicles */}
                        <td className="py-3 px-4">
                          {isTransporter ? (
                            <div className="space-y-1">
                              {/* KYC Badge */}
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> KYC Verified
                                </span>
                              ) : kycStatus === "REJECTED" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> KYC Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600" /> KYC Pending
                                </span>
                              )}

                              {/* Vehicles info */}
                              <p className="text-[10px] text-slate-500 font-medium">
                                🚚 {u.transporterProfile?.vehicles?.length || 0} Vehicle(s)
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              📦 {u._count?.enquiries || 0} Bookings
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                              <span className="w-2 h-2 rounded-full bg-rose-500" /> Suspended
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Review KYC Button for Transporter */}
                            {isTransporter && (
                              <Button
                                variant={isVerified ? "outline" : "accent"}
                                size="sm"
                                onClick={() => {
                                  setKycModalUser(u);
                                  setRejectionReason(u.transporterProfile?.rejectionReason || "");
                                }}
                                className="text-xs font-bold py-1 px-2.5 h-8"
                                title="Review KYC Documents"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                {isVerified ? "View KYC" : "Review KYC"}
                              </Button>
                            )}

                            {/* Add Vehicle Button for Transporter */}
                            {isTransporter && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddVehicleUser(u);
                                  setVehicleReg("");
                                }}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                                title="Add Vehicle"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit Profile Button */}
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                              title="Edit User Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Suspend / Unsuspend Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              className={`p-1.5 rounded-xl border transition-colors ${
                                u.isActive
                                  ? "border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                              title={u.isActive ? "Suspend User" : "Activate User"}
                            >
                              {u.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 1. KYC REVIEW & VERIFICATION MODAL                        */}
      {/* ========================================================= */}
      {kycModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> Transporter KYC Document Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Review commercial license and Aadhaar photos for {kycModalUser.name} ({kycModalUser.phone})
                </p>
              </div>
              <button
                onClick={() => setKycModalUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Operator details snapshot */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Driving License No.</span>
                  <span className="font-extrabold text-slate-800 font-mono">
                    {kycModalUser.transporterProfile?.licenseNumber || "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Masked Aadhaar Number</span>
                  <span className="font-extrabold text-slate-800 font-mono">
                    {kycModalUser.transporterProfile?.aadhaarNumber
                      ? `XXXX-XXXX-${kycModalUser.transporterProfile.aadhaarNumber.slice(-4)}`
                      : "Not Provided"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Base Operating Address</span>
                  <span className="font-medium text-slate-700">
                    {kycModalUser.transporterProfile?.address || "Address not provided"}
                  </span>
                </div>
              </div>

              {/* Documents Preview (Driving License + Aadhaar Front + Aadhaar Back) */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                  <span>Uploaded Credentials & KYC Documents:</span>
                  <span className="text-[11px] font-medium text-slate-500">Inspect photos carefully before approval</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Driving License Photo */}
                  <div className="rounded-2xl border-2 border-emerald-500/30 overflow-hidden bg-slate-950 p-2 text-center flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 mb-1.5">
                        <Truck className="w-3.5 h-3.5" /> Driving License Photo
                      </div>
                      {kycModalUser.transporterProfile?.licensePhotoUrl ? (
                        <a
                          href={kycModalUser.transporterProfile.licensePhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block h-40 overflow-hidden rounded-xl bg-black cursor-zoom-in"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kycModalUser.transporterProfile.licensePhotoUrl}
                            alt="Driving License"
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <Eye className="w-3.5 h-3.5" /> Open Full Image
                          </div>
                        </a>
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-500 bg-slate-900 rounded-xl">
                          <FileText className="w-7 h-7 mb-1 opacity-50" />
                          <span className="text-[11px]">Photo Not Uploaded</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1.5 truncate">
                      {kycModalUser.transporterProfile?.licenseNumber || "No DL No."}
                    </p>
                  </div>

                  {/* Aadhaar Front Photo */}
                  <div className="rounded-2xl border border-slate-700 overflow-hidden bg-slate-950 p-2 text-center flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-300 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" /> Aadhaar Front (Photo)
                      </div>
                      {kycModalUser.transporterProfile?.aadhaarFrontUrl ? (
                        <a
                          href={kycModalUser.transporterProfile.aadhaarFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block h-40 overflow-hidden rounded-xl bg-black cursor-zoom-in"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kycModalUser.transporterProfile.aadhaarFrontUrl}
                            alt="Aadhaar Front"
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <Eye className="w-3.5 h-3.5" /> Open Full Image
                          </div>
                        </a>
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-500 bg-slate-900 rounded-xl">
                          <FileText className="w-7 h-7 mb-1 opacity-50" />
                          <span className="text-[11px]">Front Not Uploaded</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1.5 truncate">
                      {kycModalUser.transporterProfile?.aadhaarNumber
                        ? `XXXX-XXXX-${kycModalUser.transporterProfile.aadhaarNumber.slice(-4)}`
                        : "No Aadhaar"}
                    </p>
                  </div>

                  {/* Aadhaar Back Photo */}
                  <div className="rounded-2xl border border-slate-700 overflow-hidden bg-slate-950 p-2 text-center flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-300 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" /> Aadhaar Back (Address)
                      </div>
                      {kycModalUser.transporterProfile?.aadhaarBackUrl ? (
                        <a
                          href={kycModalUser.transporterProfile.aadhaarBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block h-40 overflow-hidden rounded-xl bg-black cursor-zoom-in"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={kycModalUser.transporterProfile.aadhaarBackUrl}
                            alt="Aadhaar Back"
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <Eye className="w-3.5 h-3.5" /> Open Full Image
                          </div>
                        </a>
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-500 bg-slate-900 rounded-xl">
                          <FileText className="w-7 h-7 mb-1 opacity-50" />
                          <span className="text-[11px]">Back Not Uploaded</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans mt-1.5 truncate">
                      Address Side
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection reason input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Rejection Reason (Required only if rejecting):
                </label>
                <Input
                  placeholder="e.g. Aadhaar photo is blurred, please upload clear picture"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="destructive"
                size="md"
                onClick={() => handleRejectKyc(kycModalUser, rejectionReason)}
                disabled={isSubmitting}
                leftIcon={<AlertTriangle className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Reject KYC
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="md" onClick={() => setKycModalUser(null)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleApproveKyc(kycModalUser)}
                  disabled={isSubmitting}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-md shadow-emerald-500/20"
                >
                  Approve & Verify Driver
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT USER & RESET PASSWORD MODAL                       */}
      {/* ========================================================= */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" /> Edit {editModalUser.role} Details
              </h3>
              <button
                onClick={() => setEditModalUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                />
              </div>

              {/* Reset Password */}
              <Input
                label="Reset Password (Optional)"
                placeholder="Leave blank to keep unchanged"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                leftIcon={<Key className="w-4 h-4 text-slate-400" />}
                helperText="Admin can set a new password if user forgot credentials."
              />

              {/* Location Picker */}
              <LocationPicker
                label="Base Address & Coordinates"
                placeholder="Search village or city..."
                value={editAddress}
                latitude={editLatitude}
                longitude={editLongitude}
                onChange={(loc) => {
                  setEditAddress(loc.address);
                  setEditLatitude(loc.latitude);
                  setEditLongitude(loc.longitude);
                  if (loc.city) setEditDistrict(loc.city);
                  if (loc.state) setEditState(loc.state);
                }}
              />

              {editModalUser.role === "FARMER" && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Village / Town"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                  />
                  <Input
                    label="District"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                  />
                  <Input
                    label="State"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                  />
                  <Input
                    label="Pincode"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                  />
                </div>
              )}

              {editModalUser.role === "TRANSPORTER" && (
                <Input
                  label="Commercial Driving License No."
                  value={editLicenseNumber}
                  onChange={(e) => setEditLicenseNumber(e.target.value)}
                />
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="outline" size="md" onClick={() => setEditModalUser(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ADD VEHICLE MODAL (For Transporters)                    */}
      {/* ========================================================= */}
      {addVehicleUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" /> Add Vehicle to {addVehicleUser.name}
              </h3>
              <button
                onClick={() => setAddVehicleUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4 py-4">
              <Input
                label="Registration Number (Number Plate)"
                placeholder="e.g. PB 65 AB 1234"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tractor Trolley">Tractor Trolley (Krishi)</option>
                  <option value="Tata Ace (1.5T)">Tata Ace / Chota Hathi (1.5T)</option>
                  <option value="Pickup 407 (3T)">Mahindra Bolero / Tata 407 (3T)</option>
                  <option value="Eicher 14ft (5T)">Eicher 14ft (5T - 7T)</option>
                  <option value="10-Wheeler Truck (16T)">10-Wheeler Heavy Truck (16T)</option>
                  <option value="12-Wheeler (25T)">12-Wheeler Heavy Truck (25T)</option>
                </select>
              </div>

              <Input
                label="Capacity (Tonnes)"
                type="number"
                step="0.5"
                min="0.5"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="outline" size="md" onClick={() => setAddVehicleUser(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MANUAL CREATE USER MODAL                                */}
      {/* ========================================================= */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Register User on Behalf
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewRole("FARMER")}
                  className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                    newRole === "FARMER"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Tractor className="w-4 h-4 text-emerald-600" /> Farmer (Kisan)
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("TRANSPORTER")}
                  className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                    newRole === "TRANSPORTER"
                      ? "bg-slate-900 border-slate-900 text-white ring-2 ring-slate-900/20"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Truck className="w-4 h-4" /> Transporter
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  placeholder="e.g. Ramesh Singh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
                <Input
                  label="10-Digit Mobile"
                  placeholder="e.g. 9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  required
                />
              </div>

              <Input
                label="Initial Password"
                type="password"
                placeholder="Default: 123456"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              {newRole === "TRANSPORTER" && (
                <Input
                  label="Commercial Driving License No."
                  placeholder="e.g. PB-0420110012345"
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                />
              )}

              <LocationPicker
                label="Base Location / Station"
                placeholder="Search village or mandi location..."
                value={newAddress}
                latitude={newLatitude}
                longitude={newLongitude}
                onChange={(loc) => {
                  setNewAddress(loc.address);
                  setNewLatitude(loc.latitude);
                  setNewLongitude(loc.longitude);
                  if (loc.city) setNewDistrict(loc.city);
                  if (loc.state) setNewState(loc.state);
                }}
              />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="outline" size="md" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
