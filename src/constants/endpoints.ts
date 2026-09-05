/**
 * Centralized API Endpoint Constants for Mandi Express / FarmEx
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  ENQUIRIES: {
    BASE: "/enquiries",
    MY_ENQUIRIES: "/enquiries/my-enquiries",
    ADMIN_ALL: "/enquiries/admin/all",
    BY_ID: (id: string) => `/enquiries/${id}`,
    CANCEL: (id: string) => `/enquiries/${id}/cancel`,
    REVIEW: (id: string) => `/enquiries/${id}/review`,
    UPDATE_SAMPLE: (id: string) => `/enquiries/${id}/sample`,
  },
  TRIPS: {
    ASSIGN: "/trips/assign",
    MY_REQUESTS: "/trips/my-requests",
    MY_ACTIVE: "/trips/my-active",
    ADMIN_ALL: "/trips/admin/all",
    BY_ID: (id: string) => `/trips/${id}`,
    RESPOND: (id: string) => `/trips/${id}/respond`,
    STATUS: (id: string) => `/trips/${id}/status`,
  },
  PRICING: {
    LABOUR_TYPES: "/pricing/labour-types",
    LABOUR_TYPE_BY_ID: (id: string) => `/pricing/labour-types/${id}`,
    ENQUIRY_PRICING: (enquiryId: string) => `/pricing/enquiry/${enquiryId}`,
    MASTER_RATES: "/admin/pricing/rates",
  },
  PAYMENTS: {
    RECORD_CASH: "/payments/record-cash",
    MY_EARNINGS: "/payments/my-earnings",
    ADMIN_ALL: "/payments/admin/all",
    BY_ENQUIRY: (enquiryId: string) => `/payments/enquiry/${enquiryId}`,
  },
  MANDI_PRICES: {
    BASE: "/mandi-prices",
    BY_ID: (id: string) => `/mandi-prices/${id}`,
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    READ_ALL: "/notifications/read-all",
    READ_ONE: (id: string) => `/notifications/${id}/read`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    TRANSPORTERS: "/admin/transporters",
    USERS: "/admin/users",
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    USER_VEHICLES: (id: string) => `/admin/users/${id}/vehicles`,
  },
} as const;

