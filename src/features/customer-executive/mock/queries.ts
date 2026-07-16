import { CE_ORDERS_IN_TRANSIT_STATUSES } from "@/constants/orders.constants";
import type {
  CeActivity,
  CeComplaint,
  CeComplaintFilters,
  CeCustomer,
  CeCustomerFilters,
  CeDashboardStats,
  CeOrder,
  CeOrderFilters,
  CePayment,
  CePaymentFilters,
  CeQueryParams,
  CeQueryResult,
} from "@/features/customer-executive/types";

function matchesSearch(value: string, search: string): boolean {
  if (!search.trim()) return true;
  return value.toLowerCase().includes(search.toLowerCase().trim());
}

function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): CeQueryResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total,
    page: safePage,
    totalPages,
  };
}

export function queryCustomers(
  customers: CeCustomer[],
  params: CeQueryParams<CeCustomerFilters>,
): CeQueryResult<CeCustomer> {
  const { filters, sortBy, sortDir = "asc" } = params;
  let result = [...customers];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        matchesSearch(c.name, s) ||
        matchesSearch(c.company, s) ||
        matchesSearch(c.phone, s) ||
        matchesSearch(c.email, s),
    );
  }

  if (filters.city !== "ALL") {
    result = result.filter((c) => c.city === filters.city);
  }

  if (filters.status !== "ALL") {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.customerType !== "ALL") {
    result = result.filter((c) => c.customerType === filters.customerType);
  }

  if (filters.activeThisMonth) {
    const now = new Date();
    result = result.filter((c) => {
      if (!c.lastOrderAt) return false;
      const d = new Date(c.lastOrderAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
  }

  if (sortBy) {
    result.sort((a, b) => {
      const aVal = String(a[sortBy as keyof CeCustomer] ?? "");
      const bVal = String(b[sortBy as keyof CeCustomer] ?? "");
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "desc" ? -cmp : cmp;
    });
  } else {
    result.sort(
      (a, b) =>
        new Date(b.lastOrderAt ?? b.createdAt).getTime() -
        new Date(a.lastOrderAt ?? a.createdAt).getTime(),
    );
  }

  return paginate(result, params.page, params.limit);
}

export function queryOrders(
  orders: CeOrder[],
  params: CeQueryParams<CeOrderFilters>,
): CeQueryResult<CeOrder> {
  const { filters } = params;
  let result = [...orders];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        matchesSearch(o.orderNumber, s) ||
        matchesSearch(o.customerName, s) ||
        matchesSearch(o.company, s),
    );
  }

  if (filters.statusGroup === "IN_TRANSIT") {
    result = result.filter((o) =>
      CE_ORDERS_IN_TRANSIT_STATUSES.includes(o.status),
    );
  } else if (filters.status !== "ALL") {
    result = result.filter((o) => o.status === filters.status);
  }

  if (filters.orderSource !== "ALL") {
    result = result.filter((o) => o.orderSource === filters.orderSource);
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return paginate(result, params.page, params.limit);
}

export function queryPayments(
  payments: CePayment[],
  params: CeQueryParams<CePaymentFilters>,
): CeQueryResult<CePayment> {
  const { filters } = params;
  let result = [...payments];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        matchesSearch(p.customerName, s) ||
        matchesSearch(p.orderNumber, s) ||
        matchesSearch(p.customerPhone, s),
    );
  }

  if (filters.status !== "ALL") {
    result = result.filter((p) => p.status === filters.status);
  }

  if (filters.linkStatus !== "ALL") {
    result = result.filter((p) => p.linkStatus === filters.linkStatus);
  }

  if (filters.dateRange !== "ALL") {
    const days =
      filters.dateRange === "7d" ? 7 : filters.dateRange === "30d" ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    result = result.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return paginate(result, params.page, params.limit);
}

