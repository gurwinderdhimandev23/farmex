import { create } from "zustand";
import { User, UserRole, AuthResponseData } from "@/types/api";
import { getData, postData, tokenStorage, ENDPOINTS } from "@/lib/api-client";
import { LoginPayload, RegisterPayload } from "@/features/auth/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== "undefined" ? tokenStorage.getUser<User>() : null,
  isLoading: true,
  isAuthenticated: typeof window !== "undefined" ? !!tokenStorage.getAccessToken() : false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  refreshUser: async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await getData<User>(ENDPOINTS.AUTH.ME, { showErrorToast: false });
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await postData<AuthResponseData>(ENDPOINTS.AUTH.LOGIN, payload, {
        showSuccessToast: "Welcome back!",
      });
      const accessToken = res.data?.tokens?.accessToken || res.data?.accessToken;
      const refreshToken = res.data?.tokens?.refreshToken || res.data?.refreshToken;
      if (res.success && res.data && accessToken) {
        tokenStorage.setAuth(accessToken, refreshToken || "", res.data.user);
        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await postData<AuthResponseData>(ENDPOINTS.AUTH.REGISTER, payload, {
        showSuccessToast: "Account registered successfully!",
      });
      const accessToken = res.data?.tokens?.accessToken || res.data?.accessToken;
      const refreshToken = res.data?.tokens?.refreshToken || res.data?.refreshToken;
      if (res.success && res.data && accessToken) {
        tokenStorage.setAuth(accessToken, refreshToken || "", res.data.user);

        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await postData(ENDPOINTS.AUTH.LOGOUT, { refreshToken }, { showErrorToast: false });
    } finally {
      tokenStorage.clearAuth();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  },
}));
