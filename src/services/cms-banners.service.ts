import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export type AdminBannerStatus = "LIVE" | "DRAFT" | "INACTIVE";

export interface AdminBanner {
  id: string;
  slug: string;
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
  displayOrder: number;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isVisible: boolean;
  status: string;
}

export interface CreateAdminBannerInput {
  title: string;
  slug: string;
  imageUrl: string;
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
  displayOrder?: number;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  publish?: boolean;
}

function mapStatus(banner: AdminBanner): AdminBannerStatus {
  if (banner.status === "ACTIVE" && banner.isVisible) return "LIVE";
  if (banner.status === "DRAFT") return "DRAFT";
  return "INACTIVE";
}

export function toUiBanner(banner: AdminBanner) {
  return {
    id: banner.id,
    thumbnailUrl: banner.thumbnailUrl || banner.mobileUrl || banner.imageUrl,
    title: banner.title,
    location: banner.placement,
    ctaLabel: banner.ctaLabel || "Shop Now",
    ctaPath: banner.linkTarget || banner.linkUrl || "/",
    linkType: banner.linkType || "ROUTE",
    status:
      mapStatus(banner) === "LIVE" ? ("LIVE" as const) : ("DRAFT" as const),
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

  reorder: async (
    items: Array<{ id: string; displayOrder: number }>,
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.ADMIN_CMS.BANNERS_REORDER, { items });
  },
};
