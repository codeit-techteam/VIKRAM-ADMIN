"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SubHubStatsCard } from "@/components/sub-hub/SubHubStatsCard";
import { SubHubSummaryCard } from "@/components/sub-hub/SubHubSummaryCard";
import { SubHubTable } from "@/components/sub-hub/SubHubTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hubsService, type AdminHubListItem } from "@/services/hubs.service";
import { useSelectedHubStore } from "@/store/selected-hub-store";
import type {
  SubHubOperationalStatus,
  SubHubStat,
  SubHubSummary,
  SubHubTableRow,
} from "@/types/erp.types";
import { formatHubStockValue } from "@/utils/sub-hub-metrics";

type RegionFilter = "all" | string;
type StatusFilter = "all" | SubHubOperationalStatus;

const STATUS_PRIORITY: Record<SubHubOperationalStatus, number> = {
  critical: 0,
  warning: 1,
  healthy: 2,
};

const DASHBOARD_CARD_LIMIT = 6;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.25 },
};

function mapOperationalStatus(hub: AdminHubListItem): SubHubOperationalStatus {
  if (
    !hub.isActive ||
    hub.operationalStatus !== "ENABLED" ||
    hub.healthStatus === "CRITICAL"
  ) {
    return "critical";
  }
  if (hub.healthStatus === "ATTENTION") return "warning";
  const health = hub.inventoryHealth ?? 100;
  if (health < 50) return "critical";
  if (health < 80) return "warning";
  return "healthy";
}

function toSummary(hub: AdminHubListItem): SubHubSummary {
  const status = mapOperationalStatus(hub);
  const stockValue = hub.stockValue ?? 0;
  return {
    hubId: hub.id,
    name: hub.name,
    city: hub.city,
    managerName: hub.manager?.fullName || hub.manager?.name || "Unassigned",
    stockValue,
    stockValueLabel: formatHubStockValue(stockValue),
    pendingOrders: hub.pendingOrders ?? hub.orderCount ?? 0,
    pendingRequisitions: hub.pendingRequisitions ?? 0,
    incomingTransfers: hub.incomingTransfers ?? 0,
    outgoingTransfers: hub.outgoingTransfers ?? 0,
    inventoryHealth: hub.inventoryHealth ?? (hub.isActive ? 100 : 0),
    healthScore: hub.inventoryHealth ?? (hub.isActive ? 100 : 0),
    lastInventorySync: hub.updatedAt,
    status,
  };
}

function toTableRow(hub: AdminHubListItem): SubHubTableRow {
  const status = mapOperationalStatus(hub);
  return {
    hubId: hub.id,
    name: hub.name,
    nodeId: hub.code,
    managerName: hub.manager?.fullName || hub.manager?.name || "Unassigned",
    city: hub.city,
    region: hub.state,
    inventoryHealth: hub.inventoryHealth ?? (hub.isActive ? 100 : 0),
    healthScore: hub.inventoryHealth ?? (hub.isActive ? 100 : 0),
    pendingOrders: hub.pendingOrders ?? hub.orderCount ?? 0,
    pendingRequisitions: hub.pendingRequisitions ?? 0,
    incomingTransfers: hub.incomingTransfers ?? 0,
    outgoingTransfers: hub.outgoingTransfers ?? 0,
    transfersInTransit: hub.incomingTransfers ?? 0,
    status,
    isActive: hub.isActive,
  };
}

function sortByOperationalPriority(summaries: SubHubSummary[]) {
  return [...summaries].sort((left, right) => {
    const leftActive = left.status === "healthy" ? 0 : 1;
    const rightActive = right.status === "healthy" ? 0 : 1;
    if (leftActive !== rightActive) return leftActive - rightActive;

    const statusDiff =
      STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status];
    if (statusDiff !== 0) return statusDiff;
    return right.pendingOrders - left.pendingOrders;
  });
}

