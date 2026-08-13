import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import {
  computeDeliveryPromotionLifecycle,
  type DeliveryPromotion,
} from "@/features/cms/types/delivery-promotion.types";

export interface AdminDeliveryPromotion {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  headline: string;
  subtitle?: string | null;
  badge?: string | null;
  remainingHeadline?: string | null;
  exhaustedHeadline?: string | null;
  exhaustedBehavior?: "HIDE" | "SHOW_ALTERNATE" | null;
  bannerImage: string;
  mobileBannerImage?: string | null;
  desktopBannerImage?: string | null;
  placement: string;
  targetAudience?: string | null;
  status: string;
  lifecycleStatus?: string;
  visibility?: string;
  isVisible?: boolean;
  priority: number;
  ctaEnabled: boolean;
  ctaLabel?: string | null;
  ctaType?: string | null;
  ctaValue?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface CreateDeliveryPromotionInput {
  name: string;
  slug?: string;
  description?: string;
  headline: string;
  subtitle?: string;
  badge?: string;
  remainingHeadline?: string;
  exhaustedHeadline?: string;
  exhaustedBehavior?: "HIDE" | "SHOW_ALTERNATE";
  bannerImage?: string;
  mobileBannerImage?: string;
  desktopBannerImage?: string;
  placement?: string;
  targetAudience?: string;
  status?: string;
  priority?: number;
  ctaEnabled?: boolean;
  ctaLabel?: string;
  ctaType?: string;
  ctaValue?: string;
  startsAt?: string;
  endsAt?: string;
  publish?: boolean;
}

export function toUiDeliveryPromotion(
  row: AdminDeliveryPromotion,
): DeliveryPromotion {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    headline: row.headline,
    subtitle: row.subtitle ?? null,
    badge: row.badge ?? null,
    remainingHeadline: row.remainingHeadline ?? null,
    exhaustedHeadline: row.exhaustedHeadline ?? null,
    exhaustedBehavior: row.exhaustedBehavior ?? "HIDE",
    bannerImage: row.mobileBannerImage || row.bannerImage || "",
    mobileBannerImage: row.mobileBannerImage ?? null,
    desktopBannerImage: row.desktopBannerImage ?? null,
    placement: row.placement,
    targetAudience: (row.targetAudience as DeliveryPromotion["targetAudience"]) || "ALL",
    status: computeDeliveryPromotionLifecycle(row),
    lifecycleStatus: computeDeliveryPromotionLifecycle(row),
    isVisible: row.isVisible,
    priority: row.priority ?? 10,
    ctaEnabled: row.ctaEnabled === true,
    ctaLabel: row.ctaLabel ?? null,
    ctaType: row.ctaType ?? null,
    ctaValue: row.ctaValue ?? null,
    startsAt: row.startsAt ?? null,
    endsAt: row.endsAt ?? null,
    updatedAt: row.updatedAt ?? null,
    createdAt: row.createdAt ?? null,
  };
}

export const deliveryPromotionsService = {
  list: async (): Promise<AdminDeliveryPromotion[]> => {
    const { data } = await api.get<ApiResponse<AdminDeliveryPromotion[]>>(
      API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTIONS,
    );
    return data.data ?? [];
  },

  get: async (id: string): Promise<AdminDeliveryPromotion> => {
    const { data } = await api.get<ApiResponse<AdminDeliveryPromotion>>(
      API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTION_BY_ID(id),
    );
    return data.data;
  },

  create: async (
    payload: CreateDeliveryPromotionInput,
  ): Promise<AdminDeliveryPromotion> => {
    const { data } = await api.post<ApiResponse<AdminDeliveryPromotion>>(
      API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTIONS,
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: Partial<CreateDeliveryPromotionInput>,
  ): Promise<AdminDeliveryPromotion> => {
    const { data } = await api.patch<ApiResponse<AdminDeliveryPromotion>>(
      API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTION_BY_ID(id),
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTION_BY_ID(id));
  },

  publish: async (id: string): Promise<AdminDeliveryPromotion> => {
    const { data } = await api.patch<ApiResponse<AdminDeliveryPromotion>>(
      API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTION_PUBLISH(id),
    );
    return data.data;
  },

  unpublish: async (id: string): Promise<AdminDeliveryPromotion> => {
    const { data } = await api.patch<ApiResponse<AdminDeliveryPromotion>>(
      API_ENDPOINTS.ADMIN_CMS.DELIVERY_PROMOTION_UNPUBLISH(id),
    );
    return data.data;
  },
};
