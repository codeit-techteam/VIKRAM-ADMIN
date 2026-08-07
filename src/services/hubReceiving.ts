import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export type HubReceivingQueueStatus = "awaiting_receipt" | "received";

export interface HubReceivingMaterial {
  id: string;
  productId: string;
  productName: string;
  sku?: string | null;
  unit: string;
  dispatchedQty: number;
  receivedQty: number | null;
  difference: number | null;
  shortageQty?: number;
  damageQty?: number;
  missingQty?: number;
  remarks?: string | null;
  status: string;
}

export interface HubReceivingPhoto {
  id: string;
  url: string;
  name?: string;
  size?: string;
  uploadedAt?: string;
}

export interface HubReceivingDocument {
  id: string;
  url: string;
  name: string;
  type: string;
  size: string;
  uploadedAt?: string;
}

export interface HubReceivingItem {
  id: string;
  transferId: string;
  requisitionId: string;
  dispatchId: string;
  hubId: string;
  hubName: string;
  warehouseName: string;
  vehicle: string;
  driverName: string;
  driverPhone?: string | null;
  eta?: string | null;
  dispatchDate?: string | null;
  arrivedAt?: string | null;
  receivedAt?: string | null;
  receivedBy?: string | null;
  rawStatus: string;
  queueStatus: HubReceivingQueueStatus;
  priority?: string;
  materialSummary: string;
  quantitySummary: string;
  hasProof: boolean;
  photoCount: number;
  documentCount: number;
  materials: HubReceivingMaterial[];
  photos: HubReceivingPhoto[];
  documents: HubReceivingDocument[];
  timeline?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    timestamp: string;
    status: "completed" | "active" | "pending";
  }>;
  activityLogs?: Array<{
    id: string;
    who: string;
    action: string;
    role: string;
    at: string;
  }>;
}

export interface HubReceivingSummary {
  awaitingReceipt: number;
  receivedToday: number;
  pendingVerification: number;
  completed: number;
  rejected: number;
}

export interface HubReceivingListResponse {
  summary: HubReceivingSummary;
  items: HubReceivingItem[];
}

export const hubReceivingService = {
  async list(params?: {
    search?: string;
    status?: string;
  }): Promise<HubReceivingListResponse> {
    const { data } = await api.get<ApiResponse<HubReceivingListResponse>>(
      "/admin/hub-receiving",
      { params },
    );
    return data.data;
  },

  async getById(id: string): Promise<HubReceivingItem> {
    const { data } = await api.get<ApiResponse<HubReceivingItem>>(
      `/admin/hub-receiving/${encodeURIComponent(id)}`,
    );
    return data.data;
  },
};
