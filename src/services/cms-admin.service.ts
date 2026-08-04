import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface AdminAdvertisement {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  description?: string | null;
  imageUrl: string;
  logoUrl?: string | null;
  buttonText?: string | null;
  redirectType: string;
  redirectId?: string | null;
  displayOrder: number;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
}

export interface AdminHomeSection {
  id: string;
  sectionType: string;
  title?: string | null;
  subtitle?: string | null;
  displayOrder: number;
  enabled: boolean;
  apiSource?: string | null;
  layoutType?: string | null;
}

export interface AdminPromotionalCard {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  badge?: string | null;
  benefits?: string[] | null;
  redirectType: string;
  redirectId?: string | null;
  cardType: string;
  priority: number;
  displayOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
}

export interface AdminQuickAction {
  id: string;
  slug: string;
  label: string;
  iconUrl?: string | null;
  iconKey?: string | null;
  redirectType: string;
  redirectId?: string | null;
  displayOrder: number;
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const cmsAdminService = {
  listAds: async (): Promise<AdminAdvertisement[]> => {
    const { data } = await api.get<ApiResponse<AdminAdvertisement[]>>(
      API_ENDPOINTS.ADMIN_CMS.ADVERTISEMENTS,
    );
    return data.data ?? [];
  },

  createAd: async (
    payload: Partial<AdminAdvertisement> & {
      title: string;
      brandName: string;
      imageUrl: string;
    },
  ) => {
    const { data } = await api.post<ApiResponse<AdminAdvertisement>>(
      API_ENDPOINTS.ADMIN_CMS.ADVERTISEMENTS,
      {
        ...payload,
        slug: payload.slug || slugify(payload.title),
      },
    );
    return data.data;
  },

  updateAd: async (id: string, payload: Partial<AdminAdvertisement>) => {
    const { data } = await api.patch<ApiResponse<AdminAdvertisement>>(
      API_ENDPOINTS.ADMIN_CMS.ADVERTISEMENT_BY_ID(id),
      payload,
    );
    return data.data;
  },

  removeAd: async (id: string) => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.ADVERTISEMENT_BY_ID(id));
  },

  activateAd: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminAdvertisement>>(
      API_ENDPOINTS.ADMIN_CMS.ADVERTISEMENT_ACTIVATE(id),
    );
    return data.data;
  },

  deactivateAd: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminAdvertisement>>(
      API_ENDPOINTS.ADMIN_CMS.ADVERTISEMENT_DEACTIVATE(id),
    );
    return data.data;
  },

  listHomeSections: async (): Promise<AdminHomeSection[]> => {
    const { data } = await api.get<ApiResponse<AdminHomeSection[]>>(
      API_ENDPOINTS.ADMIN_CMS.HOME_SECTIONS,
    );
    return data.data ?? [];
  },

  updateHomeSection: async (id: string, payload: Partial<AdminHomeSection>) => {
    const { data } = await api.patch<ApiResponse<AdminHomeSection>>(
      API_ENDPOINTS.ADMIN_CMS.HOME_SECTION_BY_ID(id),
      payload,
    );
    return data.data;
  },

  toggleHomeSection: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminHomeSection>>(
      API_ENDPOINTS.ADMIN_CMS.HOME_SECTION_TOGGLE(id),
    );
    return data.data;
  },

  reorderHomeSections: async (
    items: Array<{ id: string; displayOrder: number }>,
  ) => {
    await api.post(API_ENDPOINTS.ADMIN_CMS.HOME_SECTIONS_REORDER, { items });
  },

  listPromotionalCards: async (
    cardType?: string,
  ): Promise<AdminPromotionalCard[]> => {
    const { data } = await api.get<ApiResponse<AdminPromotionalCard[]>>(
      API_ENDPOINTS.ADMIN_CMS.PROMOTIONAL_CARDS,
      { params: cardType ? { cardType } : undefined },
    );
    return data.data ?? [];
  },

  createPromotionalCard: async (
    payload: Partial<AdminPromotionalCard> & {
      title: string;
      cardType: string;
    },
  ) => {
    const { data } = await api.post<ApiResponse<AdminPromotionalCard>>(
      API_ENDPOINTS.ADMIN_CMS.PROMOTIONAL_CARDS,
      {
        ...payload,
        slug: payload.slug || slugify(payload.title),
      },
    );
    return data.data;
  },

  updatePromotionalCard: async (
    id: string,
    payload: Partial<AdminPromotionalCard>,
  ) => {
    const { data } = await api.patch<ApiResponse<AdminPromotionalCard>>(
      API_ENDPOINTS.ADMIN_CMS.PROMOTIONAL_CARD_BY_ID(id),
      payload,
    );
    return data.data;
  },

  removePromotionalCard: async (id: string) => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.PROMOTIONAL_CARD_BY_ID(id));
  },

  activatePromotionalCard: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminPromotionalCard>>(
      API_ENDPOINTS.ADMIN_CMS.PROMOTIONAL_CARD_ACTIVATE(id),
    );
    return data.data;
  },

  deactivatePromotionalCard: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminPromotionalCard>>(
      API_ENDPOINTS.ADMIN_CMS.PROMOTIONAL_CARD_DEACTIVATE(id),
    );
    return data.data;
  },

  listQuickActions: async (): Promise<AdminQuickAction[]> => {
    const { data } = await api.get<ApiResponse<AdminQuickAction[]>>(
      API_ENDPOINTS.ADMIN_CMS.QUICK_ACTIONS,
    );
    return data.data ?? [];
  },

  createQuickAction: async (
    payload: Partial<AdminQuickAction> & { label: string },
  ) => {
    const { data } = await api.post<ApiResponse<AdminQuickAction>>(
      API_ENDPOINTS.ADMIN_CMS.QUICK_ACTIONS,
      {
        ...payload,
        slug: payload.slug || slugify(payload.label),
      },
    );
    return data.data;
  },

  updateQuickAction: async (id: string, payload: Partial<AdminQuickAction>) => {
    const { data } = await api.patch<ApiResponse<AdminQuickAction>>(
      API_ENDPOINTS.ADMIN_CMS.QUICK_ACTION_BY_ID(id),
      payload,
    );
    return data.data;
  },

  removeQuickAction: async (id: string) => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.QUICK_ACTION_BY_ID(id));
  },

  reorderQuickActions: async (
    items: Array<{ id: string; displayOrder: number }>,
  ) => {
    await api.post(API_ENDPOINTS.ADMIN_CMS.QUICK_ACTIONS_REORDER, { items });
  },
};
