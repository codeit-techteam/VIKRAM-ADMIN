import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  computeTestimonialStats,
  type CustomerTestimonial,
  type TestimonialDashboardStats,
  type TestimonialStatus,
  type TestimonialType,
} from "@/features/testimonials/types/testimonial.types";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface AdminTestimonial {
  id: string;
  type: "VIDEO" | "IMAGE" | "TEXT" | string;
  videoUrl?: string | null;
  thumbnail?: string | null;
  imageUrl?: string | null;
  profileImage?: string | null;
  customerName: string;
  designation?: string | null;
  company?: string | null;
  location?: string | null;
  city?: string | null;
  rating: number;
  review?: string | null;
  sortOrder: number;
  featured?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminTestimonialInput {
  type: string;
  customerName: string;
  designation?: string;
  location?: string;
  videoUrl?: string;
  thumbnail?: string;
  imageUrl?: string;
  review?: string;
  rating?: number;
  sortOrder?: number;
}

export interface UpdateAdminTestimonialInput {
  customerName?: string;
  designation?: string;
  location?: string;
  videoUrl?: string;
  thumbnail?: string;
  imageUrl?: string;
  review?: string;
  rating?: number;
  sortOrder?: number;
}

/** UI create/update shape used by TestimonialsPageContent */
export interface CreateTestimonialPayload {
  type: TestimonialType;
  customerName: string;
  location: string;
  city: string;
  rating: number;
  review: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  status: TestimonialStatus;
}

function splitLocationCity(location?: string | null, city?: string | null) {
  if (city?.trim()) {
    return { location: location?.trim() || "", city: city.trim() };
  }
  if (!location?.trim()) {
    return { location: "", city: "" };
  }
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      location: parts.slice(0, -1).join(", "),
      city: parts[parts.length - 1] ?? "",
    };
  }
  return { location: location.trim(), city: "" };
}

