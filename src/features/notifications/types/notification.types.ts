export type AudienceType = "all" | "city_hub" | "segment" | "custom_list";
export type DeliveryMode = "now" | "scheduled";
export type NotificationStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "QUEUED"
  | "SENDING"
  | "SENT"
  | "PARTIALLY_SENT"
  | "FAILED"
  | "CANCELLED";
export type DeepLinkTarget =
  | "home"
  | "product"
  | "offer"
  | "category"
  | "order"
  | "cart"
  | "notifications"
  | "custom_url";

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  audienceType: AudienceType;
  audienceLabel: string;
  deepLinkTarget: DeepLinkTarget;
  deepLinkValue?: string;
  status: NotificationStatus;
  sentOrScheduledAt: string;
  sentCount?: number;
  recipientCount?: number;
  deliveredCount?: number;
  openedCount?: number;
  failedCount?: number;
  openRatePercent?: number;
}

export interface PushNotificationStats {
  totalSentThisMonth: number;
  avgOpenRatePercent: number;
  activeSubscribers: number;
  scheduledCount: number;
}

export interface AudienceOption {
  id: string;
  label: string;
  city?: string;
  phone?: string;
}

export interface PushComposerOptions {
  fcmConfigured?: boolean;
  hubs: AudienceOption[];
  cities: AudienceOption[];
  segments: AudienceOption[];
  products: AudienceOption[];
  categories: AudienceOption[];
  offers: AudienceOption[];
}
