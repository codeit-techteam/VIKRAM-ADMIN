export type FinancePaymentStatus = "Pending" | "Paid" | "Cancelled";

export type FinanceTimelineStep =
  | "ORDER_CREATED"
  | "INVOICE_GENERATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_RECEIVED"
  | "VERIFIED";

export type FinancePaymentMethod = "UPI" | "NEFT" | "RTGS" | "Cheque" | "Cash";

export interface FinanceInvoiceProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  amount: number;
}

export interface FinanceGstSummary {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
}

export interface FinanceOrderSummary {
  subtotal: number;
  discount: number;
  deliveryCharges: number;
  gstTotal: number;
  grandTotal: number;
}

export interface FinanceTimelineEvent {
  step: FinanceTimelineStep;
  label: string;
  completedAt?: string;
}

export interface FinanceInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  customerGst?: string;
  customerAddress: string;
  executiveId: string;
  executiveName: string;
  hubId: string;
  hubName: string;
  invoiceAmount: number;
  status: FinancePaymentStatus;
  invoiceDate: string;
  paymentDate?: string;
  paymentMethod?: FinancePaymentMethod;
  products: FinanceInvoiceProduct[];
  gstSummary: FinanceGstSummary;
  orderSummary: FinanceOrderSummary;
  timeline: FinanceTimelineEvent[];
  orderCreatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  cancellationReason?: string;
}

export interface FinancePaymentFilters {
  search: string;
  status: FinancePaymentStatus | "ALL";
  hubId: string;
  customerId: string;
  executiveId: string;
  invoiceDateFrom?: string;
  invoiceDateTo?: string;
  quickFilter?: "today" | "paid" | null;
}

export interface FinanceQueryParams {
  page: number;
  limit: number;
  filters: FinancePaymentFilters;
}

export interface FinanceQueryResult {
  items: FinanceInvoice[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FinanceDashboardStats {
  pendingCount: number;
  paidTodayCount: number;
  totalRevenue: number;
  totalTransactions: number;
}

export const FINANCE_PAGE_SIZE = 10;

export const EMPTY_FINANCE_FILTERS: FinancePaymentFilters = {
  search: "",
  status: "ALL",
  hubId: "ALL",
  customerId: "ALL",
  executiveId: "ALL",
  invoiceDateFrom: undefined,
  invoiceDateTo: undefined,
  quickFilter: null,
};
