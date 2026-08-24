import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import { hubsService } from "@/services/hubs.service";

/** @deprecated Prefer hubsService — kept for compatibility */
export const subhubService = {
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<unknown>> => {
    return hubsService.list(params);
  },

  getById: async (id: string): Promise<unknown> => {
    return hubsService.getById(id);
  },

  create: async (payload: unknown): Promise<unknown> => {
    return hubsService.create(payload);
  },

  update: async (id: string, payload: unknown): Promise<unknown> => {
    return hubsService.update(id, payload);
  },

  delete: async (id: string): Promise<void> => {
    await hubsService.delete(id);
  },

  provision: hubsService.provision,
};
