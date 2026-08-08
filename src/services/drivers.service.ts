import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import {
  mapApiDriverToLogistics,
  type ApiDriver,
} from "@/features/logistics/utils/driver-api.mapper";
import type { LogisticsDriver } from "@/types/logistics.types";

export interface DriverListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hubId?: string;
  warehouseHubId?: string;
  vehicleAssigned?: "yes" | "no";
  licenseExpiry?: "expired" | "expiring_soon" | "valid";
  includeInactive?: boolean;
}

export interface DriverStats {
  total: number;
  available: number;
  onTrip: number;
  onLeave: number;
  inactive: number;
  assigned?: number;
  blocked?: number;
}

export interface DriverCreatePayload {
  hubId: string;
  warehouseHubId?: string | null;
  name: string;
  phone: string;
  employeeId?: string;
  alternatePhone?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseExpiry?: string;
  licenseType?: string;
  licenseIssuingState?: string;
  joiningDate?: string;
  employmentType?: string;
  shift?: string;
  onLeave?: boolean;
  aadhaarNumber?: string;
  panNumber?: string;
  bankAccountHolder?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  upiId?: string;
  remarks?: string;
  vehicleId?: string | null;
  isActive?: boolean;
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

export const driversService = {
  async list(params: DriverListParams = {}): Promise<{
    drivers: LogisticsDriver[];
    meta: { page: number; limit: number; total: number; totalPages: number };
    raw: ApiDriver[];
  }> {
    const res = await api.get<
      ApiResponse<{
        data: ApiDriver[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      }>
    >(API_ENDPOINTS.ADMIN_DRIVERS.BASE, { params });
    const payload = res.data.data;
    const raw = payload.data ?? [];
    return {
      drivers: raw.map(mapApiDriverToLogistics),
      meta: payload.meta,
      raw,
    };
  },

  async stats(params?: {
    hubId?: string;
    warehouseHubId?: string;
  }): Promise<DriverStats> {
    return unwrap(
      api.get<ApiResponse<DriverStats>>(API_ENDPOINTS.ADMIN_DRIVERS.STATS, {
        params,
      }),
    );
  },

  async getById(id: string): Promise<LogisticsDriver> {
    const data = await unwrap(
      api.get<ApiResponse<ApiDriver>>(API_ENDPOINTS.ADMIN_DRIVERS.BY_ID(id)),
    );
    return mapApiDriverToLogistics(data);
  },

  async create(payload: DriverCreatePayload): Promise<LogisticsDriver> {
    const data = await unwrap(
      api.post<ApiResponse<ApiDriver>>(
        API_ENDPOINTS.ADMIN_DRIVERS.BASE,
        payload,
      ),
    );
    return mapApiDriverToLogistics(data);
  },

  async update(
    id: string,
    payload: Partial<DriverCreatePayload>,
  ): Promise<LogisticsDriver> {
    const data = await unwrap(
      api.patch<ApiResponse<ApiDriver>>(
        API_ENDPOINTS.ADMIN_DRIVERS.BY_ID(id),
        payload,
      ),
    );
    return mapApiDriverToLogistics(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.ADMIN_DRIVERS.BY_ID(id));
  },

  async assignVehicle(id: string, vehicleId: string | null) {
    return unwrap(
      api.patch<ApiResponse<ApiDriver>>(
        API_ENDPOINTS.ADMIN_DRIVERS.VEHICLE(id),
        { vehicleId },
      ),
    ).then(mapApiDriverToLogistics);
  },

  async createDocumentUploadUrl(
    driverId: string,
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
      >(API_ENDPOINTS.ADMIN_DRIVERS.DOCUMENT_UPLOAD_URL(driverId), body),
    );
  },

  async confirmDocument(
    driverId: string,
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
      api.post(API_ENDPOINTS.ADMIN_DRIVERS.DOCUMENTS(driverId), body),
    );
  },

  async uploadDocumentFile(
    driverId: string,
    documentType: string,
    file: File,
    expiryDate?: string,
  ) {
    const { uploadUrl, storageKey, headers } =
      await this.createDocumentUploadUrl(driverId, {
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

    return this.confirmDocument(driverId, {
      documentType,
      storageKey,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      expiryDate,
    });
  },
};
