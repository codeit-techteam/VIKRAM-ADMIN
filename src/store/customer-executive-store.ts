"use client";

import { create } from "zustand";

import {
  CE_ACTIVITIES,
  CE_COMPLAINTS,
  CE_CURRENT_EXECUTIVE,
  CE_CUSTOMERS,
  CE_DRIVERS,
  CE_EXECUTIVES,
  CE_HUBS,
  CE_NOTES,
  CE_NOTIFICATIONS,
  CE_ORDERS,
  CE_PAYMENTS,
  CE_PRODUCTS,
  CE_VEHICLES,
} from "@/features/customer-executive/mock/seed";
import {
  calculateOrderTotal,
  computeDashboardStats,
  generateCustomerId,
  generateId,
  generateOrderNumber,
  generateTicketNumber,
  getActivitiesForCustomer,
  getCustomerOrderStats,
  getCustomerPendingAmount,
  queryComplaints,
  queryCustomers,
  queryOrders,
  queryPayments,
} from "@/features/customer-executive/mock/queries";
import type {
  CeActivity,
  CeComplaint,
  CeComplaintFilters,
  CeCustomer,
  CeCustomerFilters,
  CeDashboardStats,
  CeExecutiveProfile,
  CeCreatePaymentLinkDraft,
  CeNewComplaintDraft,
  CeNewCustomerDraft,
  CeNewOrderDraft,
  CeNote,
  CeNotification,
  CeOrder,
  CeOrderFilters,
  CePayment,
  CePaymentFilters,
  CeQueryParams,
  CeQueryResult,
} from "@/features/customer-executive/types";

interface CustomerExecutiveStore {
  customers: CeCustomer[];
  orders: CeOrder[];
  payments: CePayment[];
  complaints: CeComplaint[];
  activities: CeActivity[];
  notes: CeNote[];
  notifications: CeNotification[];
  currentExecutive: CeExecutiveProfile;
  products: typeof CE_PRODUCTS;
  drivers: typeof CE_DRIVERS;
  vehicles: typeof CE_VEHICLES;
  hubs: typeof CE_HUBS;
  executives: typeof CE_EXECUTIVES;

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
  getCustomerOrderStats: (
    customerId: string,
  ) => ReturnType<typeof getCustomerOrderStats>;
  getCustomerPendingAmount: (customerId: string) => number;
  getRecentActivities: (limit?: number) => CeActivity[];
  getPendingPayments: (limit?: number) => CePayment[];

  assignExecutive: (customerIds: string[], executiveId: string) => void;
  registerCustomer: (draft: CeNewCustomerDraft) => CeCustomer;
  createOrder: (draft: CeNewOrderDraft) => CeOrder;
  sendPaymentLink: (paymentId: string) => void;
  copyPaymentLink: (paymentId: string) => string;
  markPaymentPaid: (paymentId: string) => void;
  incrementReminder: (paymentId: string) => void;
  addNote: (customerId: string, content: string) => CeNote;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  updateComplaintStatus: (
    complaintId: string,
    status: CeComplaint["status"],
  ) => void;
  addComplaintNote: (complaintId: string, content: string) => void;
  createComplaint: (draft: CeNewComplaintDraft) => CeComplaint;
  generatePaymentLinkForCustomer: (
    draft: CeCreatePaymentLinkDraft,
  ) => CePayment | null;
  markNotificationRead: (notificationId: string) => void;
}

function addActivity(
  activities: CeActivity[],
  activity: Omit<CeActivity, "id">,
): CeActivity[] {
  const newActivity: CeActivity = { ...activity, id: generateId("act") };
  return [newActivity, ...activities];
}

