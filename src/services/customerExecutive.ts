import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";

export interface CeDashboardStats {
  todayOrders: number;
  pendingOrders: number;
  pendingPayments: number;
  emergencyOrders: number;
  bulkEnquiries: number;
  customerIssues: number;
  customersHelped: number;
}

export const customerExecutiveService = {
  getDashboard: async (): Promise<CeDashboardStats> => {
    const { data } = await api.get<ApiResponse<CeDashboardStats>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.DASHBOARD,
    );
    return data.data;
  },

  getCustomers: async (
    params?: PaginationParams & { q?: string },
  ): Promise<PaginatedResponse<unknown>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMERS,
      { params },
    );
    return data.data;
  },

  searchCustomers: async (
    params?: PaginationParams & { q?: string },
  ): Promise<PaginatedResponse<unknown>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_SEARCH,
      { params },
    );
    return data.data;
  },

  getCustomerById: async (id: string): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_BY_ID(id),
    );
    return data.data;
  },

  updateCustomerNote: async (id: string, note: string): Promise<unknown> => {
    const { data } = await api.patch<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_NOTE(id),
      { note },
    );
    return data.data;
  },

  getOrders: async (
    params?: PaginationParams & { customerId?: string },
  ): Promise<PaginatedResponse<unknown>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDERS,
      { params },
    );
    return data.data;
  },

  getOrderById: async (id: string): Promise<unknown> => {
    const { data } = await api.get<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDER_BY_ID(id),
    );
    return data.data;
  },

  createOrder: async (payload: unknown): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDERS,
      payload,
    );
    return data.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<unknown> => {
    const { data } = await api.patch<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDER_CANCEL(id),
      { reason },
    );
    return data.data;
  },

  sendPaymentLink: async (
    orderId: string,
    message?: string,
  ): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.PAYMENT_SEND_LINK,
      { orderId, message },
    );
    return data.data;
  },

  getTickets: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<unknown>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.TICKETS,
      { params },
    );
    return data.data;
  },

  createTicket: async (payload: unknown): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.TICKETS,
      payload,
    );
    return data.data;
  },
};
