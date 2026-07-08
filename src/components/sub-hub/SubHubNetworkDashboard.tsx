"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SubHubStatsCard } from "@/components/sub-hub/SubHubStatsCard";
import { SubHubSummaryCard } from "@/components/sub-hub/SubHubSummaryCard";
import { SubHubTable } from "@/components/sub-hub/SubHubTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type { SubHubOperationalStatus } from "@/types/erp.types";
import {
  computeSubHubDashboardKpis,
  computeSubHubSummaries,
  computeSubHubTableRows,
} from "@/utils/sub-hub-metrics";

type RegionFilter = "all" | string;
type StatusFilter = "all" | SubHubOperationalStatus;
type SyncFilter = "all" | "30-days";

export function SubHubNetworkDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [syncFilter, setSyncFilter] = useState<SyncFilter>("30-days");

  const subHubs = useWarehouseErpStore((state) => state.subHubs);
  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const resolvedSubHubs = useMemo(() => resolveSubHubs(subHubs), [subHubs]);

  const resolvedHubInventory = useMemo(
    () => normalizeHubInventory(hubInventory),
    [hubInventory],
  );

  const kpis = useMemo(
    () =>
      computeSubHubDashboardKpis(
        resolvedSubHubs,
        resolvedHubInventory,
        requisitions,
      ),
    [resolvedSubHubs, resolvedHubInventory, requisitions],
  );

  const summaries = useMemo(
    () =>
      computeSubHubSummaries(
        resolvedSubHubs,
        resolvedHubInventory,
        transfers,
        requisitions,
      ),
    [resolvedSubHubs, resolvedHubInventory, transfers, requisitions],
  );

  const tableRows = useMemo(
    () =>
      computeSubHubTableRows(
        resolvedSubHubs,
        resolvedHubInventory,
        transfers,
        requisitions,
      ),
    [resolvedSubHubs, resolvedHubInventory, transfers, requisitions],
  );

  const regions = useMemo(
    () =>
      Array.from(new Set(resolvedSubHubs.map((hub) => hub.region))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [resolvedSubHubs],
  );

  const filteredTableRows = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return tableRows.filter((row) => {
      if (regionFilter !== "all" && row.region !== regionFilter) {
        return false;
      }

      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (syncFilter === "30-days") {
        const hub = resolvedSubHubs.find((entry) => entry.id === row.hubId);
        if (hub && new Date(hub.lastInventorySync) < thirtyDaysAgo) {
          return false;
        }
      }

      return true;
    });
  }, [regionFilter, resolvedSubHubs, statusFilter, syncFilter, tableRows]);

  const filteredSummaries = useMemo(() => {
    const allowedHubIds = new Set(filteredTableRows.map((row) => row.hubId));
    return summaries.filter((summary) => allowedHubIds.has(summary.hubId));
  }, [filteredTableRows, summaries]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((stat) => (
          <SubHubStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Select
            value={regionFilter}
            onValueChange={(value) => setRegionFilter(value ?? "all")}
          >
            <SelectTrigger className="h-10 w-full min-w-[160px] sm:w-[180px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter((value ?? "all") as StatusFilter)
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[160px] sm:w-[180px]">
              <SelectValue placeholder="Alert Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alert Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={syncFilter}
            onValueChange={(value) =>
              setSyncFilter((value ?? "30-days") as SyncFilter)
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[160px] sm:w-[180px]">
              <SelectValue placeholder="Last 30 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30-days">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="h-10 gap-2 px-4">
          <Plus className="size-4" />
          Add New Hub
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }, (_, index) => (
              <SubHubSummaryCard
                key={`loading-${index}`}
                hub={{} as never}
                isLoading
              />
            ))
          : filteredSummaries.map((hub) => (
              <SubHubSummaryCard key={hub.hubId} hub={hub} />
            ))}
      </div>

      <SubHubTable rows={filteredTableRows} isLoading={isLoading} />
    </div>
  );
}
