"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTransporterProfile } from "../hooks/useTransporterProfile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { DocumentUploader } from "@/components/ui/DocumentUploader";
import { User, Phone, ShieldCheck, Lock, Truck, MapPin, Save, FileText, AlertTriangle, Clock } from "lucide-react";

export const TransporterProfilePage: React.FC = () => {
  const { user } = useAuth();
  const {
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
  } = useTransporterProfile();

  const isVerified = user?.transporterProfile?.isVerified === true;
  const kycStatus = user?.transporterProfile?.kycStatus || (isVerified ? "APPROVED" : "PENDING");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transporter Profile & KYC</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage operator credentials, KYC identity documents, base station, and vehicles.</p>
      </div>

      {/* Operator Details & Verification Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Operator Details
            </CardTitle>
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> KYC Verified & Approved
              </span>
            ) : kycStatus === "REJECTED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> KYC Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Clock className="w-4 h-4 text-amber-600" /> Verification Pending Review
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={user?.name || ""} disabled leftIcon={<User className="w-4 h-4" />} />
          <Input label="Registered Phone" value={user?.phone || ""} disabled leftIcon={<Phone className="w-4 h-4" />} />
          <Input
            label="Commercial Driving License No."
            value={user?.transporterProfile?.licenseNumber || "Verified"}
            disabled
            leftIcon={<Truck className="w-4 h-4" />}
          />
          <Input
            label="Availability Status"
            value={user?.transporterProfile?.status || "AVAILABLE"}
            disabled
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* KYC Documents & Aadhaar Card Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" /> Identity Documents & Driving License
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateKyc} className="space-y-4 max-w-xl">
            {kycStatus === "REJECTED" && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Rejection Reason from Admin:
                </p>
                <p>{user?.transporterProfile?.rejectionReason || "Please upload clearer photos of your document."}</p>
              </div>
            )}

            <Input
              label="Commercial Driving License No."
              placeholder="e.g. DL-0420110012345"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              leftIcon={<Truck className="w-4 h-4 text-slate-400" />}
            />

            <DocumentUploader
              label="Commercial Driving License Photo"
              value={licensePhotoUrl}
              onChange={setLicensePhotoUrl}
              folder="kyc"
              description="Front photo of your Driving License"
            />

            <Input
              label="Aadhaar Card Number (Optional / Masked)"
              placeholder="e.g. 1234 5678 9012"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              maxLength={14}
              helperText="Only masked digits will be visible to prevent data exposure."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <DocumentUploader
                label="Aadhaar Front Photo"
                value={aadhaarFrontUrl}
                onChange={setAadhaarFrontUrl}
                folder="kyc"
                description="Photo & Name side"
              />
              <DocumentUploader
                label="Aadhaar Back Photo"
                value={aadhaarBackUrl}
                onChange={setAadhaarBackUrl}
                folder="kyc"
                description="Address side"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingKyc}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Submit KYC Documents for Review
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Operating Base Location & Coordinates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Base Operating Station & GPS Coordinates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateLocation} className="space-y-4 max-w-xl">
            <p className="text-xs text-slate-500">
              Set your garage/parking base location. When farmers request pickups nearby, you will appear at the top of their assignment recommendations.
            </p>

            <LocationPicker
              label="Operating Base Station / Parking"
              placeholder="Search village, city, or mandi base..."
              value={address}
              latitude={latitude}
              longitude={longitude}
              required
              onChange={(loc) => {
                setAddress(loc.address);
                setLatitude(loc.latitude);
                setLongitude(loc.longitude);
              }}
              helperText="Tip: Use the GPS button to detect your current station location automatically."
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingLocation}
              disabled={!address.trim()}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Base Location & Coordinates
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" /> Update Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingPassword}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
