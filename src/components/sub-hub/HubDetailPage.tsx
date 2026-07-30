"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { HubActivityTimeline } from "@/components/sub-hub/HubActivityTimeline";
import { HubInventoryOverviewTable } from "@/components/sub-hub/HubInventoryOverviewTable";
import { HubManagerCard } from "@/components/sub-hub/HubManagerCard";
import { HubPerformanceStrip } from "@/components/sub-hub/HubPerformanceStrip";
import { HubProfileHeader } from "@/components/sub-hub/HubProfileHeader";
import { HubProfileKpiGrid } from "@/components/sub-hub/HubProfileKpiGrid";
import { HubCustomerOrdersPanel } from "@/components/sub-hub/orders/HubCustomerOrdersPanel";
import { HubOrderAnalyticsSection } from "@/components/sub-hub/orders/HubOrderAnalyticsSection";
import { HubOrderDashboardCards } from "@/components/sub-hub/orders/HubOrderDashboardCards";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  SubModuleTabs,
  type SubModuleTab,
} from "@/components/shared/SubModuleTabs";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { hubsService } from "@/services/hubs.service";
import { hubOrdersService } from "@/services/hubOrders.service";
import type {
  HubActivityEvent,
  SubHub,
  SubHubOperationalStatus,
} from "@/types/erp.types";
import type { HubOrderTab } from "@/types/hub-orders.types";
import type {
  HubInventoryRow,
  HubManagerProfile,
  HubPerformanceKpis,
  HubProfileKpiCards,
} from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubDetailPageProps {
  hubId: string;
  initialTab?: string;
}

type HubPageTab = "overview" | "orders";

const HUB_DETAIL_TABS: SubModuleTab[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Customer Orders" },
];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

