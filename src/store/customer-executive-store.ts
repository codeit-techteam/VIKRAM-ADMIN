"use client";

import axios from "axios";
import { create } from "zustand";

import type {
  CeActivity,
  CeComplaint,
  CeComplaintFilters,
  CeCreatePaymentLinkDraft,
  CeCustomer,
  CeCustomerFilters,
  CeDashboardStats,
  CeExecutiveProfile,
  CeNewComplaintDraft,
  CeNewCustomerDraft,
  CeNewOrderDraft,
  CeNote,
  CeNotification,
  CeOrder,
  CeOrderFilters,
  CePayment,
  CePaymentFilters,
  CeProduct,
  CeQueryParams,
  CeQueryResult,
} from "@/features/customer-executive/types";
import {
  mapApiActivity,
  mapApiComplaint,
  mapApiCustomer,
  mapApiDashboardStats,
  mapApiOrder,
  mapApiPayment,
  mapApiProduct,
  mapAuthUserToExecutive,
  mapComplaintStatusToApi,
  mapIssueTypeToReason,
  mapPaginationMeta,
  mapPaymentMethodToApi,
  type ApiPaginationMeta,
} from "@/features/customer-executive/utils/map-api";
import { mapBackendOrderToCeOrder } from "@/features/customer-executive/utils/map-backend-order";
import { customerExecutiveService } from "@/services/customerExecutive";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import type { CatalogProduct } from "@/services/catalog.service";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

function toQueryResult<T>(
  items: T[],
  meta: ApiPaginationMeta | null,
  fallbackPage: number,
): CeQueryResult<T> {
  const page = meta?.page ?? fallbackPage;
  const total = meta?.total ?? items.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(total / (meta?.limit ?? 10)));

  return { items, total, page, totalPages };
}

interface CustomerExecutiveStore {
  customers: CeCustomer[];
  orders: CeOrder[];
  payments: CePayment[];
  complaints: CeComplaint[];
  activities: CeActivity[];
  notes: CeNote[];
  notifications: CeNotification[];
  products: CeProduct[];
  currentExecutive: CeExecutiveProfile | null;

  customersMeta: ApiPaginationMeta | null;
  ordersMeta: ApiPaginationMeta | null;
  paymentsMeta: ApiPaginationMeta | null;
  complaintsMeta: ApiPaginationMeta | null;
  complaintsStats: {
    open: number;
    inProgress: number;
    resolvedToday: number;
    escalated: number;
  } | null;

  dashboardStats: CeDashboardStats | null;
  dashboardLoading: boolean;
  customersLoading: boolean;
  ordersLoading: boolean;
  paymentsLoading: boolean;
  complaintsLoading: boolean;
  bulkLoading: boolean;
  productsLoading: boolean;
  executiveLoading: boolean;

  dashboardError: string | null;
  customersError: string | null;
  ordersError: string | null;
  paymentsError: string | null;
  complaintsError: string | null;
  productsError: string | null;
  executiveError: string | null;

  loadDashboard: () => Promise<void>;
  loadCustomers: (params?: {
    page?: number;
    limit?: number;
    filters?: CeCustomerFilters;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }) => Promise<void>;
  loadCustomerById: (id: string) => Promise<CeCustomer | null>;
  loadOrders: (params?: {
    page?: number;
    limit?: number;
    filters?: CeOrderFilters;
    customerId?: string;
  }) => Promise<void>;
  loadPayments: (params?: {
    page?: number;
    limit?: number;
    filters?: CePaymentFilters;
    customerId?: string;
  }) => Promise<void>;
  loadComplaints: (params?: {
    page?: number;
    limit?: number;
    filters?: CeComplaintFilters;
    customerId?: string;
  }) => Promise<void>;
  loadProducts: (search?: string) => Promise<void>;
  loadCurrentExecutive: () => Promise<void>;
  loadActivities: (limit?: number) => Promise<void>;

