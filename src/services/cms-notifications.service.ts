import { format } from "date-fns";

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  AudienceType,
  DeepLinkTarget,
  NotificationStatus,
  PushComposerOptions,
  PushNotification,
  PushNotificationStats,
} from "@/features/notifications/types/notification.types";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  audienceType: string;
  audienceLabel: string;
  deepLinkTarget: string;
  deepLinkValue?: string | null;
  status: NotificationStatus | string;
  deliveryMode: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalFailed: number;
  openRatePercent: number;
}

export interface SendPushNotificationInput {
  title: string;
  message: string;
  audienceType: AudienceType;
  audienceTargets?: string[];
  deepLinkTarget: DeepLinkTarget;
  deepLinkValue?: string;
  imageUrl?: string;
  deliveryMode: "now" | "scheduled";
  scheduledAt?: string;
  saveAsDraft?: boolean;
}

type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const AUDIENCE_API: Record<AudienceType, string> = {
  all: "ALL",
  city_hub: "CITY_HUB",
  segment: "SEGMENT",
  custom_list: "CUSTOM_LIST",
};

const DEEP_LINK_API: Record<DeepLinkTarget, string> = {
  home: "HOME",
  product: "PRODUCT",
  offer: "OFFER",
  category: "CATEGORY",
  order: "ORDER",
  cart: "CART",
  notifications: "NOTIFICATIONS",
  custom_url: "CUSTOM",
};

function toUiAudience(value: string): AudienceType {
  const normalized = value.toLowerCase();
  if (normalized === "city_hub") return "city_hub";
  if (normalized === "segment") return "segment";
  if (normalized === "custom_list") return "custom_list";
  return "all";
}

function toUiDeepLink(value: string): DeepLinkTarget {
  const normalized = value.toLowerCase();
  if (normalized === "product") return "product";
  if (normalized === "offer") return "offer";
  if (normalized === "category") return "category";
  if (normalized === "order") return "order";
  if (normalized === "cart") return "cart";
  if (normalized === "notifications") return "notifications";
  if (normalized === "custom") return "custom_url";
  return "home";
}

function splitAudienceTargets(
  audienceType: AudienceType,
  targets: string[] = [],
) {
  if (audienceType === "city_hub") {
    return {
      hubIds: targets.filter((value) => !value.startsWith("city:")),
      cities: targets
        .filter((value) => value.startsWith("city:"))
        .map((value) => value.replace(/^city:/i, "")),
    };
  }
  if (audienceType === "segment") {
    return { segments: targets };
  }
  if (audienceType === "custom_list") {
    return { customerIds: targets };
  }
  return {};
}

export function toUiPushNotification(campaign: PushCampaign): PushNotification {
  const when = campaign.sentAt || campaign.scheduledAt || campaign.createdAt;
  return {
    id: campaign.id,
    title: campaign.title,
    message: campaign.body,
    imageUrl: campaign.imageUrl ?? undefined,
    audienceType: toUiAudience(campaign.audienceType),
    audienceLabel: campaign.audienceLabel,
    deepLinkTarget: toUiDeepLink(campaign.deepLinkTarget),
    deepLinkValue: campaign.deepLinkValue ?? undefined,
    status: campaign.status as NotificationStatus,
    sentOrScheduledAt: format(new Date(when), "MMM d, yyyy · h:mm a"),
    sentCount: campaign.totalSent,
    recipientCount: campaign.totalRecipients,
    deliveredCount: campaign.totalDelivered,
    openedCount: campaign.totalOpened,
    failedCount: campaign.totalFailed,
    openRatePercent: campaign.openRatePercent,
  };
}

function unwrapList(payload: unknown): {
  rows: PushCampaign[];
  meta?: ListMeta;
} {
  if (!payload) return { rows: [] };
  if (Array.isArray(payload)) return { rows: payload as PushCampaign[] };
  if (typeof payload === "object" && payload && "data" in payload) {
    const nested = payload as { data: PushCampaign[]; meta?: ListMeta };
    return { rows: nested.data ?? [], meta: nested.meta };
  }
  return { rows: [] };
}

export const notificationsService = {
  getOptions: async (): Promise<PushComposerOptions> => {
    const { data } = await api.get<ApiResponse<PushComposerOptions>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_CAMPAIGN_OPTIONS,
    );
    return data.data;
  },

  searchCustomers: async (
    q: string,
  ): Promise<Array<{ id: string; label: string; phone?: string }>> => {
    const { data } = await api.get<
      ApiResponse<Array<{ id: string; label: string; phone?: string }>>
    >(API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_CAMPAIGN_CUSTOMERS, {
      params: { q },
    });
    return data.data ?? [];
  },

  send: async (input: SendPushNotificationInput): Promise<PushCampaign> => {
    const payload = {
      title: input.title,
      body: input.message,
      imageUrl: input.imageUrl,
      audienceType: AUDIENCE_API[input.audienceType],
      deepLinkTarget: DEEP_LINK_API[input.deepLinkTarget],
      deepLinkValue: input.deepLinkValue,
      deliveryMode: input.deliveryMode === "scheduled" ? "SCHEDULED" : "NOW",
      scheduledAt: input.scheduledAt
        ? new Date(input.scheduledAt).toISOString()
        : undefined,
      saveAsDraft: Boolean(input.saveAsDraft),
      ...splitAudienceTargets(input.audienceType, input.audienceTargets),
    };

    const { data } = await api.post<ApiResponse<PushCampaign>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_CAMPAIGNS,
      payload,
    );
    return data.data;
  },

  sendTest: async (input: {
    title: string;
    message: string;
    imageUrl?: string;
    deepLinkTarget: DeepLinkTarget;
    deepLinkValue?: string;
  }): Promise<{ sent: number; failed: number; fcmConfigured: boolean }> => {
    const { data } = await api.post<
      ApiResponse<{ sent: number; failed: number; fcmConfigured: boolean }>
    >(API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_TEST, {
      title: input.title,
      body: input.message,
      imageUrl: input.imageUrl,
      deepLinkTarget: DEEP_LINK_API[input.deepLinkTarget],
      deepLinkValue: input.deepLinkValue,
    });
    return data.data;
  },

  getHistory: async (): Promise<PushNotification[]> => {
    const { data } = await api.get<
      ApiResponse<{ data: PushCampaign[]; meta?: ListMeta } | PushCampaign[]>
    >(API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_CAMPAIGNS, {
      params: { page: 1, limit: 50 },
    });
    return unwrapList(data.data).rows.map(toUiPushNotification);
  },

  getStats: async (): Promise<PushNotificationStats> => {
    const { data } = await api.get<ApiResponse<PushNotificationStats>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_CAMPAIGN_STATS,
    );
    return data.data;
  },

  sendDraft: async (id: string): Promise<PushCampaign> => {
    const { data } = await api.post<ApiResponse<PushCampaign>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_CAMPAIGN_SEND(id),
    );
    return data.data;
  },
};
