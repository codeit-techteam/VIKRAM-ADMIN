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
    ADMIN: "/admin/dashboard",
  },
  ADMIN_ORDERS: {
    BASE: "/admin/orders",
    BY_ID: (id: string) => `/admin/orders/${id}`,
    TIMELINE: (id: string) => `/admin/orders/${id}/timeline`,
    TRACKING: (id: string) => `/admin/orders/${id}/tracking`,
    STATUS: (id: string) => `/admin/orders/${id}/status`,
    ASSIGN_DRIVER: (id: string) => `/admin/orders/${id}/assign-driver`,
    INVOICE: (id: string) => `/admin/orders/${id}/invoice`,
    INVOICE_PDF: (id: string) => `/admin/orders/${id}/invoice/pdf`,
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
  },
  CUSTOMERS: {
    BASE: "/admin/customers",
    BY_ID: (id: string) => `/admin/customers/${id}`,
    STATUS: (id: string) => `/admin/customers/${id}/status`,
    ACTIVATE: (id: string) => `/admin/customers/${id}/activate`,
    DISABLE: (id: string) => `/admin/customers/${id}/disable`,
    UPGRADE_MEMBERSHIP: (id: string) =>
      `/admin/customers/${id}/membership/upgrade`,
    SITES: (id: string) => `/admin/customers/${id}/sites`,
    SITE_BY_ID: (id: string, siteId: string) =>
      `/admin/customers/${id}/sites/${siteId}`,
    SITE_PRIMARY: (id: string, siteId: string) =>
      `/admin/customers/${id}/sites/${siteId}/primary`,
  },
  CMS: {
    BASE: "/cms",
    BY_ID: (id: string) => `/cms/${id}`,
  },
  WAREHOUSE: {
    BASE: "/warehouse",
    BY_ID: (id: string) => `/warehouse/${id}`,
  },
  ADMIN_REQUISITIONS: {
    BASE: "/admin/requisitions",
    STATS: "/admin/requisitions/stats",
    BY_ID: (id: string) => `/admin/requisitions/${id}`,
    APPROVE: (id: string) => `/admin/requisitions/${id}/approve`,
    REJECT: (id: string) => `/admin/requisitions/${id}/reject`,
    ALLOCATE: (id: string) => `/admin/requisitions/${id}/allocate`,
    DISPATCH: (id: string) => `/admin/requisitions/${id}/dispatch`,
    EXPORT: (id: string) => `/admin/requisitions/${id}/export`,
    COMMENTS: (id: string) => `/admin/requisitions/${id}/comments`,
  },
  SUBHUB: {
    BASE: "/admin/hubs",
    BY_ID: (id: string) => `/admin/hubs/${id}`,
    PROVISION: "/admin/hubs/provision",
    INVENTORY: (id: string) => `/admin/hubs/${id}/inventory`,
    ORDERS: (id: string) => `/admin/hubs/${id}/orders`,
    ORDERS_DASHBOARD: (id: string) => `/admin/hubs/${id}/orders/dashboard`,
    ORDERS_ANALYTICS: (id: string) => `/admin/hubs/${id}/orders/analytics`,
    ORDERS_ACTIVE: (id: string) => `/admin/hubs/${id}/orders/active`,
    ORDERS_COMPLETED: (id: string) => `/admin/hubs/${id}/orders/completed`,
    ORDERS_CANCELLED: (id: string) => `/admin/hubs/${id}/orders/cancelled`,
    ORDERS_EXPORT: (id: string) => `/admin/hubs/${id}/orders/export`,
    PERFORMANCE: (id: string) => `/admin/hubs/${id}/performance`,
    STATUS: (id: string) => `/admin/hubs/${id}/status`,
    MANAGER: (id: string) => `/admin/hubs/${id}/manager`,
    DRIVERS: (id: string) => `/admin/hubs/${id}/drivers`,
    COVERAGE: (id: string) => `/admin/hubs/${id}/coverage`,
  },
  PRODUCTS: {
    BASE: "/admin/products",
    BY_ID: (id: string) => `/admin/products/${id}`,
  },
  CATEGORIES: {
    BASE: "/admin/categories",
    BY_ID: (id: string) => `/admin/categories/${id}`,
  },
  CUSTOMER_EXECUTIVE: {
    BASE: "/admin/customer-executive",
    DASHBOARD: "/admin/customer-executive/dashboard",
    CUSTOMERS: "/admin/customer-executive/customers",
    CUSTOMER_BY_ID: (id: string) => `/admin/customer-executive/customers/${id}`,
    CUSTOMER_SEARCH: "/admin/customer-executive/customers/search",
    CUSTOMER_NOTE: (id: string) =>
      `/admin/customer-executive/customers/${id}/note`,
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
  HUB_MANAGERS: {
    BASE: "/admin/hub-managers",
    HUBS: "/admin/hub-managers/hubs",
    BY_ID: (id: string) => `/admin/hub-managers/${id}`,
    TRANSFER: (id: string) => `/admin/hub-managers/${id}/transfer-hub`,
    DEACTIVATE: (id: string) => `/admin/hub-managers/${id}/deactivate`,
    REACTIVATE: (id: string) => `/admin/hub-managers/${id}/reactivate`,
    RESET_PASSWORD: (id: string) => `/admin/hub-managers/${id}/reset-password`,
  },
  LOYALTY: {
    BASE: "/admin/loyalty",
    STATS: "/admin/loyalty/stats",
    LEADERBOARD: "/admin/loyalty/leaderboard",
    BY_CUSTOMER: (customerId: string) => `/admin/loyalty/${customerId}`,
    ADJUST: (customerId: string) => `/admin/loyalty/${customerId}/adjust`,
    REWARD: (customerId: string) => `/admin/loyalty/${customerId}/reward`,
    REDEEM: (customerId: string) => `/admin/loyalty/${customerId}/redeem`,
  },
} as const;
