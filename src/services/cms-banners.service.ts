import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import {
  computeBannerLifecycleStatus,
  type BannerStatus,
  type BannerTargetAudience,
} from "@/features/cms/types/banner.types";

export interface AdminBanner {
  id: string;
  slug: string;
  name?: string | null;
  description?: string | null;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileUrl?: string | null;
  tabletUrl?: string | null;
  desktopUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  badge?: string | null;
  bannerType?: string;
  ctaLabel?: string | null;
  ctaColor?: string | null;
  backgroundColor?: string | null;
  buttonAction?: string | null;
  linkUrl?: string | null;
  linkType?: string | null;
  linkTarget?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryLinkUrl?: string | null;
  secondaryLinkType?: string | null;
  secondaryLinkTarget?: string | null;
  placement: string;
  targetAudience?: BannerTargetAudience | string | null;
  displayOrder: number;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isVisible: boolean;
  status: string;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface CreateAdminBannerInput {
  title: string;
  slug?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  subtitle?: string;
  mobileUrl?: string;
  tabletUrl?: string;
  desktopUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  badge?: string;
  bannerType?: string;
  ctaLabel?: string;
  ctaColor?: string;
  backgroundColor?: string;
  buttonAction?: string;
  linkUrl?: string;
  linkType?: string;
  linkTarget?: string;
  secondaryCtaLabel?: string;
  secondaryLinkUrl?: string;
  secondaryLinkType?: string;
  secondaryLinkTarget?: string;
  placement?: string;
  targetAudience?: string;
  displayOrder?: number;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  publish?: boolean;
}

export function toUiBanner(banner: AdminBanner) {
  const status: BannerStatus = computeBannerLifecycleStatus(banner);
  return {
    id: banner.id,
    thumbnailUrl:
      banner.thumbnailUrl ||
      banner.mobileUrl ||
      banner.imageUrl ||
      banner.desktopUrl ||
      "",
    name: banner.name ?? null,
    description: banner.description ?? null,
    title: banner.title,
    subtitle: banner.subtitle ?? null,
    location: banner.placement,
    ctaLabel: banner.ctaLabel || "Shop Now",
    ctaPath: banner.linkTarget || banner.linkUrl || "/",
    linkType: banner.linkType || "ROUTE",
    status,
    startsAt: banner.startsAt ?? null,
    endsAt: banner.endsAt ?? null,
    priority: banner.priority ?? 0,
    targetAudience: (banner.targetAudience as BannerTargetAudience) || "ALL",
    backgroundColor: banner.backgroundColor ?? null,
    ctaColor: banner.ctaColor ?? null,
    badge: banner.badge ?? null,
    mobileUrl: banner.mobileUrl ?? null,
    desktopUrl: banner.desktopUrl ?? null,
    imageUrl: banner.imageUrl ?? null,
    updatedAt: banner.updatedAt ?? null,
    raw: banner,
  };
}

export const bannersService = {
  list: async (placement?: string): Promise<AdminBanner[]> => {
    const { data } = await api.get<ApiResponse<AdminBanner[]>>(
      API_ENDPOINTS.ADMIN_CMS.BANNERS,
      { params: placement ? { placement } : undefined },
    );
    return data.data ?? [];
  },

  get: async (id: string): Promise<AdminBanner> => {
    const { data } = await api.get<ApiResponse<AdminBanner>>(
      API_ENDPOINTS.ADMIN_CMS.BANNER_BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: CreateAdminBannerInput): Promise<AdminBanner> => {
    const { data } = await api.post<ApiResponse<AdminBanner>>(
      API_ENDPOINTS.ADMIN_CMS.BANNERS,
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: Partial<CreateAdminBannerInput>,
  ): Promise<AdminBanner> => {
    const { data } = await api.patch<ApiResponse<AdminBanner>>(
      API_ENDPOINTS.ADMIN_CMS.BANNER_BY_ID(id),
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.BANNER_BY_ID(id));
  },

  publish: async (id: string): Promise<AdminBanner> => {
    const { data } = await api.patch<ApiResponse<AdminBanner>>(
      API_ENDPOINTS.ADMIN_CMS.BANNER_PUBLISH(id),
    );
    return data.data;
  },

  unpublish: async (id: string): Promise<AdminBanner> => {
    const { data } = await api.patch<ApiResponse<AdminBanner>>(
      API_ENDPOINTS.ADMIN_CMS.BANNER_UNPUBLISH(id),
    );
    return data.data;
  },

  duplicate: async (id: string): Promise<AdminBanner> => {
    const { data } = await api.post<ApiResponse<AdminBanner>>(
      API_ENDPOINTS.ADMIN_CMS.BANNER_DUPLICATE(id),
    );
    return data.data;
  },

  reorder: async (
    items: Array<{ id: string; displayOrder: number }>,
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.ADMIN_CMS.BANNERS_REORDER, { items });
  },
};
