import type {
  FinanceDashboardStats,
  FinanceInvoice,
  FinancePaymentFilters,
  FinanceQueryParams,
  FinanceQueryResult,
} from "@/features/finance/types";

function matchesSearch(value: string, search: string): boolean {
  if (!search.trim()) return true;
  return value.toLowerCase().includes(search.toLowerCase().trim());
}

function isSameDay(dateStr: string, reference: Date): boolean {
  const date = new Date(dateStr);
  return date.toDateString() === reference.toDateString();
}

function isWithinDateRange(
  dateStr: string,
  from?: string,
  to?: string,
): boolean {
  const date = new Date(dateStr).getTime();
  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (date < fromDate.getTime()) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (date > toDate.getTime()) return false;
  }
  return true;
}

function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): FinanceQueryResult {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit) as FinanceInvoice[],
    total,
    page: safePage,
    totalPages,
  };
}

export function queryFinanceInvoices(
  invoices: FinanceInvoice[],
  params: FinanceQueryParams,
): FinanceQueryResult {
  const { filters } = params;
  let result = [...invoices];
  const today = new Date();

  if (filters.quickFilter === "today") {
    result = result.filter(
      (inv) => inv.paymentDate && isSameDay(inv.paymentDate, today),
    );
  } else if (filters.quickFilter === "paid") {
    result = result.filter((inv) => inv.status === "Paid");
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (inv) =>
        matchesSearch(inv.customerName, s) ||
        matchesSearch(inv.customerCompany, s) ||
        matchesSearch(inv.orderNumber, s) ||
        matchesSearch(inv.invoiceNumber, s) ||
        matchesSearch(inv.orderId, s),
    );
  }

  if (filters.status !== "ALL") {
    result = result.filter((inv) => inv.status === filters.status);
  }

  if (filters.hubId !== "ALL") {
    result = result.filter((inv) => inv.hubId === filters.hubId);
  }

  if (filters.customerId !== "ALL") {
    result = result.filter((inv) => inv.customerId === filters.customerId);
  }

  if (filters.executiveId !== "ALL") {
    result = result.filter((inv) => inv.executiveId === filters.executiveId);
  }

  if (filters.invoiceDateFrom || filters.invoiceDateTo) {
    result = result.filter((inv) =>
      isWithinDateRange(
        inv.invoiceDate,
        filters.invoiceDateFrom,
        filters.invoiceDateTo,
      ),
    );
  }

  result.sort(
    (a, b) =>
      new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime(),
  );

  return paginate(result, params.page, params.limit);
}

export function getFinanceDashboardStats(
  invoices: FinanceInvoice[],
): FinanceDashboardStats {
  const today = new Date();

  return {
    pendingCount: invoices.filter((inv) => inv.status === "Pending").length,
    paidTodayCount: invoices.filter(
      (inv) => inv.paymentDate && isSameDay(inv.paymentDate, today),
    ).length,
    totalRevenue: invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.invoiceAmount, 0),
    totalTransactions: invoices.length,
  };
}
