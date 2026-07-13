"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import { ROUTES } from "@/constants/routes";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type { SubHubOperationalStatus, SubHubSummary } from "@/types/erp.types";
import {
  computeSubHubDashboardKpis,
  computeSubHubSummaries,
  computeSubHubTableRows,
} from "@/utils/sub-hub-metrics";

type RegionFilter = "all" | string;
type StatusFilter = "all" | SubHubOperationalStatus;
type SyncFilter = "all" | "30-days";

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

function sortByCriticality(summaries: SubHubSummary[]) {
  return [...summaries].sort((left, right) => {
    const statusDiff =
      STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return left.healthScore - right.healthScore;
  });
}

export function SubHubNetworkDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [syncFilter, setSyncFilter] = useState<SyncFilter>("30-days");
  const [showAllHubs, setShowAllHubs] = useState(false);

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

  const allSummaries = useMemo(
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
    return sortByCriticality(
      allSummaries.filter((summary) => allowedHubIds.has(summary.hubId)),
    );
  }, [allSummaries, filteredTableRows]);

  const visibleSummaries = useMemo(
    () =>
      showAllHubs
        ? filteredSummaries
        : filteredSummaries.slice(0, DASHBOARD_CARD_LIMIT),
    [filteredSummaries, showAllHubs],
  );

  const hasMoreHubs = filteredSummaries.length > DASHBOARD_CARD_LIMIT;

  const criticalCount = filteredSummaries.filter(
    (hub) => hub.status === "critical",
  ).length;
  const warningCount = filteredSummaries.filter(
    (hub) => hub.status === "warning",
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((stat) => (
          <SubHubStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
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
      </div>

      <motion.section className="min-w-0" {...fadeUp}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Top Critical Hubs
            </h2>
            {!isLoading ? (
              <p className="mt-1 text-sm text-[#64748B]">
                {criticalCount > 0 || warningCount > 0
                  ? `${criticalCount} critical · ${warningCount} warning across ${filteredSummaries.length} hubs`
                  : `${filteredSummaries.length} hubs in view · all healthy`}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: DASHBOARD_CARD_LIMIT }, (_, index) => (
                <SubHubSummaryCard
                  key={`loading-${index}`}
                  hub={{} as never}
                  isLoading
                />
              ))
            : visibleSummaries.map((hub) => (
                <SubHubSummaryCard key={hub.hubId} hub={hub} />
              ))}
        </div>

        {hasMoreHubs && !isLoading ? (
          <div className="mt-4 flex items-center gap-4">
            {showAllHubs ? (
              <button
                type="button"
                onClick={() => setShowAllHubs(false)}
                className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                Show Less
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowAllHubs(true)}
                  className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  View All Hubs
                  <ArrowRight className="size-4" />
                </button>
                <Link
                  href={ROUTES.SUB_HUB_NETWORK}
                  className="text-sm text-[#64748B] hover:text-[#1A1A1A] hover:underline"
                >
                  Full hub directory
                </Link>
              </>
            )}
          </div>
        ) : null}
      </motion.section>

      <motion.div className="w-full min-w-0" {...fadeIn}>
        <SubHubTable rows={filteredTableRows} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}