  queryCustomers: (
    params: CeQueryParams<CeCustomerFilters>,
  ) => CeQueryResult<CeCustomer>;
  queryOrders: (
    params: CeQueryParams<CeOrderFilters>,
  ) => CeQueryResult<CeOrder>;
  queryPayments: (
    params: CeQueryParams<CePaymentFilters>,
  ) => CeQueryResult<CePayment>;
  queryComplaints: (
    params: CeQueryParams<CeComplaintFilters>,
  ) => CeQueryResult<CeComplaint>;

  getDashboardStats: () => CeDashboardStats;
  getCustomer: (id: string) => CeCustomer | undefined;
  getCustomerByPhone: (phone: string) => CeCustomer | undefined;
  getOrder: (id: string) => CeOrder | undefined;
  getOrderByNumber: (orderNumber: string) => CeOrder | undefined;
  getPayment: (id: string) => CePayment | undefined;
  getComplaint: (id: string) => CeComplaint | undefined;
  getCustomerOrders: (customerId: string) => CeOrder[];
  getCustomerPayments: (customerId: string) => CePayment[];
  getCustomerComplaints: (customerId: string) => CeComplaint[];
  getCustomerNotes: (customerId: string) => CeNote[];
  getCustomerActivities: (customerId: string) => CeActivity[];
  getCustomerOrderStats: (customerId: string) => {
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    totalSpent: number;
  };
  getCustomerPendingAmount: (customerId: string) => number;
  getRecentActivities: (limit?: number) => CeActivity[];
  getPendingPayments: (limit?: number) => CePayment[];

  lookupCustomer: (phone: string) => Promise<{
    exists: boolean;
    customer?: CeCustomer;
    assignedToOtherExecutive?: boolean;
  }>;
  sendOtp: (phone: string) => Promise<{ expiresIn?: number; otp?: string }>;
  verifyOtp: (
    phone: string,
    otp: string,
  ) => Promise<{ verificationToken: string }>;
  registerCustomer: (
    draft: CeNewCustomerDraft,
    verificationToken: string,
  ) => Promise<CeCustomer>;
  updateCustomer: (
    customerId: string,
    payload: {
      fullName?: string;
      email?: string;
      companyName?: string;
      gstNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
    },
  ) => Promise<CeCustomer>;
  createOrder: (draft: CeNewOrderDraft) => Promise<CeOrder>;
  sendPaymentLink: (paymentId: string) => Promise<void>;
  sendPaymentLinkByOrderId: (orderId: string) => Promise<void>;
  copyPaymentLink: (paymentId: string) => string;
  markPaymentPaid: (paymentId: string) => void;
  incrementReminder: (paymentId: string) => Promise<void>;
  addNote: (customerId: string, content: string) => Promise<CeNote>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  updateComplaintStatus: (
    complaintId: string,
    status: CeComplaint["status"],
    resolution?: string,
  ) => Promise<void>;
  addComplaintNote: (complaintId: string, content: string) => Promise<void>;
  createComplaint: (draft: CeNewComplaintDraft) => Promise<CeComplaint>;
  generatePaymentLinkForCustomer: (
    draft: CeCreatePaymentLinkDraft,
  ) => Promise<CePayment | null>;
  markNotificationRead: (notificationId: string) => void;
  searchTracking: (q: string) => Promise<CeOrder[]>;
  loadOrderDetailFromApi: (id: string) => Promise<CeOrder | null>;
  loadOrdersFromApi: () => Promise<void>;
}

