import { create } from "zustand";

import {
  getFinanceDashboardStats,
  queryFinanceInvoices,
} from "@/features/finance/mock/queries";
import { FINANCE_INVOICES } from "@/features/finance/mock/seed";
import type {
  FinanceDashboardStats,
  FinanceInvoice,
  FinancePaymentMethod,
  FinanceQueryParams,
  FinanceQueryResult,
} from "@/features/finance/types";

interface FinanceStore {
  invoices: FinanceInvoice[];

  queryInvoices: (params: FinanceQueryParams) => FinanceQueryResult;
  getDashboardStats: () => FinanceDashboardStats;
  getInvoiceById: (id: string) => FinanceInvoice | undefined;

  markAsPaid: (id: string, paymentMethod?: FinancePaymentMethod) => void;
  cancelPayment: (id: string, reason?: string) => void;
}

function rebuildTimeline(invoice: FinanceInvoice): FinanceInvoice["timeline"] {
  const steps: FinanceInvoice["timeline"] = [
    { step: "ORDER_CREATED", label: "Order Created" },
    { step: "INVOICE_GENERATED", label: "Invoice Generated" },
    { step: "PAYMENT_PENDING", label: "Payment Pending" },
    { step: "PAYMENT_RECEIVED", label: "Payment Received" },
    { step: "VERIFIED", label: "Verified" },
  ];

  steps[0].completedAt = invoice.orderCreatedAt;
  steps[1].completedAt = invoice.invoiceDate;

  if (invoice.status === "Pending") {
    steps[2].completedAt = invoice.invoiceDate;
    return steps;
  }

  if (invoice.status === "Paid") {
    steps[2].completedAt = invoice.invoiceDate;
    steps[3].completedAt = invoice.paymentDate;
    steps[4].completedAt = invoice.verifiedAt ?? invoice.paymentDate;
    return steps;
  }

  steps[2].completedAt = invoice.invoiceDate;
  return steps;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  invoices: [...FINANCE_INVOICES],

  queryInvoices: (params) => queryFinanceInvoices(get().invoices, params),

  getDashboardStats: () => getFinanceDashboardStats(get().invoices),

  getInvoiceById: (id) => get().invoices.find((inv) => inv.id === id),

  markAsPaid: (id, paymentMethod = "NEFT") => {
    const now = new Date().toISOString();
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id !== id) return inv;
        const updated: FinanceInvoice = {
          ...inv,
          status: "Paid",
          paymentDate: now,
          paymentMethod,
          verifiedAt: now,
          verifiedBy: "Finance Team",
        };
        return { ...updated, timeline: rebuildTimeline(updated) };
      }),
    }));
  },

  cancelPayment: (id, reason) => {
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id !== id) return inv;
        const updated: FinanceInvoice = {
          ...inv,
          status: "Cancelled",
          cancellationReason: reason ?? "Payment cancelled by finance team",
        };
        return { ...updated, timeline: rebuildTimeline(updated) };
      }),
    }));
  },
}));
