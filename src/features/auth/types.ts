import { UserRole } from "@/types/api";

export interface LoginPayload {
  phone: string;
  password?: string;
  otp?: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password?: string;
  role: "FARMER" | "TRANSPORTER";
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  licenseNumber?: string;
  licensePhotoUrl?: string;
  aadhaarNumber?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
}
