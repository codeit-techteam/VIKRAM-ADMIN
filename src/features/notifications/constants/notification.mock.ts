/** Fallback labels only — live options come from /admin/notifications/campaigns/options. */

export const DEEP_LINK_OPTIONS = [
  { value: "home", label: "Home Screen" },
  { value: "product", label: "Specific Product" },
  { value: "offer", label: "Specific Offer" },
  { value: "category", label: "Category Page" },
  { value: "order", label: "Order Detail" },
  { value: "cart", label: "Cart" },
  { value: "notifications", label: "Notifications" },
  { value: "custom_url", label: "Custom URL" },
] as const;