export const useCustomerExecutiveStore = create<CustomerExecutiveStore>(
  (set, get) => ({
    customers: [],
    orders: [],
    payments: [],
    complaints: [],
    activities: [],
    notes: [],
    notifications: [],
    products: [],
    currentExecutive: null,

    customersMeta: null,
    ordersMeta: null,
    paymentsMeta: null,
    complaintsMeta: null,
    complaintsStats: null,

    dashboardStats: null,
    dashboardLoading: false,
    customersLoading: false,
    ordersLoading: false,
    paymentsLoading: false,
    complaintsLoading: false,
    bulkLoading: false,
    productsLoading: false,
    executiveLoading: false,

    dashboardError: null,
    customersError: null,
    ordersError: null,
    paymentsError: null,
    complaintsError: null,
    productsError: null,
    executiveError: null,

    loadDashboard: async () => {
      set({ dashboardLoading: true, dashboardError: null });
      try {
        const [dashboard, activities] = await Promise.all([
          customerExecutiveService.getDashboard(),
          customerExecutiveService.getActivity(8),
        ]);

        const stats = mapApiDashboardStats(
          dashboard as unknown as Record<string, unknown>,
        );
        const recentActivities = (
          dashboard.recentActivities?.length
            ? dashboard.recentActivities
            : activities
        ).map((item) => mapApiActivity(item));

        const pendingPaymentsResult = await customerExecutiveService.getPayments(
          { page: 1, limit: 5, status: "PENDING" },
        );

        set({
          dashboardStats: stats,
          activities: recentActivities,
          payments: pendingPaymentsResult.data.map((row) =>
            mapApiPayment(row),
          ),
          dashboardLoading: false,
          dashboardError: null,
        });
      } catch (error) {
        set({
          dashboardLoading: false,
          dashboardError: getErrorMessage(error),
        });
      }
    },

    loadCustomers: async (params) => {
      set({ customersLoading: true, customersError: null });
      try {
        const filters = params?.filters;
        const result = await customerExecutiveService.getCustomers({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          q: filters?.search || undefined,
          status:
            filters?.status && filters.status !== "ALL"
              ? filters.status
              : undefined,
          city: filters?.city && filters.city !== "ALL" ? filters.city : undefined,
          customerType:
            filters?.customerType && filters.customerType !== "ALL"
              ? filters.customerType
              : undefined,
          sortBy: params?.sortBy,
          sortDir: params?.sortDir,
          membersOnly: filters?.status === "VIP" ? true : undefined,
          activeThisMonth: filters?.activeThisMonth ? true : undefined,
        });

        const customers = result.data.map((row) => mapApiCustomer(row));

        set({
          customers,
          customersMeta: mapPaginationMeta(result.meta, params?.page, params?.limit),
          customersLoading: false,
          customersError: null,
        });
      } catch (error) {
        set({
          customersLoading: false,
          customersError: getErrorMessage(error),
        });
      }
    },

    loadCustomerById: async (id) => {
      set({ customersLoading: true, customersError: null });
      try {
        const raw = await customerExecutiveService.getCustomerById(id);
        const customer = mapApiCustomer(raw);
        const noteContent = customer.adminNotes?.trim();
        set((state) => {
          const exists = state.customers.some((c) => c.id === customer.id);
          const otherNotes = state.notes.filter(
            (note) => note.customerId !== customer.id,
          );
          return {
            customers: exists
              ? state.customers.map((c) =>
                  c.id === customer.id ? customer : c,
                )
              : [customer, ...state.customers],
            notes: noteContent
              ? [
                  {
                    id: `note-${customer.id}`,
                    customerId: customer.id,
                    content: noteContent,
                    createdAt: customer.createdAt,
                    createdBy: "Executive",
                  },
                  ...otherNotes,
                ]
              : otherNotes,
            customersLoading: false,
            customersError: null,
          };
        });
        return customer;
      } catch (error) {
        set({
          customersLoading: false,
          customersError: getErrorMessage(error),
        });
        return null;
      }
    },

    loadOrders: async (params) => {
      set({ ordersLoading: true, ordersError: null });
      try {
        const filters = params?.filters;
        const result = await customerExecutiveService.getOrders({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          q: filters?.search || undefined,
          status:
            filters?.assignment === "UNASSIGNED"
              ? undefined
              : filters?.status && filters.status !== "ALL"
                ? filters.status
                : undefined,
          orderSource:
            filters?.orderSource && filters.orderSource !== "ALL"
              ? filters.orderSource
              : undefined,
          unassigned: filters?.assignment === "UNASSIGNED" ? true : undefined,
          customerId: params?.customerId,
        });

        set({
          orders: result.data.map((row) => mapApiOrder(row)),
          ordersMeta: mapPaginationMeta(result.meta, params?.page, params?.limit),
          ordersLoading: false,
          ordersError: null,
        });
      } catch (error) {
        set({
          ordersLoading: false,
          ordersError: getErrorMessage(error),
        });
      }
    },

    loadPayments: async (params) => {
      set({ paymentsLoading: true, paymentsError: null });
      try {
        const filters = params?.filters;
        const result = await customerExecutiveService.getPayments({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          q: filters?.search || undefined,
          status:
            filters?.status && filters.status !== "ALL"
              ? filters.status
              : undefined,
          linkStatus:
            filters?.linkStatus && filters.linkStatus !== "ALL"
              ? filters.linkStatus
              : undefined,
          customerId: params?.customerId,
          dateFrom:
            filters?.dateRange && filters.dateRange !== "ALL"
              ? new Date(
                  Date.now() -
                    (filters.dateRange === "7d"
                      ? 7
                      : filters.dateRange === "30d"
                        ? 30
                        : 90) *
                      24 *
                      60 *
                      60 *
                      1000,
                ).toISOString()
              : undefined,
        });

        set({
          payments: result.data.map((row) => mapApiPayment(row)),
          paymentsMeta: mapPaginationMeta(result.meta, params?.page, params?.limit),
          paymentsLoading: false,
          paymentsError: null,
        });
      } catch (error) {
        set({
          paymentsLoading: false,
          paymentsError: getErrorMessage(error),
        });
      }
    },

    loadComplaints: async (params) => {
      set({ complaintsLoading: true, complaintsError: null });
      try {
        const filters = params?.filters;
        const result = await customerExecutiveService.getTickets({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          q: filters?.search || undefined,
          status:
            filters?.status && filters.status !== "ALL"
              ? mapComplaintStatusToApi(filters.status)
              : undefined,
          priority:
            filters?.priority && filters.priority !== "ALL"
              ? filters.priority
              : undefined,
          customerId: params?.customerId,
          reason:
            filters?.issueType && filters.issueType !== "ALL"
              ? mapIssueTypeToReason(filters.issueType)
              : undefined,
        });

        const complaints = result.data.map((row) => mapApiComplaint(row));

        set({
          complaints,
          complaintsMeta: mapPaginationMeta(result.meta, params?.page, params?.limit),
          complaintsStats: result.stats ?? null,
          complaintsLoading: false,
          complaintsError: null,
        });
      } catch (error) {
        set({
          complaintsLoading: false,
          complaintsError: getErrorMessage(error),
        });
      }
    },

    loadProducts: async (search) => {
      set({ productsLoading: true, productsError: null });
      try {
        const result = await customerExecutiveService.getProducts({
          page: 1,
          limit: 50,
          q: search?.trim() || undefined,
        });
        set({
          products: result.data.map((row) =>
            mapApiProduct(row as unknown as CatalogProduct),
          ),
          productsLoading: false,
          productsError: null,
        });
      } catch (error) {
        set({
          productsLoading: false,
          productsError: getErrorMessage(error),
        });
      }
    },

    loadCurrentExecutive: async () => {
      set({ executiveLoading: true, executiveError: null });
      try {
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          set({
            currentExecutive: mapAuthUserToExecutive({
              id: authUser.id,
              name: authUser.name,
              email: authUser.email,
              phone: authUser.phone,
              assignedHubId: authUser.assignedHubId,
              assignedHubName: authUser.assignedHub?.name,
              isActive: authUser.isActive,
            }),
            executiveLoading: false,
            executiveError: null,
          });
          return;
        }

        const me = await authService.getMe();
        set({
          currentExecutive: mapAuthUserToExecutive({
            id: me.id,
            name: me.name,
            email: me.email,
            phone: me.phone,
            assignedHubId: me.assignedHubId,
            assignedHubName: me.assignedHub?.name,
            isActive: me.isActive,
          }),
          executiveLoading: false,
          executiveError: null,
        });
      } catch (error) {
        set({
          executiveLoading: false,
          executiveError: getErrorMessage(error),
        });
      }
    },

    loadActivities: async (limit = 8) => {
      try {
        const rows = await customerExecutiveService.getActivity(limit);
        set({ activities: rows.map((row) => mapApiActivity(row)) });
      } catch {
        // Activity feed failures are non-blocking for list pages.
      }
    },

    queryCustomers: (params) =>
      toQueryResult(get().customers, get().customersMeta, params.page),

    queryOrders: (params) =>
      toQueryResult(get().orders, get().ordersMeta, params.page),

    queryPayments: (params) =>
      toQueryResult(get().payments, get().paymentsMeta, params.page),

    queryComplaints: (params) =>
      toQueryResult(get().complaints, get().complaintsMeta, params.page),

    getDashboardStats: () =>
      get().dashboardStats ?? {
        assignedCustomers: 0,
        openComplaints: 0,
        pendingPayments: 0,
        pendingPaymentsAmount: 0,
        avgResolutionHours: 0,
      },

    getCustomer: (id) => get().customers.find((c) => c.id === id),
    getCustomerByPhone: (phone) => {
      const normalized = phone.replace(/\D/g, "").slice(-10);
      return get().customers.find((c) =>
        c.phone.replace(/\D/g, "").slice(-10).includes(normalized),
      );
    },
    getOrder: (id) => get().orders.find((o) => o.id === id),
    getOrderByNumber: (orderNumber) =>
      get().orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === orderNumber.toLowerCase() ||
          o.orderNumber.includes(orderNumber),
      ),
    getPayment: (id) => get().payments.find((p) => p.id === id),
    getComplaint: (id) => get().complaints.find((c) => c.id === id),

    getCustomerOrders: (customerId) =>
      get()
        .orders.filter((o) => o.customerId === customerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),

    getCustomerPayments: (customerId) =>
      get()
        .payments.filter((p) => p.customerId === customerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),

    getCustomerComplaints: (customerId) =>
      get()
        .complaints.filter((c) => c.customerId === customerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),

    getCustomerNotes: (customerId) =>
      get()
        .notes.filter((n) => n.customerId === customerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),

    getCustomerActivities: (customerId) =>
      get()
        .activities.filter((a) => a.customerId === customerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),

    getCustomerOrderStats: (customerId) => {
      const orders = get().getCustomerOrders(customerId);
      return {
        totalOrders: orders.length,
        activeOrders: orders.filter((o) => o.status === "ACTIVE").length,
        deliveredOrders: orders.filter((o) => o.status === "DELIVERED").length,
        totalSpent: orders.reduce((sum, order) => sum + order.amount, 0),
      };
    },

    getCustomerPendingAmount: (customerId) =>
      get()
        .getCustomerPayments(customerId)
        .filter((p) => p.status === "PENDING" || p.status === "PARTIAL")
        .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0),

    getRecentActivities: (limit = 8) => get().activities.slice(0, limit),

    getPendingPayments: (limit = 5) =>
      get()
        .payments.filter(
          (p) => p.status === "PENDING" || p.status === "PARTIAL",
        )
        .slice(0, limit),

    lookupCustomer: async (phone) => {
      const result = await customerExecutiveService.lookupCustomer(phone);
      if (!result.exists || !result.customer) {
        return { exists: false };
      }
      if (result.customer.assignedToOtherExecutive) {
        return { exists: true, assignedToOtherExecutive: true };
      }
      const customer = mapApiCustomer(result.customer);
      set((state) => {
        const exists = state.customers.some((c) => c.id === customer.id);
        return {
          customers: exists
            ? state.customers.map((c) => (c.id === customer.id ? customer : c))
            : [customer, ...state.customers],
        };
      });
      return { exists: true, customer };
    },

    sendOtp: async (phone) => customerExecutiveService.sendOtp(phone),

    verifyOtp: async (phone, otp) =>
      customerExecutiveService.verifyOtp(phone, otp),

    registerCustomer: async (draft, verificationToken) => {
      const raw = await customerExecutiveService.registerCustomer({
        phone: draft.phone,
        verificationToken,
        fullName: draft.name,
        email: draft.email || undefined,
        companyName: draft.company || undefined,
        customerType: draft.customerType,
        gstNumber: draft.gst || undefined,
        address: draft.address,
        pincode: draft.pincode,
        city: draft.city,
        state: draft.state,
      });
      const customer = mapApiCustomer(raw);
      set((state) => ({
        customers: [customer, ...state.customers],
        dashboardStats: state.dashboardStats
          ? {
              ...state.dashboardStats,
              assignedCustomers: state.dashboardStats.assignedCustomers + 1,
            }
          : state.dashboardStats,
      }));
      void get().loadDashboard();
      return customer;
    },

    updateCustomer: async (customerId, payload) => {
      const raw = await customerExecutiveService.updateCustomer(
        customerId,
        payload,
      );
      const customer = mapApiCustomer(raw);
      set((state) => ({
        customers: state.customers.map((item) =>
          item.id === customerId ? customer : item,
        ),
      }));
      return customer;
    },

    createOrder: async (draft) => {
      const customer = get().getCustomer(draft.customerId);
      if (!customer) throw new Error("Customer not found");

      const noteParts = [
        draft.deliveryDate ? `Requested delivery: ${draft.deliveryDate}` : null,
        draft.deliveryPriority !== "STANDARD" ? draft.deliveryPriority : null,
      ].filter((part): part is string => Boolean(part));

      const raw = await customerExecutiveService.createOrder({
        customerId: draft.customerId,
        items: draft.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        paymentMethod: mapPaymentMethodToApi(draft.paymentMethod),
        deliveryAddress: draft.deliveryAddress,
        deliveryPincode: draft.deliveryPincode,
        deliveryCity: customer.city,
        deliveryState: customer.state,
        deliveryDate: draft.deliveryDate || undefined,
        notes: noteParts.join("\n") || undefined,
      });

      const order = mapApiOrder(raw);
      set((state) => ({
        orders: [order, ...state.orders],
      }));
      void get().loadDashboard();
      return order;
    },

    sendPaymentLink: async (paymentId) => {
      const payment = get().payments.find((p) => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");
      await get().sendPaymentLinkByOrderId(payment.orderId);
    },

    sendPaymentLinkByOrderId: async (orderId) => {
      const response = await customerExecutiveService.sendPaymentLink(orderId);
      set((state) => ({
        payments: state.payments.map((payment) =>
          payment.orderId === orderId
            ? {
                ...payment,
                linkStatus: "SENT" as const,
                linkSentAt: new Date().toISOString(),
                paymentLink: response.paymentUrl,
                reminderCount: payment.reminderCount + 1,
              }
            : payment,
        ),
      }));
    },

    copyPaymentLink: (paymentId) => {
      const payment = get().payments.find((p) => p.id === paymentId);
      return payment?.paymentLink ?? "";
    },

    markPaymentPaid: (_paymentId) => {
      throw new Error(
        "Payments can only be marked paid via payment provider webhook",
      );
    },

    incrementReminder: async (paymentId) => {
      const payment = get().payments.find((p) => p.id === paymentId);
      if (!payment) return;
      await customerExecutiveService.sendPaymentReminder(payment.orderId);
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === paymentId ? { ...p, reminderCount: p.reminderCount + 1 } : p,
        ),
      }));
    },

    addNote: async (customerId, content) => {
      await customerExecutiveService.updateCustomerNote(customerId, content);
      const note: CeNote = {
        id: `note-${customerId}`,
        customerId,
        content,
        createdAt: new Date().toISOString(),
        createdBy: get().currentExecutive?.name ?? "Executive",
      };
      set((state) => ({
        notes: [
          note,
          ...state.notes.filter((existing) => existing.customerId !== customerId),
        ],
        customers: state.customers.map((customer) =>
          customer.id === customerId
            ? { ...customer, adminNotes: content }
            : customer,
        ),
      }));
      return note;
    },

    updateNote: async (noteId, content) => {
      const existing = get().notes.find((note) => note.id === noteId);
      if (!existing) return;
      await customerExecutiveService.updateCustomerNote(
        existing.customerId,
        content,
      );
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? { ...note, content } : note,
        ),
        customers: state.customers.map((customer) =>
          customer.id === existing.customerId
            ? { ...customer, adminNotes: content }
            : customer,
        ),
      }));
    },

    deleteNote: async (noteId) => {
      const existing = get().notes.find((note) => note.id === noteId);
      if (!existing) return;
      await customerExecutiveService.updateCustomerNote(existing.customerId, "");
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        customers: state.customers.map((customer) =>
          customer.id === existing.customerId
            ? { ...customer, adminNotes: "" }
            : customer,
        ),
      }));
    },

    cancelOrder: async (orderId, reason) => {
      await customerExecutiveService.cancelOrder(orderId, reason);
      await get().loadOrderDetailFromApi(orderId);
      void get().loadDashboard();
    },

    updateComplaintStatus: async (complaintId, status, resolution) => {
      const raw = await customerExecutiveService.updateTicket(complaintId, {
        status: mapComplaintStatusToApi(status),
        resolution,
      });
      const updated = mapApiComplaint(raw);
      set((state) => ({
        complaints: state.complaints.map((complaint) =>
          complaint.id === complaintId ? updated : complaint,
        ),
      }));
      void get().loadDashboard();
    },

    addComplaintNote: async (complaintId, content) => {
      await customerExecutiveService.updateTicket(complaintId, { note: content });
      const complaint = get().complaints.find((c) => c.id === complaintId);
      if (!complaint) return;
      const note: CeNote = {
        id: `cnote-${Date.now()}`,
        customerId: complaint.customerId,
        content,
        createdAt: new Date().toISOString(),
        createdBy: get().currentExecutive?.name ?? "Executive",
      };
      set((state) => ({
        complaints: state.complaints.map((c) =>
          c.id === complaintId
            ? { ...c, internalNotes: [...c.internalNotes, note] }
            : c,
        ),
      }));
    },

    createComplaint: async (draft) => {
      const raw = await customerExecutiveService.createTicket({
        customerId: draft.customerId,
        orderId: draft.orderId,
        reason: mapIssueTypeToReason(draft.issueType),
        subject: draft.issueType,
        description: draft.issue,
        priority: draft.priority,
      });
      const complaint = mapApiComplaint(raw);
      set((state) => ({
        complaints: [complaint, ...state.complaints],
      }));
      void get().loadDashboard();
      return complaint;
    },

    generatePaymentLinkForCustomer: async (draft) => {
      const payment = draft.orderId
        ? get().payments.find((p) => p.orderId === draft.orderId)
        : get()
            .payments.filter(
              (p) =>
                p.customerId === draft.customerId &&
                (p.status === "PENDING" || p.status === "PARTIAL"),
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0];

      if (!payment) return null;
      await get().sendPaymentLinkByOrderId(payment.orderId);
      return get().payments.find((p) => p.id === payment.id) ?? payment;
    },

    markNotificationRead: (notificationId) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      }));
    },

    searchTracking: async (q) => {
      const rows = await customerExecutiveService.searchTracking(q);
      const orders = rows.map((row) => mapApiOrder(row));
      set((state) => {
        const merged = [...state.orders];
        for (const order of orders) {
          const index = merged.findIndex((item) => item.id === order.id);
          if (index >= 0) merged[index] = order;
          else merged.unshift(order);
        }
        return { orders: merged };
      });
      return orders;
    },

    loadOrderDetailFromApi: async (id) => {
      try {
        const raw = await customerExecutiveService.getOrderById(id);
        const mapped = mapBackendOrderToCeOrder(raw as never);
        set((state) => {
          const exists = state.orders.some((order) => order.id === mapped.id);
          return {
            orders: exists
              ? state.orders.map((order) =>
                  order.id === mapped.id ? mapped : order,
                )
              : [mapped, ...state.orders],
          };
        });
        return mapped;
      } catch {
        return get().getOrder(id) ?? null;
      }
    },

    loadOrdersFromApi: async () => {
      await get().loadOrders({ page: 1, limit: 100 });
    },
  }),
);
