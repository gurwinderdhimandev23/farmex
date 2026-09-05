import { create } from "zustand";
import { Notification } from "@/types/api";
import { apiClient, ENDPOINTS } from "@/lib/api-client";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const res = await apiClient.getData<Notification[]>(ENDPOINTS.NOTIFICATIONS.BASE, { showErrorToast: false });
      if (res.success && Array.isArray(res.data)) {
        set({
          notifications: res.data,
          unreadCount: res.data.filter((n) => !n.isRead).length,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patchData(ENDPOINTS.NOTIFICATIONS.READ_ALL, {}, { showErrorToast: false });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.patchData(ENDPOINTS.NOTIFICATIONS.READ_ONE(id), {}, { showErrorToast: false });
      set((state) => {
        const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch {
      // ignore
    }
  },
}));
