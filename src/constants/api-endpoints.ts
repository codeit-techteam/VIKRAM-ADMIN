export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
    CHARTS: "/dashboard/charts",
    RECENT_ACTIVITY: "/dashboard/recent-activity",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
  },
  CMS: {
    BASE: "/cms",
    BY_ID: (id: string) => `/cms/${id}`,
  },
  WAREHOUSE: {
    BASE: "/warehouse",
    BY_ID: (id: string) => `/warehouse/${id}`,
  },
  SUBHUB: {
    BASE: "/subhub",
    BY_ID: (id: string) => `/subhub/${id}`,
  },
  CUSTOMER_EXECUTIVE: {
    BASE: "/customer-executive",
    BY_ID: (id: string) => `/customer-executive/${id}`,
  },
  LOGISTICS: {
    BASE: "/logistics",
    BY_ID: (id: string) => `/logistics/${id}`,
  },
  FINANCE: {
    BASE: "/finance",
    BY_ID: (id: string) => `/finance/${id}`,
  },
  REPORTS: {
    BASE: "/reports",
    EXPORT: "/reports/export",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },
  SETTINGS: {
    BASE: "/settings",
    PROFILE: "/settings/profile",
    PREFERENCES: "/settings/preferences",
  },
} as const;
