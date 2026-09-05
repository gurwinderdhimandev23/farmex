"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFarmerProfile } from "../hooks/useFarmerProfile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Phone, MapPin, Lock, ShieldCheck } from "lucide-react";

export const FarmerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    isUpdatingPassword,
    handlePasswordChange,
  } = useFarmerProfile();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farmer Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage your personal information and account security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={user?.name || ""} disabled leftIcon={<User className="w-4 h-4" />} />
          <Input label="Registered Phone" value={user?.phone || ""} disabled leftIcon={<Phone className="w-4 h-4" />} />
          <Input
            label="Village"
            value={user?.farmerProfile?.village || "Not specified"}
            disabled
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="District"
            value={user?.farmerProfile?.district || "Not specified"}
            disabled
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="State"
            value={user?.farmerProfile?.state || "Not specified"}
            disabled
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Pincode"
            value={user?.farmerProfile?.pincode || "Not specified"}
            disabled
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" /> Change Password
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
