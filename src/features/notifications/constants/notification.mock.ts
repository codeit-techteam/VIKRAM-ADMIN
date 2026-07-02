import type {
  PushNotification,
  PushNotificationStats,
} from "@/features/notifications/types/notification.types";

export const PUSH_NOTIFICATION_STATS: PushNotificationStats = {
  totalSentThisMonth: 47,
  avgOpenRatePercent: 31,
  activeSubscribers: 128400,
  scheduledCount: 3,
};

export const PUSH_NOTIFICATION_HISTORY: PushNotification[] = [
  {
    id: "pn-001",
    title: "🔥 Monsoon Sale is Live!",
    message:
      "Up to 40% off on cement, steel & plumbing. Shop now before stocks run out!",
    imageUrl: "https://picsum.photos/seed/monsoon-sale/80/80",
    audienceType: "all",
    audienceLabel: "All Users",
    deepLinkTarget: "offer",
    status: "SENT",
    sentOrScheduledAt: "Jul 1, 2026 · 10:30 AM",
    sentCount: 12400,
    openRatePercent: 34,
  },
  {
    id: "pn-002",
    title: "New Machinery Arrivals",
    message:
      "Excavators, mixers & power tools just landed at Ahmedabad & Surat hubs.",
    audienceType: "city_hub",
    audienceLabel: "Pan-Gujarat",
    deepLinkTarget: "category",
    status: "SCHEDULED",
    sentOrScheduledAt: "Jul 5, 2026 · 9:00 AM",
  },
  {
    id: "pn-003",
    title: "Weekend Cement Offer Draft",
    message: "Flat ₹40/bag discount on ACC & Ambuja cement this weekend only.",
    audienceType: "all",
    audienceLabel: "All Users",
    deepLinkTarget: "home",
    status: "DRAFT",
    sentOrScheduledAt: "—",
  },
];

export const AUDIENCE_CITY_HUB_OPTIONS = [
  { value: "ahmedabad", label: "Ahmedabad Hub" },
  { value: "surat", label: "Surat Hub" },
  { value: "vadodara", label: "Vadodara Hub" },
  { value: "rajkot", label: "Rajkot Hub" },
  { value: "pan-gujarat", label: "Pan-Gujarat" },
] as const;

export const AUDIENCE_SEGMENT_OPTIONS = [
  { value: "new", label: "New Users" },
  { value: "active", label: "Active Users" },
  { value: "dormant", label: "Dormant Users" },
] as const;

export const DEEP_LINK_OPTIONS = [
  { value: "home", label: "Home Screen" },
  { value: "product", label: "Specific Product" },
  { value: "offer", label: "Specific Offer" },
  { value: "category", label: "Category Page" },
  { value: "custom_url", label: "Custom URL" },
] as const;

export const DEEP_LINK_PRODUCT_OPTIONS = [
  { value: "acc-cement-50kg", label: "ACC Cement 50kg" },
  { value: "tata-tmt-12mm", label: "TATA TMT 12mm" },
  { value: "jcb-3dx", label: "JCB 3DX Excavator" },
] as const;

export const DEEP_LINK_OFFER_OPTIONS = [
  { value: "monsoon-sale", label: "Monsoon Sale 2026" },
  { value: "weekend-cement", label: "Weekend Cement Offer" },
] as const;

export const DEEP_LINK_CATEGORY_OPTIONS = [
  { value: "cement", label: "Cement" },
  { value: "steel", label: "Steel & TMT" },
  { value: "machinery", label: "Machinery" },
] as const;
