"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  IndianRupee,
  Package,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

import { StatCard } from "@/components/shared/StatCard";
import { CriticalPendingActions } from "@/features/dashboard/components/CriticalPendingActions";
import { CustomerFeaturesSection } from "@/features/dashboard/components/CustomerFeaturesSection";
import { DashboardQuickActions } from "@/features/dashboard/components/DashboardQuickActions";
import { RecentOrdersTable } from "@/features/dashboard/components/RecentOrdersTable";
import type {
  CustomerFeaturesDashboardData,
  DashboardDateFilter,
  PendingAction,
  QuickActionItem,
  RecentOrder,
  StatCardData,
} from "@/features/dashboard/types/dashboard.types";
import { mapDashboardPaymentStatus } from "@/features/dashboard/types/dashboard.types";
import type { ExecutiveDashboardData } from "@/mock/executive-dashboard";
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { ROUTES } from "@/constants/routes";
import {
  dashboardService,
  type AdminDashboardPayload,
} from "@/services/dashboard";
import { formatCurrency } from "@/utils/format-currency";
import { formatCompactRupee } from "@/features/dashboard/utils/executive-kpi-metrics";

interface OperationsDashboardProps {
  dateFilter?: DashboardDateFilter;
}

function mapBackendStatus(status: string): RecentOrder["status"] {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED":
      return "DELIVERED";
    case "DRIVER_ASSIGNED":
    case "OUT_FOR_DELIVERY":
    case "DISPATCHED":
      return "DISPATCHED";
    case "PENDING":
    case "CONFIRMED":
    case "HUB_ASSIGNED":
    case "AWAITING_HUB_ALLOCATION":
      return "AWAITING HUB";
    case "ACCEPTED_BY_HUB":
    case "PICKING":
    case "PACKED":
    case "PROCESSING":
    case "READY_FOR_DISPATCH":
    case "CANCELLED":
    default:
      return "PROCESSING";
  }
}

