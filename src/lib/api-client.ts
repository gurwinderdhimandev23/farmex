import Cookies from "js-cookie";
import { toast } from "sonner";
import { ApiResponse } from "@/types/api";
import { ENDPOINTS } from "@/constants/endpoints";

const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
};


const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7, // 7 days
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return Cookies.get(TOKEN_KEY) || null;
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  },

  getUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const userStr = Cookies.get(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as T;
    } catch {
      return null;
    }
  },

  setAuth(accessToken: string, refreshToken: string, user?: unknown) {
    if (typeof window !== "undefined") {
      Cookies.set(TOKEN_KEY, accessToken, COOKIE_OPTIONS);
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, COOKIE_OPTIONS);
      if (user) {
        Cookies.set(
          USER_KEY,
          typeof user === "string" ? user : JSON.stringify(user),
          COOKIE_OPTIONS
        );
      }
    }
  },

  clearAuth() {
    if (typeof window !== "undefined") {
      Cookies.remove(TOKEN_KEY, { path: "/" });
      Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
      Cookies.remove(USER_KEY, { path: "/" });
    }
  },
};

class ApiClient {
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${getApiBaseUrl()}${ENDPOINTS.AUTH.REFRESH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        tokenStorage.clearAuth();
        return null;
      }

      const resData = (await response.json()) as any;
      const accessToken = resData.data?.tokens?.accessToken || resData.data?.accessToken;
      const newRefreshToken = resData.data?.tokens?.refreshToken || resData.data?.refreshToken;
      const currentUser = tokenStorage.getUser();

      if (resData.success && accessToken) {
        tokenStorage.setAuth(accessToken, newRefreshToken || refreshToken, currentUser);
        return accessToken;
      }

      tokenStorage.clearAuth();
      return null;
    } catch {
      tokenStorage.clearAuth();
      return null;
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit & {
      showSuccessToast?: string;
      showErrorToast?: boolean;
      skipAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { showSuccessToast, showErrorToast = true, skipAuth = false, ...fetchOptions } = options;
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;


    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    try {
      let response = await fetch(url, { ...fetchOptions, headers });

      // Handle 401 Unauthorized -> Refresh Token
      if (response.status === 401 && !skipAuth && !endpoint.includes("/auth/")) {
        const newAccessToken = await this.refreshAccessToken();
        if (newAccessToken) {
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          response = await fetch(url, { ...fetchOptions, headers });
        } else {
          tokenStorage.clearAuth();
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || "An error occurred";
        if (showErrorToast) {
          toast.error(errorMsg);
        }
        return data;
      }

      if (showSuccessToast) {
        toast.success(showSuccessToast);
      }

      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error. Please try again.";
      if (showErrorToast) {
        toast.error(message);
      }
      return {
        success: false,
        data: null as unknown as T,
        error: { code: "NETWORK_ERROR", message },
      };
    }
  }

  public getData<T>(
    endpoint: string,
    options?: RequestInit & { showSuccessToast?: string; showErrorToast?: boolean; skipAuth?: boolean }
  ) {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  public postData<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { showSuccessToast?: string; showErrorToast?: boolean; skipAuth?: boolean }
  ) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public patchData<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { showSuccessToast?: string; showErrorToast?: boolean; skipAuth?: boolean }
  ) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public putData<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { showSuccessToast?: string; showErrorToast?: boolean; skipAuth?: boolean }
  ) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public deleteData<T>(
    endpoint: string,
    options?: RequestInit & { showSuccessToast?: string; showErrorToast?: boolean; skipAuth?: boolean }
  ) {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }
}

export const apiClient = new ApiClient();
export const getData = apiClient.getData.bind(apiClient);
export const postData = apiClient.postData.bind(apiClient);
export const patchData = apiClient.patchData.bind(apiClient);
export const putData = apiClient.putData.bind(apiClient);
export const deleteData = apiClient.deleteData.bind(apiClient);
export { ENDPOINTS };
