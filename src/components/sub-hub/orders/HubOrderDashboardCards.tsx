"use client";

import {
  Ban,
  CheckCircle2,
  Clock,
  IndianRupee,
  Package,
  ShoppingBag,
  Timer,
  Truck,
  XCircle,
} from "lucide-react";

import { HubOrderMetricCard } from "@/components/sub-hub/orders/HubOrderMetricCard";
import type { HubOrderDashboard, HubOrderTab } from "@/types/hub-orders.types";
import { formatCurrency } from "@/utils/format-currency";

interface HubOrderDashboardCardsProps {
  dashboard?: HubOrderDashboard;
  isLoading?: boolean;
  onFilterTab?: (tab: HubOrderTab) => void;
  activeTab?: HubOrderTab;
}

export function HubOrderDashboardCards({
  dashboard,
  isLoading,
  onFilterTab,
  activeTab,
}: HubOrderDashboardCardsProps) {
  const cards = [
    {
      id: "total" as const,
      label: "Total Orders",
      metric: dashboard?.totalOrders,
      icon: ShoppingBag,
      tab: "all" as HubOrderTab,
    },
    {
      id: "active",
      label: "Active Orders",
      metric: dashboard?.activeOrders,
      icon: Package,
      tab: "active" as HubOrderTab,
    },
    {
      id: "completed",
      label: "Completed Orders",
      metric: dashboard?.completedOrders,
      icon: CheckCircle2,
      tab: "completed" as HubOrderTab,
    },
    {
      id: "cancelled",
      label: "Cancelled Orders",
      metric: dashboard?.cancelledOrders,
      icon: XCircle,
      tab: "cancelled" as HubOrderTab,
    },
    {
      id: "today",
      label: "Today's Orders",
      metric: dashboard?.todaysOrders,
      icon: Clock,
      tab: "all" as HubOrderTab,
    },
    {
      id: "pending-dispatch",
      label: "Pending Dispatch",
      metric: dashboard?.ordersPendingDispatch,
      icon: Package,
      tab: "pending_dispatch" as HubOrderTab,
    },
    {
      id: "out-for-delivery",
      label: "Out For Delivery",
      metric: dashboard?.ordersOutForDelivery,
      icon: Truck,
      tab: "out_for_delivery" as HubOrderTab,
    },
    {
      id: "delivered-today",
      label: "Delivered Today",
      metric: dashboard?.deliveredToday,
      icon: CheckCircle2,
      tab: "completed" as HubOrderTab,
    },
    {
      id: "total-revenue",
      label: "Total Revenue",
      metric: dashboard?.totalRevenue,
      icon: IndianRupee,
      formatValue: (v: number) => formatCurrency(v),
    },
    {
      id: "pending-revenue",
      label: "Pending Revenue",
      metric: dashboard?.pendingRevenue,
      icon: Ban,
      formatValue: (v: number) => formatCurrency(v),
    },
    {
      id: "avg-delivery",
      label: "Avg Delivery Time",
      metric: dashboard?.averageDeliveryTimeHours,
      icon: Timer,
      formatValue: (v: number) => (v > 0 ? `${v}h` : "—"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      {cards.map((card, index) => (
        <HubOrderMetricCard
          key={card.id}
          label={card.label}
          metric={card.metric ?? { value: 0, change: 0, changePercent: 0 }}
          icon={card.icon}
          formatValue={card.formatValue}
          isLoading={isLoading}
          index={index}
          isActive={card.tab ? activeTab === card.tab : false}
          onClick={
            card.tab && onFilterTab ? () => onFilterTab(card.tab!) : undefined
          }
        />
      ))}
    </div>
  );
}
