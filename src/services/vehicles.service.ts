import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import {
  mapApiVehicleToLogistics,
  type ApiVehicle,
} from "@/features/logistics/utils/vehicle-api.mapper";
import type { LogisticsVehicle } from "@/types/logistics.types";

export interface VehicleListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hubId?: string;
  warehouseHubId?: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  running: number;
  maintenance: number;
  inactive: number;
  blocked?: number;
}

export interface VehicleCreatePayload {
  registration: string;
  hubId: string;
  warehouseHubId?: string | null;
  capacity?: number;
  payloadKg?: number;
  vehicleType?: string;
  vehicleCategory?: string;
  fuelType?: string;
  manufacturer?: string;
  model?: string;
  manufactureYear?: number;
  vehicleColor?: string;
  fastagNumber?: string;
  odometerKm?: number;
  emergencyContact?: string;
  remarks?: string;
  registrationDate?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  fitnessCertificateNumber?: string;
  fitnessExpiry?: string;
  pucNumber?: string;
  pucExpiry?: string;
  permitType?: string;
  permitNumber?: string;
  permitExpiry?: string;
  roadTaxStatus?: string;
  roadTaxExpiry?: string;
  status?: string;
  assignedDriverId?: string | null;
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

export const vehiclesService = {
  async list(params: VehicleListParams = {}): Promise<{
    vehicles: LogisticsVehicle[];
    meta: { page: number; limit: number; total: number; totalPages: number };
    raw: ApiVehicle[];
  }> {
    const res = await api.get<
      ApiResponse<{
        data: ApiVehicle[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      }>
    >(API_ENDPOINTS.ADMIN_VEHICLES.BASE, { params });
    const payload = res.data.data;
    const raw = payload.data ?? [];
    return {
      vehicles: raw.map(mapApiVehicleToLogistics),
      meta: payload.meta,
      raw,
    };
  },

  async stats(params?: {
    hubId?: string;
    warehouseHubId?: string;
  }): Promise<VehicleStats> {
    return unwrap(
      api.get<ApiResponse<VehicleStats>>(API_ENDPOINTS.ADMIN_VEHICLES.STATS, {
        params,
      }),
    );
  },

  async getById(id: string): Promise<LogisticsVehicle> {
    const data = await unwrap(
      api.get<ApiResponse<ApiVehicle>>(API_ENDPOINTS.ADMIN_VEHICLES.BY_ID(id)),
    );
    return mapApiVehicleToLogistics(data);
  },

  async create(payload: VehicleCreatePayload): Promise<LogisticsVehicle> {
    const data = await unwrap(
      api.post<ApiResponse<ApiVehicle>>(
        API_ENDPOINTS.ADMIN_VEHICLES.BASE,
        payload,
      ),
    );
    return mapApiVehicleToLogistics(data);
  },

  async update(
    id: string,
    payload: Partial<VehicleCreatePayload> & { isActive?: boolean },
  ): Promise<LogisticsVehicle> {
    const data = await unwrap(
      api.patch<ApiResponse<ApiVehicle>>(
        API_ENDPOINTS.ADMIN_VEHICLES.BY_ID(id),
        payload,
      ),
    );
    return mapApiVehicleToLogistics(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.ADMIN_VEHICLES.BY_ID(id));
  },

  async updateStatus(
    id: string,
    payload: {
      status: string;
      reason?: string;
      maintenanceReason?: string;
      maintenanceExpectedAt?: string;
    },
  ) {
    return unwrap(
      api.patch<ApiResponse<ApiVehicle>>(
        API_ENDPOINTS.ADMIN_VEHICLES.STATUS(id),
        payload,
      ),
    );
  },

  async createDocumentUploadUrl(
    vehicleId: string,
    body: {
      documentType: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
    },
  ) {
    return unwrap(
      api.post<
        ApiResponse<{
          uploadUrl: string;
          storageKey: string;
          headers: Record<string, string>;
        }>
      >(API_ENDPOINTS.ADMIN_VEHICLES.DOCUMENT_UPLOAD_URL(vehicleId), body),
    );
  },

  async confirmDocument(
    vehicleId: string,
    body: {
      documentType: string;
      storageKey: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      expiryDate?: string;
    },
  ) {
    return unwrap(
      api.post(
        API_ENDPOINTS.ADMIN_VEHICLES.DOCUMENTS(vehicleId),
        body,
      ),
    );
  },

  async uploadDocumentFile(
    vehicleId: string,
    documentType: string,
    file: File,
    expiryDate?: string,
  ) {
    const { uploadUrl, storageKey, headers } =
      await this.createDocumentUploadUrl(vehicleId, {
        documentType,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        ...headers,
      },
      body: file,
    });

    return this.confirmDocument(vehicleId, {
      documentType,
      storageKey,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      expiryDate,
    });
  },
};

export type { PaginatedResponse };
