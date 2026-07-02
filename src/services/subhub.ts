import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";

export const subhubService = {
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<unknown>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
      API_ENDPOINTS.SUBHUB.BASE,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.SUBHUB.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: unknown): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>(
      API_ENDPOINTS.SUBHUB.BASE,
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: unknown): Promise<unknown> => {
    const { data } = await api.put<ApiResponse<unknown>>(
      API_ENDPOINTS.SUBHUB.BY_ID(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.SUBHUB.BY_ID(id));
  },
};
