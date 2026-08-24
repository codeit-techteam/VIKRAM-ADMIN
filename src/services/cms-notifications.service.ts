import { format } from "date-fns";

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  AudienceType,
  DeepLinkTarget,
  PushNotification,
  PushNotificationStats,
} from "@/features/notifications/types/notification.types";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminNotificationType =
  | "ORDER"
  | "OFFER"
  | "BANNER"
  | "ADMIN_ANNOUNCEMENT"
  | "PAYMENT"
  | "DELIVERY"
  | "MEMBERSHIP"
  | "LOYALTY"
  | "SYSTEM";

export interface AdminNotification {
  id: string;
  customerId?: string | null;
  type: AdminNotificationType | string;
  label: string;
  title: string;
  body: string;
  actionLabel?: string | null;
  actionRoute?: string | null;
  actionVariant?: string | null;
  isRead: boolean;
  isGlobal: boolean;
  priority: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    phone?: string | null;
    fullName?: string | null;
  } | null;
}

export interface CreateAdminNotificationInput {
  title: string;
  body: string;
  type: string;
  label: string;
  customerId?: string;
  isGlobal?: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

export interface BroadcastAdminNotificationInput {
  title: string;
  body: string;
  type: string;
  label: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface SendPushNotificationInput {
  title: string;
  message: string;
  audienceType: AudienceType;
  audienceTargets?: string[];
  deepLinkTarget: DeepLinkTarget;
  deepLinkValue?: string;
  /** Optional R2 URL — backend Notification model has no image field; ignored for now. */
  imageUrl?: string;
}

function buildActionRoute(
  target: DeepLinkTarget,
  value?: string,
): string | undefined {
  switch (target) {
    case "home":
      return "/(tabs)/home";
    case "product":
      return value ? `/(tabs)/catalog/${value}` : "/(tabs)/catalog";
    case "offer":
      return value ? `/(tabs)/offers/${value}` : "/(tabs)/offers";
    case "category":
      return value ? `/(tabs)/catalog?category=${value}` : "/(tabs)/catalog";
    case "custom_url":
      return value || undefined;
    default:
      return undefined;
  }
}

function resolveNotificationType(
  deepLinkTarget: DeepLinkTarget,
): AdminNotificationType {
  if (deepLinkTarget === "offer") return "OFFER";
  return "ADMIN_ANNOUNCEMENT";
}

function resolveLabel(
  audienceType: AudienceType,
  deepLinkTarget: DeepLinkTarget,
): string {
  const audience =
    audienceType === "all"
      ? "All Users"
      : audienceType === "city_hub"
        ? "City / Hub"
        : audienceType === "segment"
          ? "Segment"
          : "Custom List";
  return `Push · ${audience} · ${deepLinkTarget}`;
}

function parseDeepLinkTarget(actionRoute?: string | null): DeepLinkTarget {
  if (!actionRoute) return "home";
  if (actionRoute.startsWith("http://") || actionRoute.startsWith("https://")) {
    return "custom_url";
  }
  if (actionRoute.includes("/offers")) return "offer";
  if (actionRoute.includes("category=")) return "category";
  if (actionRoute.includes("/catalog/")) return "product";
  return "home";
}

function audienceLabelFromNotification(n: AdminNotification): string {
  if (n.isGlobal) return "All Users";
  if (n.customer?.fullName) return n.customer.fullName;
  if (n.customer?.phone) return n.customer.phone;
  if (n.customerId) return "Targeted user";
  return n.label || "Audience";
}

export function toUiPushNotification(n: AdminNotification): PushNotification {
  return {
    id: n.id,
    title: n.title,
    message: n.body,
    audienceType: n.isGlobal ? "all" : "custom_list",
    audienceLabel: audienceLabelFromNotification(n),
    deepLinkTarget: parseDeepLinkTarget(n.actionRoute),
    deepLinkValue: n.actionRoute ?? undefined,
    status: "SENT",
    sentOrScheduledAt: format(new Date(n.createdAt), "MMM d, yyyy · h:mm a"),
    sentCount: n.isGlobal ? undefined : 1,
  };
}

function unwrapListPayload(
  payload:
    | AdminNotification[]
    | { data: AdminNotification[]; meta?: ListMeta }
    | null
    | undefined,
): { rows: AdminNotification[]; meta?: ListMeta } {
  if (!payload) return { rows: [] };
  if (Array.isArray(payload)) return { rows: payload };
  return {
    rows: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta,
  };
}

export const notificationsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    type?: string;
  }): Promise<{
    data: AdminNotification[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const { data } = await api.get<
      ApiResponse<
        | AdminNotification[]
        | {
            data: AdminNotification[];
            meta: {
              page: number;
              limit: number;
              total: number;
              totalPages: number;
            };
          }
      >
    >(API_ENDPOINTS.ADMIN_CMS.NOTIFICATIONS, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        customerId: params?.customerId,
        type: params?.type,
      },
    });

    const { rows, meta } = unwrapListPayload(data.data);
    return {
      data: rows,
      meta: meta ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        total: rows.length,
        totalPages: 1,
      },
    };
  },

  get: async (id: string): Promise<AdminNotification> => {
    const { data } = await api.get<ApiResponse<AdminNotification>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_BY_ID(id),
    );
    return data.data;
  },

  create: async (
    payload: CreateAdminNotificationInput,
  ): Promise<AdminNotification> => {
    const { data } = await api.post<ApiResponse<AdminNotification>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATIONS,
      payload,
    );
    return data.data;
  },

  broadcast: async (
    payload: BroadcastAdminNotificationInput,
  ): Promise<{ notification: AdminNotification; sentTo: number }> => {
    const { data } = await api.post<
      ApiResponse<{ notification: AdminNotification; sentTo: number }>
    >(API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_BROADCAST, payload);
    return data.data;
  },

  update: async (
    id: string,
    payload: { title?: string; body?: string },
  ): Promise<AdminNotification> => {
    const { data } = await api.patch<ApiResponse<AdminNotification>>(
      API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_BY_ID(id),
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.NOTIFICATION_BY_ID(id));
  },

  /** Compose UI form → create or broadcast. */
  send: async (
    input: SendPushNotificationInput,
  ): Promise<{ sentTo?: number; notification?: AdminNotification }> => {
    const actionRoute = buildActionRoute(
      input.deepLinkTarget,
      input.deepLinkValue,
    );
    const type = resolveNotificationType(input.deepLinkTarget);
    const label = resolveLabel(input.audienceType, input.deepLinkTarget);
    const base = {
      title: input.title,
      body: input.message,
      type,
      label,
      actionLabel: "Open",
      actionRoute,
    };

    if (input.audienceType === "all") {
      const result = await notificationsService.broadcast(base);
      return { sentTo: result.sentTo, notification: result.notification };
    }

    const firstTarget = input.audienceTargets?.[0];
    const looksLikeUuid =
      !!firstTarget &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        firstTarget,
      );

    if (input.audienceType === "custom_list" && looksLikeUuid) {
      const notification = await notificationsService.create({
        ...base,
        customerId: firstTarget,
        isGlobal: false,
      });
      return { sentTo: 1, notification };
    }

    // Backend cannot target city/hub/segment — store as global announcement.
    const notification = await notificationsService.create({
      ...base,
      isGlobal: true,
    });
    return { sentTo: undefined, notification };
  },

  getHistory: async (): Promise<PushNotification[]> => {
    const { data } = await notificationsService.list({ page: 1, limit: 100 });
    // Prefer global/broadcast rows so per-customer fan-out does not flood the table.
    const preferred = data.filter((n) => n.isGlobal);
    const rows = preferred.length > 0 ? preferred : data;
    return rows.map(toUiPushNotification);
  },

  getStats: async (): Promise<PushNotificationStats> => {
    const { data, meta } = await notificationsService.list({
      page: 1,
      limit: 100,
    });
    const globals = data.filter((n) => n.isGlobal);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalSentThisMonth = globals.filter(
      (n) => new Date(n.createdAt) >= monthStart,
    ).length;

    return {
      totalSentThisMonth: totalSentThisMonth || globals.length,
      avgOpenRatePercent: 0,
      activeSubscribers: meta.total,
      scheduledCount: 0,
    };
  },
};