function formatStockValue(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function resolvePageTab(initialTab?: string): HubPageTab {
  if (initialTab === "orders" || initialTab === "customer-orders")
    return "orders";
  return "overview";
}

function resolveOrderTab(initialTab?: string): HubOrderTab | undefined {
  const orderTabs: HubOrderTab[] = [
    "all",
    "active",
    "completed",
    "cancelled",
    "pending_dispatch",
    "out_for_delivery",
  ];
  if (initialTab && orderTabs.includes(initialTab as HubOrderTab)) {
    return initialTab as HubOrderTab;
  }
  return undefined;
}

export function HubDetailPage({ hubId, initialTab }: HubDetailPageProps) {
  const [activePageTab, setActivePageTab] = useState<HubPageTab>(
    resolvePageTab(initialTab),
  );
  const [orderFilterTab, setOrderFilterTab] = useState<HubOrderTab | undefined>(
    resolveOrderTab(initialTab),
  );

  const hubQuery = useQuery({
    queryKey: ["admin-hubs", hubId],
    queryFn: () => hubsService.getById(hubId),
    refetchInterval: 15_000,
  });

  const inventoryQuery = useQuery({
    queryKey: ["admin-hubs", hubId, "inventory"],
    queryFn: () => hubsService.getInventory(hubId),
    refetchInterval: 15_000,
  });

  const performanceQuery = useQuery({
    queryKey: ["admin-hubs", hubId, "performance"],
    queryFn: () => hubsService.getPerformance(hubId),
    refetchInterval: 15_000,
  });

  const orderDashboardQuery = useQuery({
    queryKey: ["hub-orders-dashboard", hubId],
    queryFn: () => hubOrdersService.getDashboard(hubId),
    refetchInterval: 10_000,
  });

  const orderAnalyticsQuery = useQuery({
    queryKey: ["hub-orders-analytics", hubId],
    queryFn: () => hubOrdersService.getAnalytics(hubId),
    refetchInterval: 10_000,
  });

  const isLoading = hubQuery.isLoading;
  const detail = hubQuery.data;
  const inventory = inventoryQuery.data;
  const performanceRaw = performanceQuery.data as
    | {
        todaysOrders?: number;
        dispatchTime?: number;
        fulfillmentPercent?: number;
        monthlyOrders?: number;
      }
    | undefined;

  const hub: SubHub | null = useMemo(() => {
    if (!detail) return null;
    return {
      id: detail.id,
      name: detail.name,
      city: detail.city,
      region: detail.state,
      managerName:
        detail.manager?.fullName || detail.manager?.name || "Unassigned",
      nodeId: detail.code,
      isActive: detail.isActive,
      lastInventorySync: detail.updatedAt,
      address: detail.address || detail.addressLine1,
      managerPhone: detail.manager?.phone ?? undefined,
      managerEmail: detail.manager?.email ?? undefined,
      hubSince: detail.createdAt,
      capacityMt: detail.capacity ?? undefined,
      workingHours: detail.workingHours ?? undefined,
      hubType: detail.hubType ?? undefined,
      coverageRadiusKm: detail.serviceRadiusKm,
      linkedWarehouseName: detail.warehouseCode ?? undefined,
      servicePincodes: detail.coveragePincodes,
    };
  }, [detail]);

  const operationalStatus: SubHubOperationalStatus = useMemo(() => {
    if (!detail) return "healthy";
    if (!detail.isActive || detail.operationalStatus !== "ENABLED") {
      return "critical";
    }
    if ((inventory?.lowStock ?? 0) > 0 || (inventory?.outOfStock ?? 0) > 0) {
      return "warning";
    }
    return "healthy";
  }, [detail, inventory]);

  const topKpis: HubProfileKpiCards | null = useMemo(() => {
    if (!detail) return null;
    const dashboard = orderDashboardQuery.data;
    const inventoryValue = inventory?.stockValue ?? 0;
    return {
      inventoryValue,
      inventoryValueLabel: formatStockValue(inventoryValue),
      customerOrdersPending:
        dashboard?.activeOrders.value ?? detail.pendingOrders ?? 0,
      pendingRequisitions: 0,
      incomingTransfers: 0,
    };
  }, [detail, inventory, orderDashboardQuery.data]);

  const performance: HubPerformanceKpis | null = useMemo(() => {
    if (!detail) return null;
    const dashboard = orderDashboardQuery.data;
    return {
      todaysOrders:
        dashboard?.todaysOrders.value ?? performanceRaw?.todaysOrders ?? 0,
      todaysDispatches: dashboard?.ordersOutForDelivery.value ?? 0,
      incomingTransfers: 0,
      pendingRequisitions: 0,
    };
  }, [detail, performanceRaw, orderDashboardQuery.data]);

  const inventoryRows: HubInventoryRow[] = useMemo(() => {
    const items = (inventory?.items ?? []) as Array<{
      productId: string;
      product?: { name?: string; sku?: string | null; unit?: string };
      availableStock: number;
      reservedStock: number;
      lowStock: boolean;
      lowStockThreshold?: number;
      lastUpdated?: string;
    }>;

    return items.map((item) => {
      const availableQty = item.availableStock ?? 0;
      const reservedQty = item.reservedStock ?? 0;
      const status =
        availableQty <= 0
          ? ("out-of-stock" as const)
          : item.lowStock
            ? ("low-stock" as const)
            : ("healthy" as const);

      return {
        materialId: item.productId,
        materialName: item.product?.name || "Product",
        sku: item.product?.sku || item.productId.slice(0, 8),
        category: "Catalog",
        availableQty,
        reservedQty,
        freeQty: availableQty,
        incomingQty: 0,
        outgoingQty: 0,
        reorderLevel: item.lowStockThreshold ?? 10,
        safetyStock: item.lowStockThreshold ?? 10,
        unit: item.product?.unit || "unit",
        unitPrice: 0,
        inventoryValue: 0,
        status,
        lastUpdated: item.lastUpdated,
        recommendedQty: Math.max(
          0,
          (item.lowStockThreshold ?? 10) - availableQty,
        ),
      };
    });
  }, [inventory]);

  const managerProfile: HubManagerProfile | null = useMemo(() => {
    if (!hub || !detail) return null;
    const dashboard = orderDashboardQuery.data;
    return {
      name: hub.managerName,
      phone: hub.managerPhone || "—",
      email: hub.managerEmail || "—",
      hubSinceLabel: hub.hubSince
        ? new Date(hub.hubSince).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
      capacityLabel: hub.capacityMt ? `${hub.capacityMt} MT` : "—",
      storageUtilization: inventory?.inventoryHealth ?? 80,
      workingHours: hub.workingHours || "—",
      activeOrders: dashboard?.activeOrders.value ?? detail.pendingOrders ?? 0,
      performanceScore: performanceRaw?.fulfillmentPercent ?? 90,
    };
  }, [hub, detail, inventory, performanceRaw, orderDashboardQuery.data]);

  const activityEvents: HubActivityEvent[] = useMemo(() => {
    if (!detail) return [];
    return [
      {
        id: `hub-created-${detail.id}`,
        category: "inventory",
        title: "Hub provisioned",
        description: `${detail.name} (${detail.code}) is active in the network.`,
        timestamp: detail.createdAt,
      },
    ];
  }, [detail]);

  const handleDashboardTabFilter = (tab: HubOrderTab) => {
    setOrderFilterTab(tab);
    setActivePageTab("orders");
  };

  if (hubQuery.isError) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Hub Not Found"
          subtitle="This hub may have been merged. Open All Sub-Hubs and select the active Kalyani Hub."
        />
        <EmptyState
          title="Hub unavailable"
          description="Return to the network dashboard and open the live Kalyani Hub (HUB-KAL-001)."
          icon={<MapPin className="size-8" />}
        />
        <Link
          href={ROUTES.SUB_HUB_NETWORK}
          className={buttonVariants({ variant: "default" })}
        >
          Back to All Sub-Hubs
        </Link>
      </div>
    );
  }

  if (!hub || !topKpis || !performance || !managerProfile) {
    return (
      <div className="space-y-6 pb-8">
        <PageHeader title="Loading hub…" subtitle="Fetching live hub data" />
        <HubOrderDashboardCards isLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <HubProfileHeader hub={hub} status={operationalStatus} />

      <SubModuleTabs
        backHref={ROUTES.SUB_HUB_NETWORK}
        backLabel="All Sub-Hubs"
        tabs={HUB_DETAIL_TABS}
        activeTab={activePageTab}
        onTabChange={(tabId) => setActivePageTab(tabId as HubPageTab)}
      />

      {activePageTab === "overview" ? (
        <>
          <motion.div {...fadeUp}>
            <HubOrderDashboardCards
              dashboard={orderDashboardQuery.data}
              isLoading={orderDashboardQuery.isLoading}
              activeTab={orderFilterTab}
              onFilterTab={handleDashboardTabFilter}
            />
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
            <HubOrderAnalyticsSection
              analytics={orderAnalyticsQuery.data}
              isLoading={orderAnalyticsQuery.isLoading}
            />
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
            <HubProfileKpiGrid kpis={topKpis} isLoading={isLoading} />
          </motion.div>

          <HubPerformanceStrip kpis={performance} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <motion.div className="xl:col-span-4" {...fadeUp}>
              <HubManagerCard profile={managerProfile} />
            </motion.div>

            <motion.div
              className="xl:col-span-8"
              {...fadeUp}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <HubInventoryOverviewTable hubId={hubId} rows={inventoryRows} />
            </motion.div>
          </div>

          <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.08 }}>
            <DashboardCard title="Recent Activity" contentClassName="mt-5">
              <HubActivityTimeline
                events={activityEvents}
                isLoading={isLoading}
              />
            </DashboardCard>
          </motion.div>
        </>
      ) : (
        <motion.div {...fadeUp}>
          <HubCustomerOrdersPanel
            hubId={hubId}
            hubCode={hub.nodeId}
            initialTab={orderFilterTab}
          />
        </motion.div>
      )}

      <div className="flex justify-end">
        <Link
          href={ROUTES.SUB_HUB_NETWORK}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "text-[#64748B]",
          )}
        >
          Back to All Sub-Hubs
        </Link>
      </div>
    </div>
  );
}