export function SubHubNetworkDashboard() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAllHubs, setShowAllHubs] = useState(false);
  const setSelectedHub = useSelectedHubStore((s) => s.setSelectedHub);

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs", "list"],
    queryFn: () => hubsService.list({ page: 1, limit: 100 }),
    refetchInterval: 15000,
    retry: 2,
  });

  const hubs = hubsQuery.data?.data ?? [];
  const isLoading = hubsQuery.isLoading;
  const loadError = hubsQuery.isError;
  const errorStatus = (() => {
    const err = hubsQuery.error;
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object" &&
      "status" in err.response
    ) {
      return Number((err.response as { status?: number }).status);
    }
    return null;
  })();
  const isAuthError = errorStatus === 401 || errorStatus === 403;

  const regions = useMemo(
    () => Array.from(new Set(hubs.map((hub) => hub.state))).sort(),
    [hubs],
  );

  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => {
      if (regionFilter !== "all" && hub.state !== regionFilter) return false;
      if (
        statusFilter !== "all" &&
        mapOperationalStatus(hub) !== statusFilter
      ) {
        return false;
      }
      return true;
    });
  }, [hubs, regionFilter, statusFilter]);

  const summaries = useMemo(
    () => sortByOperationalPriority(filteredHubs.map(toSummary)),
    [filteredHubs],
  );
  const tableRows = useMemo(() => filteredHubs.map(toTableRow), [filteredHubs]);

  const activeCount = hubs.filter(
    (h) => h.isActive && h.operationalStatus === "ENABLED",
  ).length;
  const totalDrivers = hubs.reduce(
    (sum, h) => sum + (h.activeDrivers ?? h.driverCount ?? 0),
    0,
  );
  const totalOrders = hubs.reduce((sum, h) => sum + (h.orderCount ?? 0), 0);

  const kpis: SubHubStat[] = [
    {
      id: "active-hubs",
      label: "Total Active Hubs",
      value: String(activeCount),
      subtitle: `${hubs.length} hubs in network`,
      icon: "active-hubs",
    },
    {
      id: "inventory-health",
      label: "Network Orders",
      value: String(totalOrders),
      subtitle: "Assigned across hubs",
      icon: "inventory-health",
    },
    {
      id: "pending-requisitions",
      label: "Active Drivers",
      value: String(totalDrivers),
      subtitle: "Fleet capacity",
      icon: "pending-requisitions",
    },
    {
      id: "low-stock-hubs",
      label: "Inactive / Suspended",
      value: String(hubs.length - activeCount),
      subtitle: "Needs attention",
      icon: "low-stock-hubs",
      variant: hubs.length - activeCount > 0 ? "warning" : "default",
    },
  ];

  const visibleCards = showAllHubs
    ? summaries
    : summaries.slice(0, DASHBOARD_CARD_LIMIT);

  return (
    <div className="space-y-6">
      <motion.div
        {...fadeUp}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Sub-Hub Network</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Live hubs from the operations backend — create once, sync
            everywhere.
          </p>
        </div>
      </motion.div>

      <motion.div
        {...fadeIn}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map((stat) => (
          <SubHubStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </motion.div>

      {loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {isAuthError ? (
            <>
              Session expired or offline login is active.{" "}
              <a href="/login" className="font-semibold underline">
                Sign in again
              </a>{" "}
              with <code>superadmin@bajriwala.in</code> /{" "}
              <code>Admin@1234</code> while the API is running on port 8000.
            </>
          ) : (
            <>
              Could not load hubs from the backend. Check that the API is
              running on port 8000, then refresh this page.
            </>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Select
          value={regionFilter}
          onValueChange={(v) => setRegionFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter((v as StatusFilter) ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        {...fadeUp}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <SubHubSummaryCard
                key={i}
                hub={summaries[0] ?? ({} as SubHubSummary)}
                isLoading
              />
            ))
          : visibleCards.map((hub) => (
              <div
                key={hub.hubId}
                onClick={() => setSelectedHub(hub.hubId, hub.name)}
              >
                <SubHubSummaryCard hub={hub} />
              </div>
            ))}
      </motion.div>

      {!showAllHubs && summaries.length > DASHBOARD_CARD_LIMIT ? (
        <button
          type="button"
          className="text-primary text-sm font-semibold"
          onClick={() => setShowAllHubs(true)}
        >
          Show all {summaries.length} hubs
        </button>
      ) : null}

      <SubHubTable rows={tableRows} isLoading={isLoading} />
    </div>
  );
}
