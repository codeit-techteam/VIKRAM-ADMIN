export type AudienceType = "all" | "city_hub" | "segment" | "custom_list";
export type DeliveryMode = "now" | "scheduled";
export type NotificationStatus = "SENT" | "SCHEDULED" | "DRAFT";
export type DeepLinkTarget =
  "home" | "product" | "offer" | "category" | "custom_url";

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
  openRatePercent?: number;
}

export interface PushNotificationStats {
  totalSentThisMonth: number;
  avgOpenRatePercent: number;
  activeSubscribers: number;
  scheduledCount: number;
}
