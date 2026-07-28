import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { BackendAdminOrder } from "@/features/customer-executive/utils/map-backend-order";

export type AdminOrderBucket =
  "pending" | "accepted" | "dispatch" | "completed" | "delivered" | "cancelled";

export interface AdminOrderListParams extends PaginationParams {
  bucket?: AdminOrderBucket;
  status?: string;
  customerId?: string;
  hubId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface AdminOrderTimelineEntry {
  id?: string;
  status?: string;
  statusLabel?: string;
  message?: string;
  remarks?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedByRole?: string;
}

export interface AdminOrderTracking {
  currentStatus?: string;
  statusLabel?: string;
  hub?: { id?: string; name?: string; code?: string } | null;
  driver?: {
    id?: string;
    name?: string;
    phone?: string;
    vehicle?: string | null;
  } | null;
  lastUpdated?: string | null;
  expectedDelivery?: string | null;
  orderAgeHours?: number | null;
}

export const adminOrdersService = {
  list: async (
    params?: AdminOrderListParams,
  ): Promise<PaginatedResponse<BackendAdminOrder>> => {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<BackendAdminOrder>>
    >(API_ENDPOINTS.ADMIN_ORDERS.BASE, { params });
    return data.data;
  },

  getById: async (id: string): Promise<BackendAdminOrder> => {
    const { data } = await api.get<ApiResponse<BackendAdminOrder>>(
      API_ENDPOINTS.ADMIN_ORDERS.BY_ID(id),
    );
    return data.data;
  },

  timeline: async (id: string): Promise<AdminOrderTimelineEntry[]> => {
    const { data } = await api.get<ApiResponse<AdminOrderTimelineEntry[]>>(
      API_ENDPOINTS.ADMIN_ORDERS.TIMELINE(id),
    );
    return data.data;
  },

  tracking: async (id: string): Promise<AdminOrderTracking> => {
    const { data } = await api.get<ApiResponse<AdminOrderTracking>>(
      API_ENDPOINTS.ADMIN_ORDERS.TRACKING(id),
    );
    return data.data;
  },

  updateStatus: async (
    id: string,
    payload: { status: string; remarks?: string },
  ): Promise<BackendAdminOrder> => {
    const { data } = await api.patch<ApiResponse<BackendAdminOrder>>(
      API_ENDPOINTS.ADMIN_ORDERS.STATUS(id),
      payload,
    );
    return data.data;
  },

  assignDriver: async (
    id: string,
    payload: {
      driverId: string;
      vehicleId?: string;
      expectedDeliveryAt?: string;
    },
  ): Promise<BackendAdminOrder> => {
    const { data } = await api.patch<ApiResponse<BackendAdminOrder>>(
      API_ENDPOINTS.ADMIN_ORDERS.ASSIGN_DRIVER(id),
      payload,
    );
    return data.data;
  },

  getInvoice: async (id: string): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.ADMIN_ORDERS.INVOICE(id),
    );
    return data.data;
  },

  invoicePdf: async (id: string): Promise<{ blob: Blob; filename: string }> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_ORDERS.INVOICE_PDF(id), {
      responseType: "blob",
    });
    const disposition = String(response.headers["content-disposition"] ?? "");
    const match = /filename="?([^"]+)"?/i.exec(disposition);
    const filename = match?.[1] ?? `invoice-${id}.pdf`;
    return { blob: response.data as Blob, filename };
  },
};

export async function downloadAdminOrderInvoicePdf(
  orderId: string,
): Promise<void> {
  const { blob, filename } = await adminOrdersService.invoicePdf(orderId);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
