export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/admin/auth/login",
    LOGOUT: "/admin/auth/logout",
    REFRESH: "/admin/auth/refresh",
    ME: "/admin/auth/me",
    FORGOT_PASSWORD: "/admin/auth/forgot-password",
    RESET_PASSWORD: "/admin/auth/reset-password",
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
    BASE: "/admin/customer-executive",
    DASHBOARD: "/admin/customer-executive/dashboard",
    CUSTOMERS: "/admin/customer-executive/customers",
    CUSTOMER_BY_ID: (id: string) => `/admin/customer-executive/customers/${id}`,
    CUSTOMER_SEARCH: "/admin/customer-executive/customers/search",
    CUSTOMER_NOTE: (id: string) =>
      `/admin/customer-executive/customers/${id}/note`,
    CUSTOMER_WALLET: (id: string) =>
      `/admin/customer-executive/customers/${id}/wallet`,
    CUSTOMER_WALLET_HISTORY: (id: string) =>
      `/admin/customer-executive/customers/${id}/wallet/history`,
    CUSTOMER_MEMBERSHIP: (id: string) =>
      `/admin/customer-executive/customers/${id}/membership`,
    CUSTOMER_MEMBERSHIP_RENEW: (id: string) =>
      `/admin/customer-executive/customers/${id}/membership/renew`,
    CUSTOMER_LOYALTY: (id: string) =>
      `/admin/customer-executive/customers/${id}/loyalty`,
    CUSTOMER_LOYALTY_HISTORY: (id: string) =>
      `/admin/customer-executive/customers/${id}/loyalty/history`,
    ORDERS: "/admin/customer-executive/orders",
    ORDER_BY_ID: (id: string) => `/admin/customer-executive/orders/${id}`,
    ORDER_CANCEL: (id: string) =>
      `/admin/customer-executive/orders/${id}/cancel`,
    ORDER_ADDRESS: (id: string) =>
      `/admin/customer-executive/orders/${id}/address`,
    ORDER_PAYMENT: (id: string) =>
      `/admin/customer-executive/orders/${id}/payment`,
    ORDER_TRACKING: (id: string) =>
      `/admin/customer-executive/orders/${id}/tracking`,
    BULK: "/admin/customer-executive/bulk",
    BULK_BY_ID: (id: string) => `/admin/customer-executive/bulk/${id}`,
    EMERGENCY: "/admin/customer-executive/emergency",
    EMERGENCY_BY_ID: (id: string) =>
      `/admin/customer-executive/emergency/${id}`,
    PAYMENT_SEND_LINK: "/admin/customer-executive/payment/send-link",
    PAYMENT_REMINDER: "/admin/customer-executive/payment/reminder",
    TICKETS: "/admin/customer-executive/tickets",
    TICKET_BY_ID: (id: string) => `/admin/customer-executive/tickets/${id}`,
    BY_ID: (id: string) => `/admin/customer-executive/${id}`,
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