export const useCustomerExecutiveStore = create<CustomerExecutiveStore>(
  (set, get) => ({
    customers: [...CE_CUSTOMERS],
    orders: [...CE_ORDERS],
    payments: [...CE_PAYMENTS],
    complaints: [...CE_COMPLAINTS],
    activities: [...CE_ACTIVITIES],
    notes: [...CE_NOTES],
    notifications: [...CE_NOTIFICATIONS],
    currentExecutive: CE_CURRENT_EXECUTIVE,
    products: CE_PRODUCTS,
    drivers: CE_DRIVERS,
    vehicles: CE_VEHICLES,
    hubs: CE_HUBS,
    executives: CE_EXECUTIVES,

    queryCustomers: (params) => queryCustomers(get().customers, params),
    queryOrders: (params) => queryOrders(get().orders, params),
    queryPayments: (params) => queryPayments(get().payments, params),
    queryComplaints: (params) => queryComplaints(get().complaints, params),

    getDashboardStats: () =>
      computeDashboardStats(
        get().customers,
        get().orders,
        get().payments,
        get().complaints,
        get().currentExecutive.id,
      ),

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
      getActivitiesForCustomer(get().activities, customerId),

    getCustomerOrderStats: (customerId) =>
      getCustomerOrderStats(get().orders, customerId),

    getCustomerPendingAmount: (customerId) =>
      getCustomerPendingAmount(get().payments, customerId),

    getRecentActivities: (limit = 8) =>
      [...get().activities]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit),

    getPendingPayments: (limit = 5) =>
      get()
        .payments.filter(
          (p) => p.status === "PENDING" || p.status === "PARTIAL",
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit),

    assignExecutive: (customerIds, executiveId) => {
      set((state) => ({
        customers: state.customers.map((c) =>
          customerIds.includes(c.id)
            ? { ...c, assignedExecutiveId: executiveId }
            : c,
        ),
      }));
    },

    registerCustomer: (draft) => {
      const newCustomer: CeCustomer = {
        id: generateCustomerId(),
        name: draft.name,
        company: draft.company,
        phone: draft.phone,
        email: draft.email,
        gst: draft.gst || undefined,
        city: draft.city,
        state: draft.state,
        pincode: draft.pincode,
        address: draft.address,
        customerType: draft.customerType,
        status: "ACTIVE",
        assignedExecutiveId: get().currentExecutive.id,
        creditLimit: 100000,
        lifetimePurchase: 0,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        customers: [newCustomer, ...state.customers],
        activities: addActivity(state.activities, {
          type: "CUSTOMER_REGISTERED",
          title: "New Customer Registered",
          description: `${newCustomer.name} from ${newCustomer.company} registered.`,
          customerId: newCustomer.id,
          createdAt: new Date().toISOString(),
          createdBy: get().currentExecutive.name,
        }),
      }));

      return newCustomer;
    },

    createOrder: (draft) => {
      const customer = get().getCustomer(draft.customerId);
      if (!customer) throw new Error("Customer not found");

      const { grandTotal } = calculateOrderTotal(draft.items);
      const orderNumber = generateOrderNumber();

      const newOrder: CeOrder = {
        id: generateId("ord"),
        orderNumber,
        customerId: customer.id,
        customerName: customer.name,
        company: customer.company,
        items: draft.items,
        amount: grandTotal,
        status: "ACTIVE",
        orderSource: "EXECUTIVE",
        createdAt: new Date().toISOString(),
        eta: "Jul 12, 02:00 PM",
        deliveryAddress: draft.deliveryAddress,
        deliveryPincode: draft.deliveryPincode,
        deliveryDate: draft.deliveryDate,
        deliveryPriority: draft.deliveryPriority,
        paymentMethod: draft.paymentMethod,
        trackingStep: "ORDER_CREATED",
        hubId: "hub-1",
      };

      const newPayment: CePayment = {
        id: generateId("pay"),
        orderId: newOrder.id,
        orderNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        amount: grandTotal,
        paidAmount: draft.paymentMethod === "CASH" ? grandTotal : 0,
        status: draft.paymentMethod === "CASH" ? "PAID" : "PENDING",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        linkStatus: "NOT_SENT",
        reminderCount: 0,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        orders: [newOrder, ...state.orders],
        payments: [newPayment, ...state.payments],
        customers: state.customers.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                lastOrderAt: new Date().toISOString(),
                lifetimePurchase: c.lifetimePurchase + grandTotal,
              }
            : c,
        ),
        activities: addActivity(state.activities, {
          type: "ORDER_CREATED",
          title: "Order Created",
          description: `Order #${orderNumber} placed for ${customer.name} — ₹${grandTotal.toLocaleString("en-IN")}`,
          customerId: customer.id,
          orderId: newOrder.id,
          createdAt: new Date().toISOString(),
          createdBy: get().currentExecutive.name,
        }),
      }));

      return newOrder;
    },

    sendPaymentLink: (paymentId) => {
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                linkStatus: "SENT" as const,
                linkSentAt: new Date().toISOString(),
                paymentLink:
                  p.paymentLink ?? `https://pay.buildquick.in/${p.orderNumber}`,
                reminderCount: p.reminderCount + 1,
              }
            : p,
        ),
        activities: addActivity(state.activities, {
          type: "PAYMENT_LINK_SENT",
          title: "Payment Link Sent",
          description: `Payment link sent to ${state.payments.find((p) => p.id === paymentId)?.customerName}`,
          paymentId,
          customerId: state.payments.find((p) => p.id === paymentId)
            ?.customerId,
          createdAt: new Date().toISOString(),
          createdBy: get().currentExecutive.name,
        }),
      }));
    },

    copyPaymentLink: (paymentId) => {
      const payment = get().payments.find((p) => p.id === paymentId);
      const link =
        payment?.paymentLink ??
        `https://pay.buildquick.in/${payment?.orderNumber ?? ""}`;
      return link;
    },

    markPaymentPaid: (paymentId) => {
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === paymentId
            ? { ...p, status: "PAID" as const, paidAmount: p.amount }
            : p,
        ),
        activities: addActivity(state.activities, {
          type: "PAYMENT_RECEIVED",
          title: "Payment Received",
          description: `Payment verified for Order #${state.payments.find((p) => p.id === paymentId)?.orderNumber}`,
          paymentId,
          customerId: state.payments.find((p) => p.id === paymentId)
            ?.customerId,
          orderId: state.payments.find((p) => p.id === paymentId)?.orderId,
          createdAt: new Date().toISOString(),
        }),
      }));
    },

    incrementReminder: (paymentId) => {
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === paymentId ? { ...p, reminderCount: p.reminderCount + 1 } : p,
        ),
      }));
    },

    addNote: (customerId, content) => {
      const note: CeNote = {
        id: generateId("note"),
        customerId,
        content,
        createdAt: new Date().toISOString(),
        createdBy: get().currentExecutive.name,
      };

      set((state) => ({
        notes: [note, ...state.notes],
        activities: addActivity(state.activities, {
          type: "NOTE_ADDED",
          title: "Note Added",
          description:
            content.slice(0, 80) + (content.length > 80 ? "..." : ""),
          customerId,
          createdAt: new Date().toISOString(),
          createdBy: get().currentExecutive.name,
        }),
      }));

      return note;
    },

    updateNote: (noteId, content) => {
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, content } : n,
        ),
      }));
    },

    deleteNote: (noteId) => {
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
      }));
    },

    updateComplaintStatus: (complaintId, status) => {
      set((state) => ({
        complaints: state.complaints.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                status,
                resolvedAt:
                  status === "RESOLVED"
                    ? new Date().toISOString()
                    : c.resolvedAt,
              }
            : c,
        ),
        activities:
          status === "RESOLVED"
            ? addActivity(state.activities, {
                type: "COMPLAINT_RESOLVED",
                title: "Complaint Resolved",
                description: `Ticket resolved for ${state.complaints.find((c) => c.id === complaintId)?.customerName}`,
                complaintId,
                customerId: state.complaints.find((c) => c.id === complaintId)
                  ?.customerId,
                createdAt: new Date().toISOString(),
                createdBy: get().currentExecutive.name,
              })
            : state.activities,
      }));
    },

    addComplaintNote: (complaintId, content) => {
      const note: CeNote = {
        id: generateId("cnote"),
        customerId:
          get().complaints.find((c) => c.id === complaintId)?.customerId ?? "",
        content,
        createdAt: new Date().toISOString(),
        createdBy: get().currentExecutive.name,
      };

      set((state) => ({
        complaints: state.complaints.map((c) =>
          c.id === complaintId
            ? { ...c, internalNotes: [...c.internalNotes, note] }
            : c,
        ),
      }));
    },

    createComplaint: (draft) => {
      const customer = get().getCustomer(draft.customerId);
      if (!customer) throw new Error("Customer not found");

      const order = draft.orderId ? get().getOrder(draft.orderId) : undefined;

      const newComplaint: CeComplaint = {
        id: generateId("cmp"),
        ticketNumber: generateTicketNumber(),
        customerId: customer.id,
        customerName: customer.name,
        company: customer.company,
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        issue: draft.issue,
        issueType: draft.issueType,
        priority: draft.priority,
        status: "OPEN",
        assignedExecutiveId: get().currentExecutive.id,
        createdAt: new Date().toISOString(),
        internalNotes: [],
        timeline: [],
      };

      set((state) => ({
        complaints: [newComplaint, ...state.complaints],
        activities: addActivity(state.activities, {
          type: "COMPLAINT_RAISED",
          title: "Complaint Raised",
          description: `${customer.name}: ${draft.issue.slice(0, 60)}`,
          customerId: customer.id,
          orderId: order?.id,
          complaintId: newComplaint.id,
          createdAt: new Date().toISOString(),
          createdBy: get().currentExecutive.name,
        }),
      }));

      return newComplaint;
    },

    generatePaymentLinkForCustomer: (draft) => {
      const customer = get().getCustomer(draft.customerId);
      if (!customer) return null;

      let payment = draft.orderId
        ? get().payments.find(
            (p) =>
              p.orderId === draft.orderId &&
              (p.status === "PENDING" || p.status === "PARTIAL"),
          )
        : get()
            .payments.filter(
              (p) =>
                p.customerId === customer.id &&
                (p.status === "PENDING" || p.status === "PARTIAL"),
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0];

      if (!payment && draft.orderId) {
        const order = get().getOrder(draft.orderId);
        if (!order) return null;

        payment = {
          id: generateId("pay"),
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          amount: draft.amount ?? order.amount,
          paidAmount: 0,
          status: "PENDING",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          linkStatus: "NOT_SENT",
          reminderCount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          payments: [payment!, ...state.payments],
        }));
      }

      if (!payment) return null;

      get().sendPaymentLink(payment.id);
      return get().payments.find((p) => p.id === payment!.id) ?? payment;
    },

    markNotificationRead: (notificationId) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      }));
    },
  }),
);
