import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { User } from "@/types/auth";

export const usersService = {
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>(
      API_ENDPOINTS.USERS.BASE,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: Partial<User>): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BASE,
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await api.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BY_ID(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },
};
