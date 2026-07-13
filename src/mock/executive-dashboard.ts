import {
  Building2,
  ClipboardList,
  IndianRupee,
  Package,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { ROUTES } from "@/constants/routes";
import type {
  DashboardNotification,
  PendingAction,
  QuickActionItem,
  RecentOrder,
  StatCardData,
} from "@/features/dashboard/types/dashboard.types";
import {
  CE_ORDERS,
  CE_CUSTOMERS,
  CE_HUBS,
} from "@/features/customer-executive/mock/seed";
import {
  computePendingDispatchCount,
  DISPATCH_LOG_LIST,
} from "@/mock/dispatch-logs";

export type DashboardDateRange =
  "today" | "week" | "month" | "quarter" | "year" | "custom";

export interface DashboardDateFilter {
  range: DashboardDateRange;
  customFrom?: string;
  customTo?: string;
}

const RANGE_SCALE: Record<Exclude<DashboardDateRange, "custom">, number> = {
  today: 0.06,
  week: 0.22,
  month: 0.48,
  quarter: 1,
  year: 2.35,
};

function getScale(filter: DashboardDateFilter): number {
  if (filter.range === "custom" && filter.customFrom && filter.customTo) {
    const from = new Date(filter.customFrom);
    const to = new Date(filter.customTo);
    const days = Math.max(
      1,
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)),
    );
    return Math.min(3, Math.max(0.05, days / 90));
  }
  return RANGE_SCALE[filter.range === "custom" ? "quarter" : filter.range];
}

function scaleValue(base: number, filter: DashboardDateFilter): string {
  return String(Math.max(1, Math.round(base * getScale(filter))));
}

function getRangeLabel(filter: DashboardDateFilter): string {
  switch (filter.range) {
    case "today":
      return "Today's operational snapshot.";
    case "week":
      return "Last 7 days performance.";
    case "month":
      return "Current month performance.";
    case "year":
      return "Year-to-date performance.";
    case "custom":
      return "Custom date range performance.";
    default:
      return "Current fiscal quarter performance.";
  }
}

function mapCeStatus(status: string): RecentOrder["status"] {
  switch (status) {
    case "IN_TRANSIT":
      return "DISPATCHED";
    case "HUB_PROCESSING":
      return "AWAITING HUB";
    case "DELIVERED":
      return "DELIVERED";
    case "ACTIVE":
      return "PROCESSING";
    default:
      return "PROCESSING";
  }
}

function computePendingDispatches(filter: DashboardDateFilter): number {
  const baseCount = computePendingDispatchCount(DISPATCH_LOG_LIST);
  return Math.max(1, Math.round(baseCount * getScale(filter)));
}

function buildRecentOrders(): RecentOrder[] {
  return CE_ORDERS.slice(0, 10).map((order) => {
    const hub = CE_HUBS.find((h) => h.id === order.hubId);
    const paymentPending = order.paymentMethod === "CREDIT";

    return {
      id: order.id,
      orderId: `#${order.orderNumber}`,
      customer: order.company || order.customerName,
      source: order.orderSource === "EXECUTIVE" ? "Exec" : "App",
      assignedHub: hub?.name ?? "Unassigned",
      paymentStatus: paymentPending ? "PENDING" : "PAID",
      status: mapCeStatus(order.status),
      href: NAV_FILTER_PRESETS.orderDetail(order.id),
      recordId: order.id,
      customerId: order.customerId,
      hubId: order.hubId,
    };
  });
}

export interface ExecutiveDashboardData {
  statCards: StatCardData[];
  pendingActions: PendingAction[];
  quickActions: QuickActionItem[];
  recentOrders: RecentOrder[];
  notifications: DashboardNotification[];
}