function buildLiveDashboard(
  payload: AdminDashboardPayload,
): ExecutiveDashboardData {
  const orders = payload.orders;
  const revenue = Number(payload.revenue.total ?? 0);
  const processingCount = orders.accepted ?? orders.processing;
  const completedCount = orders.delivered ?? orders.completed;

  const statCards: StatCardData[] = [
    {
      label: "Orders Today",
      value: String(orders.today),
      subtext: "Created today",
      href: NAV_FILTER_PRESETS.ordersAll(),
      icon: Package,
      iconContainerClassName: "bg-blue-50",
      iconClassName: "text-blue-600",
    },
    {
      label: "Orders Pending",
      value: String(orders.pending),
      subtext: "Awaiting hub action",
      valueVariant: orders.pending > 0 ? "warning" : "default",
      href: NAV_FILTER_PRESETS.ordersByStatus("ACTIVE"),
      icon: Truck,
      iconContainerClassName: "bg-orange-50",
      iconClassName: "text-primary",
    },
    {
      label: "Processing",
      value: String(processingCount),
      subtext: "Accepted / packing",
      href: NAV_FILTER_PRESETS.ordersByStatus("HUB_PROCESSING"),
      icon: Warehouse,
      iconContainerClassName: "bg-amber-50",
      iconClassName: "text-amber-600",
    },
    {
      label: "Ready To Dispatch",
      value: String(orders.readyToDispatch),
      subtext: "Out for delivery bucket",
      href: NAV_FILTER_PRESETS.ordersInTransit(),
      icon: Truck,
      iconContainerClassName: "bg-emerald-50",
      iconClassName: "text-emerald-600",
    },
  ];

  const customerFeatureCards: StatCardData[] = [
    {
      label: "Completed",
      value: String(completedCount),
      subtext: "Delivered orders",
      href: NAV_FILTER_PRESETS.ordersByStatus("DELIVERED"),
      icon: Package,
      iconContainerClassName: "bg-green-50",
      iconClassName: "text-green-600",
    },
    {
      label: "Cancelled",
      value: String(orders.cancelled),
      subtext: "Cancelled orders",
      href: NAV_FILTER_PRESETS.ordersByStatus("CANCELLED"),
      icon: ClipboardList,
      iconContainerClassName: "bg-red-50",
      iconClassName: "text-red-500",
    },
    {
      label: "Total Revenue",
      value: formatCompactRupee(revenue),
      subtext: "Delivered GMV",
      href: NAV_FILTER_PRESETS.financePayments(),
      icon: IndianRupee,
      iconContainerClassName: "bg-emerald-50",
      iconClassName: "text-emerald-600",
    },
    {
      label: "Active Customers",
      value: String(payload.customers.total),
      subtext: "Registered customers",
      href: ROUTES.CUSTOMER_EXECUTIVE_CUSTOMERS,
      icon: Users,
      iconContainerClassName: "bg-blue-50",
      iconClassName: "text-blue-600",
    },
  ];

  const pendingActions: PendingAction[] = [
    {
      id: "pending-orders",
      title: "Orders Pending Hub Action",
      subtitle: "HUB_ASSIGNED / awaiting allocation",
      count: orders.pending,
      priority: orders.pending > 0 ? "high" : "medium",
      href: NAV_FILTER_PRESETS.ordersByStatus("ACTIVE"),
      icon: Package,
    },
    {
      id: "ready-dispatch",
      title: "Ready To Dispatch",
      subtitle: "Driver assigned / out for delivery",
      count: orders.readyToDispatch,
      priority: orders.readyToDispatch > 0 ? "high" : "medium",
      href: NAV_FILTER_PRESETS.ordersInTransit(),
      icon: Truck,
    },
    {
      id: "emergency",
      title: "Emergency Orders",
      subtitle: "Needs immediate attention",
      count: payload.emergencyOrders.total,
      priority: payload.emergencyOrders.total > 0 ? "high" : "medium",
      href: ROUTES.CUSTOMER_EXECUTIVE,
      icon: Warehouse,
    },
  ];

  const quickActions: QuickActionItem[] = [
    {
      id: "place-order",
      label: "Place Order",
      href: ROUTES.CUSTOMER_EXECUTIVE_ORDERS_NEW,
      iconName: "shopping-cart",
    },
    {
      id: "view-orders",
      label: "View Orders",
      href: ROUTES.CUSTOMER_EXECUTIVE_ORDERS,
      iconName: "package",
    },
    {
      id: "customers",
      label: "Customers",
      href: ROUTES.CUSTOMER_EXECUTIVE_CUSTOMERS,
      iconName: "user-check",
    },
    {
      id: "hubs",
      label: "Hubs",
      href: ROUTES.SUB_HUB_NETWORK,
      iconName: "building",
    },
  ];

  const recentOrders: RecentOrder[] = (payload.recentOrders ?? []).map(
    (order) => ({
      id: order.id,
      orderId: `#${order.orderNumber}`,
      customer: order.customer?.fullName || "Customer",
      source: "App",
      assignedHub: order.hub?.name ?? "Unassigned",
      paymentStatus: mapDashboardPaymentStatus(order.paymentStatus),
      status: mapBackendStatus(order.orderStatus),
      href: NAV_FILTER_PRESETS.orderDetail(order.id),
      recordId: order.id,
      customerId: order.customer?.id,
      hubId: order.hub?.id,
    }),
  );

  const customerFeatures: CustomerFeaturesDashboardData = {
    membershipRevenue: formatCurrency(0),
    loyaltyMembers: payload.loyalty.totalPointsIssued,
    bulkProcurementLeads: payload.bulkProcurement.total,
    testimonialCount: payload.cms.testimonials,
    recentMembershipPurchases: [],
    latestRefunds: [],
    bulkLeads: [],
    latestTestimonials: [],
  };

  return {
    statCards,
    customerFeatureCards,
    pendingActions,
    quickActions,
    recentOrders,
    notifications: [],
    customerFeatures,
  };
}

const EMPTY_DASHBOARD: ExecutiveDashboardData = {
  statCards: [],
  customerFeatureCards: [],
  pendingActions: [],
  quickActions: [],
  recentOrders: [],
  notifications: [],
  customerFeatures: {
    membershipRevenue: formatCurrency(0),
    loyaltyMembers: 0,
    bulkProcurementLeads: 0,
    testimonialCount: 0,
    recentMembershipPurchases: [],
    latestRefunds: [],
    bulkLeads: [],
    latestTestimonials: [],
  },
};

export function OperationsDashboard({
  dateFilter = { range: "quarter" },
}: OperationsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] =
    useState<ExecutiveDashboardData>(EMPTY_DASHBOARD);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const payload = await dashboardService.getAdminDashboard();
        if (!cancelled) {
          setDashboardData(buildLiveDashboard(payload));
        }
      } catch {
        if (!cancelled) {
          setDashboardData(EMPTY_DASHBOARD);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [dateFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            valueVariant={card.valueVariant}
            href={card.href}
            icon={card.icon}
            iconContainerClassName={card.iconContainerClassName}
            iconClassName={card.iconClassName}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dashboardData.customerFeatureCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            valueVariant={card.valueVariant}
            href={card.href}
            icon={card.icon}
            iconContainerClassName={card.iconContainerClassName}
            iconClassName={card.iconClassName}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-stretch">
        <div className="xl:col-span-2">
          <CriticalPendingActions
            actions={dashboardData.pendingActions}
            isLoading={isLoading}
          />
        </div>

        <DashboardQuickActions
          actions={dashboardData.quickActions}
          isLoading={isLoading}
        />
      </div>

      <RecentOrdersTable
        orders={dashboardData.recentOrders}
        isLoading={isLoading}
      />

      <CustomerFeaturesSection
        data={dashboardData.customerFeatures}
        isLoading={isLoading}
      />
    </div>
  );
}
