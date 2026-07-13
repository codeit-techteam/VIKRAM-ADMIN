import { CE_ORDERS_IN_TRANSIT_STATUSES } from "@/constants/orders.constants";
import type { DashboardDateFilter } from "@/features/dashboard/types/dashboard.types";
import {
  CE_CUSTOMERS,
  CE_ORDERS,
  CE_PAYMENTS,
} from "@/features/customer-executive/mock/seed";
import type {
  CeOrder,
  OrderStatus,
  PaymentStatus,
} from "@/features/customer-executive/types";

const EXCLUDED_ORDER_STATUSES = new Set<OrderStatus>(["CANCELLED"]);

export interface KpiOrderRecord {
  id: string;
  customerId: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
}

function mapPaymentToOrder(orderId: string) {
  return CE_PAYMENTS.find((payment) => payment.orderId === orderId);
}

function mapCeOrderToKpi(order: CeOrder): KpiOrderRecord {
  const payment = mapPaymentToOrder(order.id);

  return {
    id: order.id,
    customerId: order.customerId,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt,
    paymentStatus: payment?.status,
    paidAmount: payment?.paidAmount,
  };
}

function buildSupplementalKpiOrders(): KpiOrderRecord[] {
  const quarterStart = getIndianFiscalQuarterBounds(new Date()).start;
  const customerIds = CE_CUSTOMERS.map((customer) => customer.id);
  const statusPool: OrderStatus[] = [
    "DELIVERED",
    "DELIVERED",
    "DELIVERED",
    "IN_TRANSIT",
    "IN_TRANSIT",
    "ACTIVE",
    "HUB_PROCESSING",
    "CANCELLED",
  ];
  const paymentPool: PaymentStatus[] = [
    "PAID",
    "PAID",
    "PARTIAL",
    "PENDING",
    "PAID",
  ];
  const amountSeeds = [
    185000, 242000, 318000, 426000, 512000, 638000, 724000, 890000, 156000,
    278000, 394000, 467000, 583000, 612000, 745000,
  ];

  return Array.from({ length: 152 }, (_, index) => {
    const dayOffset = index % 90;
    const createdAt = new Date(quarterStart);
    createdAt.setDate(createdAt.getDate() + dayOffset);
    createdAt.setHours(9 + (index % 8), 0, 0, 0);

    const status = statusPool[index % statusPool.length]!;
    const paymentStatus = paymentPool[index % paymentPool.length]!;
    const amount =
      amountSeeds[index % amountSeeds.length]! + (index % 7) * 1250;
    const paidAmount =
      paymentStatus === "PAID"
        ? amount
        : paymentStatus === "PARTIAL"
          ? Math.round(amount * (0.35 + (index % 4) * 0.1))
          : 0;

    return {
      id: `kpi-ord-${index + 1}`,
      customerId: customerIds[index % customerIds.length]!,
      amount,
      status,
      createdAt: createdAt.toISOString(),
      paymentStatus,
      paidAmount,
    };
  });
}

export function getExecutiveKpiOrderPool(): KpiOrderRecord[] {
  const ceOrders = CE_ORDERS.map(mapCeOrderToKpi);
  const supplemental = buildSupplementalKpiOrders();
  const ceOrderIds = new Set(ceOrders.map((order) => order.id));

  return [
    ...ceOrders,
    ...supplemental.filter((order) => !ceOrderIds.has(order.id)),
  ];
}

function getIndianFiscalQuarterBounds(referenceDate: Date): {
  start: Date;
  end: Date;
} {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();

  if (month >= 3 && month <= 5) {
    return {
      start: new Date(year, 3, 1, 0, 0, 0, 0),
      end: new Date(year, 5, 30, 23, 59, 59, 999),
    };
  }

  if (month >= 6 && month <= 8) {
    return {
      start: new Date(year, 6, 1, 0, 0, 0, 0),
      end: new Date(year, 8, 30, 23, 59, 59, 999),
    };
  }

  if (month >= 9 && month <= 11) {
    return {
      start: new Date(year, 9, 1, 0, 0, 0, 0),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year, 2, 31, 23, 59, 59, 999),
  };
}

export function getReportingPeriodBounds(filter: DashboardDateFilter): {
  start: Date;
  end: Date;
} {
  const now = new Date();

  if (filter.range === "custom" && filter.customFrom && filter.customTo) {
    const start = new Date(filter.customFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filter.customTo);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  switch (filter.range) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }
    case "year": {
      const fiscalYearStartMonth = 3;
      const fiscalYear =
        now.getMonth() >= fiscalYearStartMonth
          ? now.getFullYear()
          : now.getFullYear() - 1;
      const start = new Date(fiscalYear, fiscalYearStartMonth, 1, 0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "quarter":
    default:
      return getIndianFiscalQuarterBounds(now);
  }
}

function isWithinReportingPeriod(
  createdAt: string,
  bounds: { start: Date; end: Date },
): boolean {
  const created = new Date(createdAt);
  return created >= bounds.start && created <= bounds.end;
}

export function isConfirmedOrder(status: OrderStatus): boolean {
  return !EXCLUDED_ORDER_STATUSES.has(status);
}

function getOrderRevenueContribution(order: KpiOrderRecord): number {
  if (!isConfirmedOrder(order.status)) {
    return 0;
  }

  if (order.paymentStatus === "PAID") {
    return order.amount;
  }

  if (order.paymentStatus === "PARTIAL") {
    return order.paidAmount && order.paidAmount > 0
      ? order.paidAmount
      : order.amount;
  }

  if (order.status === "DELIVERED") {
    return order.amount;
  }

  return 0;
}

export function filterOrdersForPeriod(
  orders: KpiOrderRecord[],
  filter: DashboardDateFilter,
): KpiOrderRecord[] {
  const bounds = getReportingPeriodBounds(filter);
  return orders.filter(
    (order) =>
      isConfirmedOrder(order.status) &&
      isWithinReportingPeriod(order.createdAt, bounds),
  );
}

export function computeTotalOrders(
  orders: KpiOrderRecord[],
  filter: DashboardDateFilter,
): number {
  return filterOrdersForPeriod(orders, filter).length;
}

export function computeOrdersInTransit(
  orders: KpiOrderRecord[],
  filter: DashboardDateFilter,
): number {
  const bounds = getReportingPeriodBounds(filter);

  return orders.filter(
    (order) =>
      isConfirmedOrder(order.status) &&
      CE_ORDERS_IN_TRANSIT_STATUSES.includes(order.status) &&
      isWithinReportingPeriod(order.createdAt, bounds),
  ).length;
}

export function computeQuarterRevenue(
  orders: KpiOrderRecord[],
  filter: DashboardDateFilter,
): number {
  const bounds = getReportingPeriodBounds(filter);

  return orders.reduce((total, order) => {
    if (!isWithinReportingPeriod(order.createdAt, bounds)) {
      return total;
    }

    return total + getOrderRevenueContribution(order);
  }, 0);
}

export function computeActiveCustomers(
  orders: KpiOrderRecord[],
  filter: DashboardDateFilter,
): number {
  const confirmedInPeriod = filterOrdersForPeriod(orders, filter);
  return new Set(confirmedInPeriod.map((order) => order.customerId)).size;
}

export function formatCompactRupee(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
  }

  return `₹${(amount / 100_000).toFixed(1)} L`;
}
