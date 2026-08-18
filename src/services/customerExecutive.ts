import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  SupportTicketReason,
} from "@/features/customer-executive/utils/map-api";

export interface CeApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CePaginatedResult<T> {
  data: T[];
  meta: CeApiPaginationMeta;
}

export interface CeDashboardApiResponse {
  assignedCustomers: number;
  openComplaints: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  avgResolutionHours: number;
  recentActivities?: Record<string, unknown>[];
}

export interface CeLookupResponse {
  exists: boolean;
  customer?: Record<string, unknown> & {
    assignedToOtherExecutive?: boolean;
  };
}

export interface CeOtpSendResponse {
  expiresIn?: number;
  otp?: string;
}

export interface CeVerifyOtpResponse {
  verificationToken: string;
}

export interface CeRegisterCustomerPayload {
  phone: string;
  verificationToken: string;
  fullName: string;
  email?: string;
  companyName?: string;
  customerType?: string;
  gstNumber?: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

export interface CeCreateOrderPayload {
  customerId: string;
  addressId?: string;
  items?: Array<{ productId: string; quantity: number; variantId?: string }>;
  paymentMethod?: "CASH" | "MANUAL";
  notes?: string;
  deliveryAddress?: string;
  deliveryPincode?: string;
  deliveryCity?: string;
  deliveryState?: string;
}

export interface CeCreateTicketPayload {
  customerId: string;
  orderId?: string;
  reason: SupportTicketReason;
  subject?: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface CeUpdateTicketPayload {
  status?: string;
  priority?: string;
  resolution?: string;
  note?: string;
}

export interface CeCustomersQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  city?: string;
  customerType?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CeOrdersQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  orderSource?: string;
  customerId?: string;
  unassigned?: boolean;
}

export interface CePaymentsQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  linkStatus?: string;
}

export interface CeTicketsQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  priority?: string;
}

export interface CeSendPaymentLinkResponse {
  orderId: string;
  orderNumber: string;
  paymentUrl: string;
  paymentLinkId?: string;
  sent: boolean;
}

function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

