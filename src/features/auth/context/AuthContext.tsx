"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole, AuthResponseData } from "@/types/api";
import { getData, postData, tokenStorage, ENDPOINTS } from "@/lib/api-client";
import { LoginPayload, RegisterPayload } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await getData<User>(ENDPOINTS.AUTH.ME, { showErrorToast: false });
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedUser = tokenStorage.getUser<User>();
    if (cachedUser) {
      setUser(cachedUser);
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await postData<AuthResponseData>(ENDPOINTS.AUTH.LOGIN, payload, {
        showSuccessToast: "Welcome back!",
      });
      const accessToken = res.data?.tokens?.accessToken || res.data?.accessToken;
      const refreshToken = res.data?.tokens?.refreshToken || res.data?.refreshToken;
      if (res.success && res.data && accessToken) {
        tokenStorage.setAuth(accessToken, refreshToken || "", res.data.user);
        setUser(res.data.user);
        const role = res.data.user.role;
        if (role === "FARMER") router.push("/farmer");
        else if (role === "TRANSPORTER") router.push("/transporter");
        else if (role === "ADMIN") router.push("/admin");
        else router.push("/");
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await postData<AuthResponseData>(ENDPOINTS.AUTH.REGISTER, payload, {
        showSuccessToast: "Account registered successfully!",
      });
      const accessToken = res.data?.tokens?.accessToken || res.data?.accessToken;
      const refreshToken = res.data?.tokens?.refreshToken || res.data?.refreshToken;
      if (res.success && res.data && accessToken) {
        tokenStorage.setAuth(accessToken, refreshToken || "", res.data.user);

        setUser(res.data.user);
        const role = res.data.user.role;
        if (role === "FARMER") router.push("/farmer");
        else if (role === "TRANSPORTER") router.push("/transporter");
        else if (role === "ADMIN") router.push("/admin");
        else router.push("/");
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await postData(ENDPOINTS.AUTH.LOGOUT, { refreshToken }, { showErrorToast: false });
      setUser(null);
      tokenStorage.clearAuth();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }, [user]);

  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      hasRole,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, hasRole, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