function combinedLocation(location: string, city: string): string | undefined {
  const parts = [location.trim(), city.trim()].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

export function toUiTestimonial(t: AdminTestimonial): CustomerTestimonial {
  const { location, city } = splitLocationCity(t.location, t.city);
  const mediaUrl =
    t.type === "VIDEO"
      ? t.videoUrl || t.imageUrl || ""
      : t.imageUrl || t.videoUrl || "";

  return {
    id: t.id,
    type: t.type === "VIDEO" ? "VIDEO" : "IMAGE",
    status: t.isPublished ? "PUBLISHED" : "DRAFT",
    customerName: t.customerName,
    location,
    city,
    rating: t.rating ?? 5,
    review: t.review ?? "",
    mediaUrl,
    thumbnailUrl: t.thumbnail ?? undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    publishedAt: t.isPublished ? t.updatedAt : undefined,
    createdBy: "Admin",
    sortOrder: t.sortOrder,
  };
}

function toCreateDto(
  payload: CreateTestimonialPayload,
): CreateAdminTestimonialInput {
  const location = combinedLocation(payload.location, payload.city);
  const base: CreateAdminTestimonialInput = {
    type: payload.type,
    customerName: payload.customerName,
    location,
    review: payload.review,
    rating: payload.rating,
  };

  if (payload.type === "VIDEO") {
    return {
      ...base,
      videoUrl: payload.mediaUrl,
      thumbnail: payload.thumbnailUrl || undefined,
    };
  }

  return {
    ...base,
    imageUrl: payload.mediaUrl,
  };
}

function toUpdateDto(
  payload: Partial<CreateTestimonialPayload>,
): UpdateAdminTestimonialInput {
  const dto: UpdateAdminTestimonialInput = {};

  if (payload.customerName !== undefined) dto.customerName = payload.customerName;
  if (payload.review !== undefined) dto.review = payload.review;
  if (payload.rating !== undefined) dto.rating = payload.rating;
  if (payload.location !== undefined || payload.city !== undefined) {
    dto.location = combinedLocation(
      payload.location ?? "",
      payload.city ?? "",
    );
  }

  if (payload.mediaUrl !== undefined) {
    if (payload.type === "VIDEO") {
      dto.videoUrl = payload.mediaUrl;
    } else {
      dto.imageUrl = payload.mediaUrl;
    }
  }

  if (payload.thumbnailUrl !== undefined) {
    dto.thumbnail = payload.thumbnailUrl || undefined;
  }

  return dto;
}

function unwrapListPayload(
  payload:
    | AdminTestimonial[]
    | {
        data: AdminTestimonial[];
        meta?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }
    | null
    | undefined,
): {
  rows: AdminTestimonial[];
  meta: { page: number; limit: number; total: number; totalPages: number };
} {
  if (!payload) {
    return { rows: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
  if (Array.isArray(payload)) {
    return {
      rows: payload,
      meta: {
        page: 1,
        limit: payload.length,
        total: payload.length,
        totalPages: 1,
      },
    };
  }
  const rows = Array.isArray(payload.data) ? payload.data : [];
  return {
    rows,
    meta: payload.meta ?? {
      page: 1,
      limit: rows.length,
      total: rows.length,
      totalPages: 1,
    },
  };
}

export const testimonialsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{
    data: AdminTestimonial[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const { data } = await api.get<
      ApiResponse<
        | AdminTestimonial[]
        | {
            data: AdminTestimonial[];
            meta: {
              page: number;
              limit: number;
              total: number;
              totalPages: number;
            };
          }
      >
    >(API_ENDPOINTS.ADMIN_CMS.TESTIMONIALS, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        type: params?.type,
      },
    });

    const { rows, meta } = unwrapListPayload(data.data);
    return { data: rows, meta };
  },

  get: async (id: string): Promise<AdminTestimonial> => {
    const { data } = await api.get<ApiResponse<AdminTestimonial>>(
      API_ENDPOINTS.ADMIN_CMS.TESTIMONIAL_BY_ID(id),
    );
    return data.data;
  },

  create: async (
    payload: CreateAdminTestimonialInput,
  ): Promise<AdminTestimonial> => {
    const { data } = await api.post<ApiResponse<AdminTestimonial>>(
      API_ENDPOINTS.ADMIN_CMS.TESTIMONIALS,
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateAdminTestimonialInput,
  ): Promise<AdminTestimonial> => {
    const { data } = await api.patch<ApiResponse<AdminTestimonial>>(
      API_ENDPOINTS.ADMIN_CMS.TESTIMONIAL_BY_ID(id),
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.TESTIMONIAL_BY_ID(id));
  },

  publish: async (id: string): Promise<AdminTestimonial> => {
    const { data } = await api.patch<ApiResponse<AdminTestimonial>>(
      API_ENDPOINTS.ADMIN_CMS.TESTIMONIAL_PUBLISH(id),
    );
    return data.data;
  },

  unpublish: async (id: string): Promise<AdminTestimonial> => {
    const { data } = await api.patch<ApiResponse<AdminTestimonial>>(
      API_ENDPOINTS.ADMIN_CMS.TESTIMONIAL_UNPUBLISH(id),
    );
    return data.data;
  },

  reorder: async (
    items: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.ADMIN_CMS.TESTIMONIALS_REORDER, { items });
  },

  createFromUi: async (
    payload: CreateTestimonialPayload,
  ): Promise<CustomerTestimonial> => {
    const created = await testimonialsService.create(toCreateDto(payload));
    if (payload.status === "PUBLISHED") {
      const published = await testimonialsService.publish(created.id);
      return toUiTestimonial(published);
    }
    return toUiTestimonial(created);
  },

  updateFromUi: async (
    id: string,
    payload: Partial<CreateTestimonialPayload>,
    currentStatus?: TestimonialStatus,
  ): Promise<CustomerTestimonial> => {
    const dto = toUpdateDto(payload);
    const updated =
      Object.keys(dto).length > 0
        ? await testimonialsService.update(id, dto)
        : await testimonialsService.get(id);

    if (payload.status && payload.status !== currentStatus) {
      const toggled =
        payload.status === "PUBLISHED"
          ? await testimonialsService.publish(id)
          : await testimonialsService.unpublish(id);
      return toUiTestimonial(toggled);
    }

    return toUiTestimonial(updated);
  },

  listForUi: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{
    data: CustomerTestimonial[];
    total: number;
    totalPages: number;
    page: number;
  }> => {
    const { data, meta } = await testimonialsService.list(params);
    return {
      data: data.map(toUiTestimonial),
      total: meta.total,
      totalPages: Math.max(1, meta.totalPages),
      page: meta.page,
    };
  },

  getStats: async (): Promise<TestimonialDashboardStats> => {
    const { data } = await testimonialsService.list({ page: 1, limit: 200 });
    return computeTestimonialStats(data.map(toUiTestimonial));
  },
};