export function queryComplaints(
  complaints: CeComplaint[],
  params: CeQueryParams<CeComplaintFilters>,
): CeQueryResult<CeComplaint> {
  const { filters } = params;
  let result = [...complaints];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        matchesSearch(c.ticketNumber, s) ||
        matchesSearch(c.customerName, s) ||
        matchesSearch(c.company, s) ||
        matchesSearch(c.issue, s),
    );
  }

  if (filters.status !== "ALL") {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.priority !== "ALL") {
    result = result.filter((c) => c.priority === filters.priority);
  }

  if (filters.issueType !== "ALL") {
    result = result.filter((c) => c.issueType === filters.issueType);
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return paginate(result, params.page, params.limit);
}

export function computeDashboardStats(
  customers: CeCustomer[],
  orders: CeOrder[],
  payments: CePayment[],
  complaints: CeComplaint[],
  executiveId = "exec-1",
): CeDashboardStats {
  const assignedCustomers = customers.filter(
    (c) => c.assignedExecutiveId === executiveId,
  ).length;

  const openComplaints = complaints.filter(
    (c) =>
      c.assignedExecutiveId === executiveId &&
      (c.status === "OPEN" ||
        c.status === "IN_PROGRESS" ||
        c.status === "ESCALATED"),
  ).length;

  const pendingPaymentsList = payments.filter(
    (p) => p.status === "PENDING" || p.status === "PARTIAL",
  );

  const pendingPayments = pendingPaymentsList.length;
  const pendingPaymentsAmount = pendingPaymentsList.reduce(
    (sum, p) => sum + (p.amount - p.paidAmount),
    0,
  );

  const resolved = complaints.filter(
    (c) => c.status === "RESOLVED" && c.resolvedAt,
  );
  const avgResolutionHours =
    resolved.length > 0
      ? resolved.reduce((sum, c) => {
          const hours =
            (new Date(c.resolvedAt!).getTime() -
              new Date(c.createdAt).getTime()) /
            (1000 * 60 * 60);
          return sum + hours;
        }, 0) / resolved.length
      : 4.2;

  return {
    assignedCustomers,
    openComplaints,
    pendingPayments,
    pendingPaymentsAmount,
    avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
  };
}

export function getCustomerOrderStats(orders: CeOrder[], customerId: string) {
  const customerOrders = orders.filter((o) => o.customerId === customerId);
  return {
    total: customerOrders.length,
    app: customerOrders.filter((o) => o.orderSource === "APP").length,
    executive: customerOrders.filter((o) => o.orderSource === "EXECUTIVE")
      .length,
  };
}

export function getCustomerPendingAmount(
  payments: CePayment[],
  customerId: string,
): number {
  return payments
    .filter(
      (p) =>
        p.customerId === customerId &&
        (p.status === "PENDING" || p.status === "PARTIAL"),
    )
    .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
}

export function getActivitiesForCustomer(
  activities: CeActivity[],
  customerId: string,
): CeActivity[] {
  return activities
    .filter((a) => a.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function generateOrderNumber(): string {
  const num = Math.floor(90000 + Math.random() * 9999);
  return `BQ-${num}`;
}

export function generateTicketNumber(): string {
  const num = Math.floor(4900 + Math.random() * 100);
  return `TKT-${num}`;
}

export function generateCustomerId(): string {
  return `cust-${Date.now()}`;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const GST_RATE = 0.18;
export const DELIVERY_FEE = 0;
export const LOYALTY_DISCOUNT_RATE = 0.02;

export function calculateOrderTotal(
  items: { unitPrice: number; quantity: number }[],
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const gst = subtotal * GST_RATE;
  const loyaltyDiscount = subtotal * LOYALTY_DISCOUNT_RATE;
  const grandTotal = subtotal + gst + DELIVERY_FEE - loyaltyDiscount;

  return {
    subtotal,
    gst,
    deliveryFee: DELIVERY_FEE,
    loyaltyDiscount,
    grandTotal,
  };
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