export const customerExecutiveService = {
  getDashboard: async (): Promise<CeDashboardApiResponse> => {
    const { data } = await api.get<ApiResponse<CeDashboardApiResponse>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.DASHBOARD,
    );
    return unwrap(data);
  },

  getActivity: async (limit = 20): Promise<Record<string, unknown>[]> => {
    const { data } = await api.get<
      ApiResponse<{ data: Record<string, unknown>[] } | Record<string, unknown>[]>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.ACTIVITY, { params: { limit } });
    const payload = unwrap(data);
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  lookupCustomer: async (phone: string): Promise<CeLookupResponse> => {
    const { data } = await api.post<ApiResponse<CeLookupResponse>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_LOOKUP,
      { phone },
    );
    return unwrap(data);
  },

  sendOtp: async (phone: string): Promise<CeOtpSendResponse> => {
    const { data } = await api.post<ApiResponse<CeOtpSendResponse>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_SEND_OTP,
      { phone },
    );
    return unwrap(data);
  },

  verifyOtp: async (
    phone: string,
    otp: string,
  ): Promise<CeVerifyOtpResponse> => {
    const { data } = await api.post<ApiResponse<CeVerifyOtpResponse>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_VERIFY_OTP,
      { phone, otp },
    );
    return unwrap(data);
  },

  registerCustomer: async (
    payload: CeRegisterCustomerPayload,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMERS,
      payload,
    );
    return unwrap(data);
  },

  getCustomers: async (
    params?: CeCustomersQuery,
  ): Promise<CePaginatedResult<Record<string, unknown>>> => {
    const { data } = await api.get<
      ApiResponse<CePaginatedResult<Record<string, unknown>>>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMERS, { params });
    return unwrap(data);
  },

  searchCustomers: async (
    params?: CeCustomersQuery,
  ): Promise<CePaginatedResult<Record<string, unknown>>> => {
    const { data } = await api.get<
      ApiResponse<CePaginatedResult<Record<string, unknown>>>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_SEARCH, { params });
    return unwrap(data);
  },

  getCustomerById: async (id: string): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_BY_ID(id),
    );
    return unwrap(data);
  },

  getCustomerLoyalty: async (
    id: string,
  ): Promise<{
    availablePoints: number;
    availableValue: number;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
    redeemablePoints: number;
    currentPoints: number;
    redeemedPoints: number;
    tier: string;
    pointValueInr: number;
    firstOrderBonusClaimed?: boolean;
    freeBikeDeliveriesUsed?: number;
    freeBikeDeliveriesAllowed?: number;
    freeBikeDeliveriesRemaining?: number;
  }> => {
    const { data } = await api.get<
      ApiResponse<{
        availablePoints: number;
        availableValue: number;
        lifetimeEarned: number;
        lifetimeRedeemed: number;
        redeemablePoints: number;
        currentPoints: number;
        redeemedPoints: number;
        tier: string;
        pointValueInr: number;
        firstOrderBonusClaimed?: boolean;
        freeBikeDeliveriesUsed?: number;
        freeBikeDeliveriesAllowed?: number;
        freeBikeDeliveriesRemaining?: number;
      }>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_LOYALTY(id));
    return unwrap(data);
  },

  updateCustomerNote: async (id: string, note: string): Promise<unknown> => {
    const { data } = await api.patch<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.CUSTOMER_NOTE(id),
      { note },
    );
    return unwrap(data);
  },

  getOrders: async (
    params?: CeOrdersQuery,
  ): Promise<CePaginatedResult<Record<string, unknown>>> => {
    const { data } = await api.get<
      ApiResponse<CePaginatedResult<Record<string, unknown>>>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDERS, { params });
    return unwrap(data);
  },

  getOrderById: async (id: string): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDER_BY_ID(id),
    );
    return unwrap(data);
  },

  createOrder: async (
    payload: CeCreateOrderPayload,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDERS,
      payload,
    );
    return unwrap(data);
  },

  cancelOrder: async (id: string, reason?: string): Promise<unknown> => {
    const { data } = await api.patch<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.ORDER_CANCEL(id),
      { reason },
    );
    return unwrap(data);
  },

  getPayments: async (
    params?: CePaymentsQuery,
  ): Promise<CePaginatedResult<Record<string, unknown>>> => {
    const { data } = await api.get<
      ApiResponse<CePaginatedResult<Record<string, unknown>>>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.PAYMENTS, { params });
    return unwrap(data);
  },

  sendPaymentLink: async (
    orderId: string,
    message?: string,
  ): Promise<CeSendPaymentLinkResponse> => {
    const { data } = await api.post<ApiResponse<CeSendPaymentLinkResponse>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.PAYMENT_SEND_LINK,
      { orderId, message },
    );
    return unwrap(data);
  },

  sendPaymentReminder: async (orderId: string): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.PAYMENT_REMINDER,
      { orderId },
    );
    return unwrap(data);
  },

  searchTracking: async (
    q: string,
  ): Promise<Record<string, unknown>[]> => {
    const { data } = await api.get<
      ApiResponse<{ data: Record<string, unknown>[] }>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.TRACKING_SEARCH, { params: { q } });
    const payload = unwrap(data);
    return payload.data ?? [];
  },

  getTickets: async (
    params?: CeTicketsQuery,
  ): Promise<CePaginatedResult<Record<string, unknown>>> => {
    const { data } = await api.get<
      ApiResponse<CePaginatedResult<Record<string, unknown>>>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.TICKETS, { params });
    return unwrap(data);
  },

  getTicketById: async (id: string): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.TICKET_BY_ID(id),
    );
    return unwrap(data);
  },

  createTicket: async (
    payload: CeCreateTicketPayload,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.TICKETS,
      payload,
    );
    return unwrap(data);
  },

  updateTicket: async (
    id: string,
    payload: CeUpdateTicketPayload,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.TICKET_BY_ID(id),
      payload,
    );
    return unwrap(data);
  },

  getExpertCallbacks: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }): Promise<
    CePaginatedResult<Record<string, unknown>> & {
      stats?: {
        total: number;
        new: number;
        contacted: number;
        closed: number;
      };
    }
  > => {
    const { data } = await api.get<
      ApiResponse<
        CePaginatedResult<Record<string, unknown>> & {
          stats?: {
            total: number;
            new: number;
            contacted: number;
            closed: number;
          };
        }
      >
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.EXPERT_CALLBACKS, { params });
    return unwrap(data);
  },

  getExpertCallbackById: async (
    id: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.EXPERT_CALLBACK_BY_ID(id),
    );
    return unwrap(data);
  },

  updateExpertCallback: async (
    id: string,
    payload: { status?: string; executiveNotes?: string },
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.EXPERT_CALLBACK_BY_ID(id),
      payload,
    );
    return unwrap(data);
  },

  getBulkEnquiries: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    q?: string;
    status?: string;
    materialCategorySlug?: string;
    deliveryRequirement?: string;
    assignedExecutiveId?: string;
    city?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CePaginatedResult<Record<string, unknown>>> => {
    const { data } = await api.get<
      ApiResponse<CePaginatedResult<Record<string, unknown>>>
    >(API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK, { params });
    return unwrap(data);
  },

  getBulkStats: async (params?: {
    assignedExecutiveId?: string;
    city?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_STATS,
      { params },
    );
    return unwrap(data);
  },

  getBulkEnquiryById: async (
    id: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_BY_ID(id),
    );
    return unwrap(data);
  },

  updateBulkStatus: async (
    id: string,
    status: string,
    remarks?: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_STATUS(id),
      { status, remarks },
    );
    return unwrap(data);
  },

  assignBulkEnquiry: async (
    id: string,
    payload: { executiveId?: string; assignedExecutive?: string },
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_ASSIGN(id),
      payload,
    );
    return unwrap(data);
  },

  addBulkFollowUp: async (
    id: string,
    payload: { followUpAt: string; note: string },
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_FOLLOW_UPS(id),
      payload,
    );
    return unwrap(data);
  },

  updateBulkFollowUpStatus: async (
    id: string,
    followUpId: string,
    status: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_FOLLOW_UP(id, followUpId),
      { status },
    );
    return unwrap(data);
  },

  addBulkNote: async (
    id: string,
    note: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_NOTES(id),
      { note },
    );
    return unwrap(data);
  },

  createBulkQuotation: async (
    id: string,
    payload: {
      materialLabel: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      deliveryCharge?: number;
      gstPercent?: number;
      discountAmount?: number;
      productId?: string;
      notes?: string;
      validUntil?: string;
    },
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_QUOTATIONS(id),
      payload,
    );
    return unwrap(data);
  },

  updateBulkQuotationStatus: async (
    id: string,
    quotationId: string,
    status: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_QUOTATION_STATUS(id, quotationId),
      { status },
    );
    return unwrap(data);
  },

  convertBulkEnquiry: async (
    id: string,
    payload?: {
      productId?: string;
      addressId?: string;
      quotationId?: string;
    },
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_CONVERT(id),
      payload ?? {},
    );
    return unwrap(data);
  },

  rejectBulkEnquiry: async (
    id: string,
    remarks?: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_REJECT(id),
      { remarks },
    );
    return unwrap(data);
  },

  cancelBulkEnquiry: async (
    id: string,
    remarks?: string,
  ): Promise<Record<string, unknown>> => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.CUSTOMER_EXECUTIVE.BULK_CANCEL(id),
      { remarks },
    );
    return unwrap(data);
  },
};
