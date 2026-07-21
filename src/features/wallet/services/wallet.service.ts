import {
  computeWalletStats,
  getCustomerWalletSummary,
  MOCK_WALLET_REFUNDS,
  MOCK_WALLET_TRANSACTIONS,
  type CustomerWalletSummary,
  type WalletDashboardStats,
  type WalletTransaction,
  type WalletTransactionStatus,
  type WalletTransactionType,
} from "@/mock/mockWallet";

const MOCK_DELAY_MS = 300;

export const WALLET_PAGE_SIZE = 10;

export type WalletTypeFilter = "all" | WalletTransactionType;
export type WalletStatusFilter = "all" | WalletTransactionStatus;

export type WalletQuickFilter =
  "all" | "refunded" | "pending_refunds" | "today";

export interface WalletFilters {
  search: string;
  type: WalletTypeFilter;
  status: WalletStatusFilter;
  quickFilter: WalletQuickFilter;
}

export const EMPTY_WALLET_FILTERS: WalletFilters = {
  search: "",
  type: "all",
  status: "all",
  quickFilter: "all",
};

const REFUND_REASONS = new Set(["ORDER_REFUND", "CANCELLATION_REFUND"]);

function isToday(dateString: string): boolean {
  return dateString.startsWith(new Date().toISOString().slice(0, 10));
}

export interface WalletQueryParams {
  page: number;
  limit: number;
  filters: WalletFilters;
}

export interface WalletQueryResult {
  data: WalletTransaction[];
  total: number;
  totalPages: number;
  page: number;
}

let transactionsStore = structuredClone(MOCK_WALLET_TRANSACTIONS);

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterTransactions(
  items: WalletTransaction[],
  filters: WalletFilters,
): WalletTransaction[] {
  let result = [...items];

  switch (filters.quickFilter) {
    case "refunded":
      result = result.filter(
        (t) =>
          t.type === "CREDIT" &&
          t.status === "COMPLETED" &&
          REFUND_REASONS.has(t.reason),
      );
      break;
    case "pending_refunds":
      result = result.filter(
        (t) => t.status === "PENDING" && REFUND_REASONS.has(t.reason),
      );
      break;
    case "today":
      result = result.filter((t) => isToday(t.date));
      break;
    default:
      break;
  }

  if (filters.quickFilter === "all") {
    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.status !== "all") {
      result = result.filter((t) => t.status === filters.status);
    }
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q) ||
        t.orderNumber?.toLowerCase().includes(q),
    );
  }

  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/** Future: GET /admin/wallet/transactions */
export async function getWalletTransactions(
  params: WalletQueryParams,
): Promise<WalletQueryResult> {
  await delay();
  const filtered = filterTransactions(transactionsStore, params.filters);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const page = Math.min(params.page, totalPages);
  const start = (page - 1) * params.limit;

  return {
    data: filtered.slice(start, start + params.limit),
    total,
    totalPages,
    page,
  };
}

/** Future: GET /admin/wallet/stats */
export async function getWalletStats(): Promise<WalletDashboardStats> {
  await delay();
  return computeWalletStats(transactionsStore, MOCK_WALLET_REFUNDS);
}

/** Future: GET /admin/wallet/customers/:customerId */
export async function getWalletByCustomerId(
  customerId: string,
): Promise<CustomerWalletSummary | null> {
  await delay();
  return getCustomerWalletSummary(customerId);
}

/** Future: POST /admin/wallet/credit */
export async function manualCreditWallet(
  customerId: string,
  amount: number,
  notes: string,
): Promise<WalletTransaction> {
  await delay();
  const existing = transactionsStore.find((t) => t.customerId === customerId);
  const txn: WalletTransaction = {
    id: `wt-${Date.now()}`,
    customerId,
    customerName: existing?.customerName ?? "Unknown Customer",
    customerPhone: existing?.customerPhone ?? "",
    type: "CREDIT",
    amount,
    reason: "MANUAL_CREDIT",
    date: new Date().toISOString(),
    status: "COMPLETED",
    notes,
    processedBy: "Admin",
  };
  transactionsStore = [txn, ...transactionsStore];
  return structuredClone(txn);
}

/** Future: POST /admin/wallet/debit */
export async function manualDebitWallet(
  customerId: string,
  amount: number,
  notes: string,
): Promise<WalletTransaction> {
  await delay();
  const existing = transactionsStore.find((t) => t.customerId === customerId);
  const txn: WalletTransaction = {
    id: `wt-${Date.now()}`,
    customerId,
    customerName: existing?.customerName ?? "Unknown Customer",
    customerPhone: existing?.customerPhone ?? "",
    type: "DEBIT",
    amount,
    reason: "MANUAL_DEBIT",
    date: new Date().toISOString(),
    status: "COMPLETED",
    notes,
    processedBy: "Admin",
  };
  transactionsStore = [txn, ...transactionsStore];
  return structuredClone(txn);
}

export async function getLatestWalletRefunds(limit = 5) {
  await delay(120);
  return [...MOCK_WALLET_REFUNDS]
    .sort(
      (a, b) =>
        new Date(b.requestedDate).getTime() -
        new Date(a.requestedDate).getTime(),
    )
    .slice(0, limit);
}
