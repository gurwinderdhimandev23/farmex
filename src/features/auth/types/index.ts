import { User, UserRole } from "@/types/api";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  phone: string;
  password: string;
  name: string;
  role: UserRole;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  licenseNumber?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