export function fetchExecutiveDashboardData(
  filter: DashboardDateFilter = { range: "quarter" },
): ExecutiveDashboardData {
  const subtext = getRangeLabel(filter);
  const activeUsers = scaleValue(90, filter);
  const totalOrders = scaleValue(160, filter);
  const totalHubs = "48";
  const ordersInTransit = "38";

  return {
    statCards: [
      {
        label: "TOTAL ORDERS",
        value: totalOrders,
        subtext,
        href: NAV_FILTER_PRESETS.ordersAll(),
        icon: Package,
        iconContainerClassName: "bg-blue-50",
        iconClassName: "text-blue-600",
      },
      {
        label: "ACTIVE USERS",
        value: activeUsers,
        subtext: "Growth across contractor profiles.",
        href: ROUTES.USER_MANAGEMENT,
        icon: Users,
        iconContainerClassName: "bg-emerald-50",
        iconClassName: "text-emerald-600",
      },
      {
        label: "TOTAL HUBS",
        value: totalHubs,
        subtext: "8 Central, 40 Regional Sub-hubs.",
        href: ROUTES.SUB_HUB_NETWORK,
        icon: Building2,
        iconContainerClassName: "bg-violet-50",
        iconClassName: "text-violet-600",
      },
      {
        label: "ORDERS IN TRANSIT",
        value: ordersInTransit,
        subtext: "Orders currently moving to customers",
        href: NAV_FILTER_PRESETS.ordersInTransitAlias(),
        icon: Truck,
        iconContainerClassName: "bg-orange-50",
        iconClassName: "text-primary",
      },
    ],
    pendingActions: [
      {
        id: "exec-orders",
        title: "Customer Exec Orders",
        subtitle: "New orders to review",
        count: Math.max(1, Math.round(21 * getScale(filter))),
        priority: "medium",
        href: NAV_FILTER_PRESETS.ordersBySourceAlias("customer-executive"),
        icon: ClipboardList,
      },
      {
        id: "warehouse-requests",
        title: "Warehouse Requests",
        subtitle: "Awaiting warehouse action",
        count: Math.max(1, Math.round(15 * getScale(filter))),
        priority: "medium",
        href: NAV_FILTER_PRESETS.hubRequisitions(),
        icon: Warehouse,
      },
      {
        id: "pending-dispatches",
        title: "Pending Dispatches",
        subtitle: "Waiting to leave hubs",
        count: computePendingDispatches(filter),
        priority: "high",
        href: NAV_FILTER_PRESETS.pendingDispatchLogs(),
        icon: Truck,
      },
      {
        id: "customer-payments",
        title: "Pending Customer Payments",
        subtitle: "Collections outstanding",
        count: Math.max(1, Math.round(12 * getScale(filter))),
        priority: "high",
        href: NAV_FILTER_PRESETS.financePayments(),
        icon: IndianRupee,
      },
    ],
    quickActions: [
      {
        id: "add-hub",
        label: "Add New Hub",
        href: ROUTES.SUB_HUB_ADD,
        iconName: "building",
      },
      {
        id: "add-user",
        label: "Add User",
        href: ROUTES.USER_ONBOARDING,
        iconName: "user-plus",
      },
      {
        id: "raise-order",
        label: "Raise Order",
        href: NAV_FILTER_PRESETS.raiseOrder(),
        iconName: "shopping-cart",
      },
      {
        id: "register-customer",
        label: "Register Customer",
        href: NAV_FILTER_PRESETS.registerCustomer(),
        iconName: "user-check",
      },
      {
        id: "add-product",
        label: "Add Product",
        href: NAV_FILTER_PRESETS.addProduct(),
        iconName: "package",
      },
      {
        id: "assign-dispatch",
        label: "Assign Dispatch",
        href: NAV_FILTER_PRESETS.assignDispatch(),
        iconName: "truck",
      },
    ],
    recentOrders: buildRecentOrders(),
    notifications: [
      {
        id: "notif-1",
        type: "hub_created",
        title: "New Hub Created",
        description: "Jaipur West sub-hub registered and awaiting activation.",
        time: "12 mins ago",
        isUnread: true,
        href: `${ROUTES.SUB_HUB_NETWORK}/hub-jaipur-west`,
      },
      {
        id: "notif-2",
        type: "payment_received",
        title: "Payment Received",
        description: `₹4.2L received from ${CE_CUSTOMERS[0]?.company ?? "Ravi Teja Const."} for order #${CE_ORDERS[0]?.orderNumber ?? "BQ-9402"}.`,
        time: "1 hour ago",
        isUnread: true,
        href: CE_ORDERS[0]
          ? NAV_FILTER_PRESETS.orderDetail(CE_ORDERS[0].id)
          : NAV_FILTER_PRESETS.paymentsPending(),
      },
      {
        id: "notif-3",
        type: "customer_registered",
        title: "Customer Registered",
        description: "Skyline Infra onboarded via Customer Executive portal.",
        time: "2 hours ago",
        isUnread: false,
        href: CE_CUSTOMERS[2]
          ? NAV_FILTER_PRESETS.customerDetail(CE_CUSTOMERS[2].id)
          : NAV_FILTER_PRESETS.registerCustomer(),
      },
      {
        id: "notif-4",
        type: "hub_accepted",
        title: "Hub Accepted Order",
        description: `Gurgaon Central accepted order #${CE_ORDERS[0]?.orderNumber ?? "BQ-9402"} for dispatch.`,
        time: "3 hours ago",
        isUnread: false,
        href: CE_ORDERS[0]
          ? NAV_FILTER_PRESETS.orderDetail(CE_ORDERS[0].id)
          : NAV_FILTER_PRESETS.ordersAll(),
      },
      {
        id: "notif-5",
        type: "dispatch_started",
        title: "Dispatch Started",
        description: "Truck BQ-TR-482 departed Mumbai West for Skyline Infra.",
        time: "4 hours ago",
        isUnread: false,
        href: `${ROUTES.LOGISTICS}/tracking`,
      },
      {
        id: "notif-6",
        type: "low_stock",
        title: "Critical Stock Alert",
        description: "Concrete Additives running low at Noida North Hub.",
        time: "5 hours ago",
        isUnread: true,
        href: `${ROUTES.SUB_HUB_NETWORK}/inventory?hub=hub-noida-62`,
      },
    ],
  };
}

export const DASHBOARD_DATE_RANGE_LABELS: Record<DashboardDateRange, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
  custom: "Custom Range",
};
