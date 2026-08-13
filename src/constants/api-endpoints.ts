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
  ADMIN_AUDIT: {
    BASE: "/admin/audit-logs",
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
    STATS: "/admin/customers/stats",
    BY_ID: (id: string) => `/admin/customers/${id}`,
    STATUS: (id: string) => `/admin/customers/${id}/status`,
    ACTIVATE: (id: string) => `/admin/customers/${id}/activate`,
    DISABLE: (id: string) => `/admin/customers/${id}/disable`,
    ASSIGNMENT: (id: string) => `/admin/customers/${id}/assignment`,
    SITES: (id: string) => `/admin/customers/${id}/sites`,
    SITE_BY_ID: (id: string, siteId: string) =>
      `/admin/customers/${id}/sites/${siteId}`,
    SITE_PRIMARY: (id: string, siteId: string) =>
      `/admin/customers/${id}/sites/${siteId}/primary`,
  },
  ADMIN_USERS: {
    BASE: "/admin/users",
    BY_ID: (id: string) => `/admin/users/${id}`,
    STATUS: (id: string) => `/admin/users/${id}/status`,
    ROLE: (id: string) => `/admin/users/${id}/role`,
    PASSWORD: (id: string) => `/admin/users/${id}/password`,
  },
  CMS: {
    BASE: "/cms",
    BY_ID: (id: string) => `/cms/${id}`,
  },
  ADMIN_CMS: {
    BANNERS: "/admin/banners",
    BANNER_BY_ID: (id: string) => `/admin/banners/${id}`,
    BANNER_PUBLISH: (id: string) => `/admin/banners/${id}/publish`,
    BANNER_UNPUBLISH: (id: string) => `/admin/banners/${id}/unpublish`,
    BANNER_DUPLICATE: (id: string) => `/admin/banners/${id}/duplicate`,
    BANNERS_REORDER: "/admin/banners/reorder",
    DELIVERY_PROMOTIONS: "/admin/delivery-promotions",
    DELIVERY_PROMOTION_BY_ID: (id: string) =>
      `/admin/delivery-promotions/${id}`,
    DELIVERY_PROMOTION_PUBLISH: (id: string) =>
      `/admin/delivery-promotions/${id}/publish`,
    DELIVERY_PROMOTION_UNPUBLISH: (id: string) =>
      `/admin/delivery-promotions/${id}/unpublish`,
    OFFERS: "/admin/offers",
    OFFER_BY_ID: (id: string) => `/admin/offers/${id}`,
    OFFER_PRODUCTS: (id: string) => `/admin/offers/${id}/products`,
    OFFER_PUBLISH: (id: string) => `/admin/offers/${id}/publish`,
    OFFER_ACTIVATE: (id: string) => `/admin/offers/${id}/activate`,
    OFFER_DEACTIVATE: (id: string) => `/admin/offers/${id}/deactivate`,
    VIDEOS: "/admin/videos",
    VIDEO_UPLOAD: "/admin/videos/upload",
    VIDEO_BY_ID: (id: string) => `/admin/videos/${id}`,
    VIDEO_PUBLISH: (id: string) => `/admin/videos/${id}/publish`,
    VIDEO_UNPUBLISH: (id: string) => `/admin/videos/${id}/unpublish`,
    VIDEO_ARCHIVE: (id: string) => `/admin/videos/${id}/archive`,
    VIDEOS_REORDER: "/admin/videos/reorder",
    MEDIA_UPLOAD: "/admin/media/upload",
    MEDIA_DELETE: "/admin/media",
    ADVERTISEMENTS: "/admin/advertisements",
    ADVERTISEMENT_BY_ID: (id: string) => `/admin/advertisements/${id}`,
    ADVERTISEMENT_ACTIVATE: (id: string) =>
      `/admin/advertisements/${id}/activate`,
    ADVERTISEMENT_DEACTIVATE: (id: string) =>
      `/admin/advertisements/${id}/deactivate`,
    PROMOTIONAL_CARDS: "/admin/promotional-cards",
    PROMOTIONAL_CARD_BY_ID: (id: string) => `/admin/promotional-cards/${id}`,
    PROMOTIONAL_CARD_ACTIVATE: (id: string) =>
      `/admin/promotional-cards/${id}/activate`,
    PROMOTIONAL_CARD_DEACTIVATE: (id: string) =>
      `/admin/promotional-cards/${id}/deactivate`,
    HOME_SECTIONS: "/admin/home-sections",
    HOME_SECTION_BY_ID: (id: string) => `/admin/home-sections/${id}`,
    HOME_SECTION_TOGGLE: (id: string) => `/admin/home-sections/${id}/toggle`,
    HOME_SECTIONS_REORDER: "/admin/home-sections/reorder",
    QUICK_ACTIONS: "/admin/quick-actions",
    QUICK_ACTION_BY_ID: (id: string) => `/admin/quick-actions/${id}`,
    QUICK_ACTIONS_REORDER: "/admin/quick-actions/reorder",
    HOME_SEQUENCE: "/admin/cms/home-sequence",
    NOTIFICATIONS: "/admin/notifications",
    NOTIFICATION_BY_ID: (id: string) => `/admin/notifications/${id}`,
    NOTIFICATION_BROADCAST: "/admin/notifications/broadcast",
    TESTIMONIALS: "/admin/testimonials",
    TESTIMONIAL_BY_ID: (id: string) => `/admin/testimonials/${id}`,
    TESTIMONIAL_PUBLISH: (id: string) => `/admin/testimonials/${id}/publish`,
    TESTIMONIAL_UNPUBLISH: (id: string) =>
      `/admin/testimonials/${id}/unpublish`,
    TESTIMONIALS_REORDER: "/admin/testimonials/reorder",
  },
  WAREHOUSE: {
    BASE: "/admin/warehouse",
    DASHBOARD: "/admin/warehouse/dashboard",
    INVENTORY: "/admin/warehouse/inventory",
    INVENTORY_EXPORT: "/admin/warehouse/inventory/export",
    ALLOCATIONS: "/admin/warehouse/allocations",
    TRANSFERS: "/admin/warehouse/transfers",
    TRANSFER_BY_ID: (id: string) => `/admin/warehouse/transfers/${id}`,
  },
  ADMIN_REQUISITIONS: {
    BASE: "/admin/requisitions",
    STATS: "/admin/requisitions/stats",
    BY_ID: (id: string) => `/admin/requisitions/${id}`,
    APPROVE: (id: string) => `/admin/requisitions/${id}/approve`,
    REJECT: (id: string) => `/admin/requisitions/${id}/reject`,
    ALLOCATE: (id: string) => `/admin/requisitions/${id}/allocate`,
    ASSIGN_LOGISTICS: (id: string) =>
      `/admin/requisitions/${id}/assign-logistics`,
    DISPATCH: (id: string) => `/admin/requisitions/${id}/dispatch`,
    EXPORT: (id: string) => `/admin/requisitions/${id}/export`,
    COMMENTS: (id: string) => `/admin/requisitions/${id}/comments`,
  },
  ADMIN_HUB_RECEIVING: {
    BASE: "/admin/hub-receiving",
    BY_ID: (id: string) => `/admin/hub-receiving/${id}`,
  },
  SUBHUB: {
    BASE: "/admin/hubs",
    BY_ID: (id: string) => `/admin/hubs/${id}`,
    PROVISION: "/admin/hubs/provision",
    SUMMARY: (id: string) => `/admin/hubs/${id}/summary`,
    INVENTORY: (id: string) => `/admin/hubs/${id}/inventory`,
    NETWORK_INVENTORY: "/admin/hubs/inventory",
    DISPATCH_LOGS: (id: string) => `/admin/hubs/${id}/dispatch-logs`,
    NETWORK_DISPATCH_LOGS: "/admin/hubs/dispatch-logs",
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
    ACTIVITY: "/admin/customer-executive/activity",
    CUSTOMERS: "/admin/customer-executive/customers",
    CUSTOMER_LOOKUP: "/admin/customer-executive/customers/lookup",
    CUSTOMER_SEND_OTP: "/admin/customer-executive/customers/send-otp",
    CUSTOMER_VERIFY_OTP: "/admin/customer-executive/customers/verify-otp",
    CUSTOMER_BY_ID: (id: string) => `/admin/customer-executive/customers/${id}`,
    CUSTOMER_SEARCH: "/admin/customer-executive/customers/search",
    CUSTOMER_NOTE: (id: string) =>
      `/admin/customer-executive/customers/${id}/note`,
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
    TRACKING_SEARCH: "/admin/customer-executive/tracking/search",
    PAYMENTS: "/admin/customer-executive/payments",
    BULK: "/admin/customer-executive/bulk",
    BULK_STATS: "/admin/customer-executive/bulk/stats",
    BULK_BY_ID: (id: string) => `/admin/customer-executive/bulk/${id}`,
    BULK_STATUS: (id: string) =>
      `/admin/customer-executive/bulk/${id}/status`,
    BULK_ASSIGN: (id: string) =>
      `/admin/customer-executive/bulk/${id}/assign`,
    BULK_FOLLOW_UPS: (id: string) =>
      `/admin/customer-executive/bulk/${id}/follow-ups`,
    BULK_FOLLOW_UP: (id: string, followUpId: string) =>
      `/admin/customer-executive/bulk/${id}/follow-ups/${followUpId}`,
    BULK_NOTES: (id: string) =>
      `/admin/customer-executive/bulk/${id}/notes`,
    BULK_QUOTATIONS: (id: string) =>
      `/admin/customer-executive/bulk/${id}/quotations`,
    BULK_QUOTATION_STATUS: (id: string, quotationId: string) =>
      `/admin/customer-executive/bulk/${id}/quotations/${quotationId}/status`,
    BULK_CONVERT: (id: string) =>
      `/admin/customer-executive/bulk/${id}/convert`,
    BULK_REJECT: (id: string) =>
      `/admin/customer-executive/bulk/${id}/reject`,
    BULK_CANCEL: (id: string) =>
      `/admin/customer-executive/bulk/${id}/cancel`,
    EMERGENCY: "/admin/customer-executive/emergency",
    EMERGENCY_BY_ID: (id: string) =>
      `/admin/customer-executive/emergency/${id}`,
    PAYMENT_SEND_LINK: "/admin/customer-executive/payment/send-link",
    PAYMENT_REMINDER: "/admin/customer-executive/payment/reminder",
    TICKETS: "/admin/customer-executive/tickets",
    TICKET_BY_ID: (id: string) => `/admin/customer-executive/tickets/${id}`,
    EXPERT_CALLBACKS: "/admin/customer-executive/expert-callbacks",
    EXPERT_CALLBACK_BY_ID: (id: string) =>
      `/admin/customer-executive/expert-callbacks/${id}`,
    BY_ID: (id: string) => `/admin/customer-executive/${id}`,
  },
  LOGISTICS: {
    BASE: "/admin/logistics",
    FILTERS: "/admin/logistics/filters",
    DASHBOARD: "/admin/logistics/dashboard",
    WAREHOUSE: "/admin/logistics/warehouse",
    CUSTOMER: "/admin/logistics/customer",
    DISPATCH: "/admin/logistics/dispatch",
    MAINTENANCE: "/admin/logistics/maintenance",
    TRACKING: (shipmentId: string) =>
      `/admin/logistics/tracking/${encodeURIComponent(shipmentId)}`,
    BY_ID: (id: string) => `/admin/logistics/${id}`,
  },
  DELIVERY_PRICING: {
    BASE: "/admin/delivery-pricing",
    SUMMARY: "/admin/delivery-pricing/summary",
    BENEFIT_CONFIG: "/admin/delivery-pricing/benefit-config",
    VEHICLES: "/admin/delivery-pricing/vehicles",
    VEHICLE: (vehicleType: string) =>
      `/admin/delivery-pricing/vehicles/${encodeURIComponent(vehicleType)}`,
    ENGINE_CONFIG: "/admin/delivery-pricing/engine-config",
    ETA_CONFIG: "/admin/delivery-pricing/eta-config",
    LOADING_RULES: "/admin/delivery-pricing/loading-rules",
    BY_ID: (id: string) => `/admin/delivery-pricing/${id}`,
    HISTORY: (id: string) => `/admin/delivery-pricing/${id}/history`,
    STATUS: (id: string) => `/admin/delivery-pricing/${id}/status`,
  },
  ADMIN_VEHICLES: {
    BASE: "/admin/vehicles",
    STATS: "/admin/vehicles/stats",
    BY_ID: (id: string) => `/admin/vehicles/${id}`,
    ASSIGNMENT: (id: string) => `/admin/vehicles/${id}/assignment`,
    DRIVER: (id: string) => `/admin/vehicles/${id}/driver`,
    STATUS: (id: string) => `/admin/vehicles/${id}/status`,
    DISPATCH_HISTORY: (id: string) => `/admin/vehicles/${id}/dispatch-history`,
    DOCUMENTS: (id: string) => `/admin/vehicles/${id}/documents`,
    DOCUMENT_UPLOAD_URL: (id: string) =>
      `/admin/vehicles/${id}/documents/upload-url`,
    DOCUMENT_BY_ID: (id: string, documentId: string) =>
      `/admin/vehicles/${id}/documents/${documentId}`,
  },
  ADMIN_DRIVERS: {
    BASE: "/admin/drivers",
    STATS: "/admin/drivers/stats",
    BY_ID: (id: string) => `/admin/drivers/${id}`,
    VEHICLE: (id: string) => `/admin/drivers/${id}/vehicle`,
    DOCUMENTS: (id: string) => `/admin/drivers/${id}/documents`,
    DOCUMENT_UPLOAD_URL: (id: string) =>
      `/admin/drivers/${id}/documents/upload-url`,
    DOCUMENT_BY_ID: (id: string, documentId: string) =>
      `/admin/drivers/${id}/documents/${documentId}`,
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
