import {
  Award,
  ClipboardList,
  Crown,
  IndianRupee,
  MessageSquareQuote,
  Package,
  Truck,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { ROUTES } from "@/constants/routes";
import {
  computeActiveCustomers,
  computeOrdersInTransit,
  computeQuarterRevenue,
  computeTotalOrders,
  formatCompactRupee,
  getExecutiveKpiOrderPool,
} from "@/features/dashboard/utils/executive-kpi-metrics";
import type {
  CustomerFeaturesDashboardData,
  DashboardDateFilter,
  DashboardDateRange,
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
import {
  computeMembershipStats,
  MOCK_MEMBERSHIPS,
} from "@/mock/mockMemberships";
import {
  computeWalletStats,
  MOCK_WALLET_REFUNDS,
  MOCK_WALLET_TRANSACTIONS,
} from "@/mock/mockWallet";
import { MOCK_LOYALTY_CUSTOMERS } from "@/mock/mockLoyalty";
import {
  computeBulkProcurementStats,
  MOCK_BULK_PROCUREMENT,
} from "@/mock/mockBulkProcurement";
import {
  computeTestimonialStats,
  MOCK_TESTIMONIALS,
} from "@/mock/mockTestimonials";
import { formatCurrency } from "@/utils/format-currency";

export type {
  DashboardDateFilter,
  DashboardDateRange,
} from "@/features/dashboard/types/dashboard.types";

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
  customerFeatureCards: StatCardData[];
  pendingActions: PendingAction[];
  quickActions: QuickActionItem[];
  recentOrders: RecentOrder[];
  notifications: DashboardNotification[];
  customerFeatures: CustomerFeaturesDashboardData;
}

export function fetchExecutiveDashboardData(
  filter: DashboardDateFilter = { range: "quarter" },
): ExecutiveDashboardData {
  const kpiOrders = getExecutiveKpiOrderPool();
  const totalOrders = computeTotalOrders(kpiOrders, filter);
  const ordersInTransit = computeOrdersInTransit(kpiOrders, filter);
  const quarterRevenue = computeQuarterRevenue(kpiOrders, filter);
  const activeCustomers = computeActiveCustomers(kpiOrders, filter);

  const membershipStats = computeMembershipStats(MOCK_MEMBERSHIPS);
  const walletStats = computeWalletStats(
    MOCK_WALLET_TRANSACTIONS,
    MOCK_WALLET_REFUNDS,
  );
  const bulkStats = computeBulkProcurementStats(MOCK_BULK_PROCUREMENT);
  const testimonialStats = computeTestimonialStats(MOCK_TESTIMONIALS);

  return {
    statCards: [
      {
        label: "Total Orders",
        value: String(totalOrders),
        subtext: getRangeLabel(filter),
        href: NAV_FILTER_PRESETS.ordersAll(),
        icon: Package,
        iconContainerClassName: "bg-blue-50",
        iconClassName: "text-blue-600",
      },
      {
        label: "Orders In Transit",
        value: String(ordersInTransit),
        subtext: "Orders currently moving to customers",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
        icon: Truck,
        iconContainerClassName: "bg-orange-50",
        iconClassName: "text-primary",
      },
      {
        label: "Revenue This Quarter",
        value: formatCompactRupee(quarterRevenue),
        subtext: "GMV generated this quarter",
        href: NAV_FILTER_PRESETS.financePayments(),
        icon: IndianRupee,
        iconContainerClassName: "bg-emerald-50",
        iconClassName: "text-emerald-600",
      },
      {
        label: "Active Customers",
        value: String(activeCustomers),
        subtext: "Customers purchasing this quarter",
        href: ROUTES.CUSTOMER_EXECUTIVE_CUSTOMERS,
        icon: Users,
        iconContainerClassName: "bg-emerald-50",
        iconClassName: "text-emerald-600",
      },
    ],
    customerFeatureCards: [
      {
        label: "Membership Revenue",
        value: formatCompactRupee(membershipStats.membershipRevenue),
        subtext: `${membershipStats.activeMemberships} active memberships`,
        href: ROUTES.USER_MANAGEMENT_MEMBERSHIP_PLANS,
        icon: Crown,
        iconContainerClassName: "bg-orange-50",
        iconClassName: "text-primary",
      },
      {
        label: "Wallet Balance",
        value: formatCompactRupee(walletStats.totalWalletBalance),
        subtext: `${walletStats.transactionsToday} transactions today`,
        href: ROUTES.FINANCE_CUSTOMER_WALLET,
        icon: Wallet,
        iconContainerClassName: "bg-blue-50",
        iconClassName: "text-blue-600",
      },
      {
        label: "Loyalty Members",
        value: String(MOCK_LOYALTY_CUSTOMERS.length),
        subtext: "Enrolled in loyalty program",
        href: ROUTES.USER_MANAGEMENT_CUSTOMER_LOYALTY,
        icon: Award,
        iconContainerClassName: "bg-purple-50",
        iconClassName: "text-purple-600",
      },
      {
        label: "Bulk Procurement Leads",
        value: String(bulkStats.openRequests + bulkStats.assigned),
        subtext: formatCompactRupee(bulkStats.revenuePotential) + " pipeline",
        href: ROUTES.CUSTOMER_EXECUTIVE_BULK_PROCUREMENT,
        icon: ClipboardList,
        iconContainerClassName: "bg-amber-50",
        iconClassName: "text-amber-600",
      },
      {
        label: "Customer Testimonials",
        value: String(testimonialStats.published),
        subtext: `${testimonialStats.draft} drafts pending`,
        href: ROUTES.CUSTOMER_APP_CMS_TESTIMONIALS,
        icon: MessageSquareQuote,
        iconContainerClassName: "bg-green-50",
        iconClassName: "text-green-600",
      },
    ],
    customerFeatures: {
      membershipRevenue: formatCurrency(membershipStats.membershipRevenue),
      walletBalance: formatCurrency(walletStats.totalWalletBalance),
      loyaltyMembers: MOCK_LOYALTY_CUSTOMERS.length,
      bulkProcurementLeads: bulkStats.openRequests + bulkStats.assigned,
      testimonialCount: testimonialStats.published,
      recentMembershipPurchases: [...MOCK_MEMBERSHIPS]
        .sort(
          (a, b) =>
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime(),
        )
        .slice(0, 5)
        .map((m) => ({
          id: m.id,
          customer: m.customerName,
          plan: m.membership,
          amount: formatCurrency(m.amount),
          date: m.purchaseDate,
          href: ROUTES.USER_MANAGEMENT_MEMBERSHIP_PLANS,
        })),
      latestWalletRefunds: [...MOCK_WALLET_REFUNDS]
        .sort(
          (a, b) =>
            new Date(b.requestedDate).getTime() -
            new Date(a.requestedDate).getTime(),
        )
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          customer: r.customerName,
          orderNumber: r.orderNumber,
          amount: formatCurrency(r.amount),
          status: r.status,
          date: r.requestedDate,
          href: ROUTES.FINANCE_CUSTOMER_WALLET,
        })),
      bulkLeads: [...MOCK_BULK_PROCUREMENT]
        .filter((r) => r.status === "OPEN" || r.status === "ASSIGNED")
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          company: r.company,
          project: r.project,
          value: formatCurrency(r.expectedOrderValue),
          status: r.status,
          href: ROUTES.CUSTOMER_EXECUTIVE_BULK_PROCUREMENT,
        })),
      latestTestimonials: [...MOCK_TESTIMONIALS]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 4)
        .map((t) => ({
          id: t.id,
          customerName: t.customerName,
          city: t.city,
          type: t.type,
          rating: t.rating,
          review: t.review,
          mediaUrl: t.thumbnailUrl ?? t.mediaUrl,
          status: t.status,
          href: ROUTES.CUSTOMER_APP_CMS_TESTIMONIALS,
        })),
    },
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
