"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { HubActivityTimeline } from "@/components/sub-hub/HubActivityTimeline";
import { HubDispatchQueue } from "@/components/sub-hub/HubDispatchQueue";
import { HubHealthScoreCard } from "@/components/sub-hub/HubHealthScoreCard";
import { HubInventoryOverviewTable } from "@/components/sub-hub/HubInventoryOverviewTable";
import { HubLiveOpsPanel } from "@/components/sub-hub/HubLiveOpsPanel";
import { HubManagerCard } from "@/components/sub-hub/HubManagerCard";
import { HubPerformanceStrip } from "@/components/sub-hub/HubPerformanceStrip";
import { HubProfileHeader } from "@/components/sub-hub/HubProfileHeader";
import { HubProfileKpiGrid } from "@/components/sub-hub/HubProfileKpiGrid";
import { HubStockAlertsPanel } from "@/components/sub-hub/HubStockAlertsPanel";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import {
  buildHubDispatchQueue,
  buildHubInventoryRows,
  buildHubManagerProfile,
  buildHubStockAlerts,
  computeHubPerformanceKpis,
  computeHubProfileHealth,
  computeHubProfileKpis,
  computeLiveOpsCounts,
  filterTransfersByOpsStage,
  type HubOpsStageFilter,
} from "@/utils/hub-profile-metrics";
import {
  computeHubActivityEvents,
  computeHubOperationalStatus,
} from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

interface HubDetailPageProps {
  hubId: string;
  initialTab?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

export function HubDetailPage({ hubId }: HubDetailPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [opsStage, setOpsStage] = useState<HubOpsStageFilter | null>(null);

  const subHubs = useWarehouseErpStore((state) => state.subHubs);
  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const dispatches = useWarehouseErpStore((state) => state.dispatches);
  const allocations = useWarehouseErpStore((state) => state.allocations);
  const activityLogs = useWarehouseErpStore((state) => state.activityLogs);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [hubId]);

  const hub = useMemo(
    () => resolveSubHubs(subHubs).find((entry) => entry.id === hubId),
    [hubId, subHubs],
  );

  const resolvedInventory = useMemo(
    () => normalizeHubInventory(hubInventory),
    [hubInventory],
  );

  const operationalStatus = useMemo(() => {
    if (!hub) return "healthy" as const;
    return computeHubOperationalStatus(
      hubId,
      resolvedInventory,
      transfers,
      requisitions,
    );
  }, [hub, hubId, resolvedInventory, transfers, requisitions]);

  const topKpis = useMemo(() => {
    if (!hub) return null;
    return computeHubProfileKpis(
      hubId,
      resolvedInventory,
      transfers,
      requisitions,
    );
  }, [hub, hubId, resolvedInventory, transfers, requisitions]);

  const performance = useMemo(() => {
    if (!hub) return null;
    return computeHubPerformanceKpis(
      hub,
      resolvedInventory,
      transfers,
      requisitions,
    );
  }, [hub, resolvedInventory, transfers, requisitions]);

  const healthBreakdown = useMemo(() => {
    if (!hub) return null;
    return computeHubProfileHealth(
      hubId,
      resolvedInventory,
      transfers,
      requisitions,
    );
  }, [hub, hubId, resolvedInventory, transfers, requisitions]);

  const inventoryRows = useMemo(() => {
    if (!hub) return [];
    return buildHubInventoryRows(
      hub,
      resolvedInventory,
      transfers,
      requisitions,
      allocations,
      dispatches,
    );
  }, [
    allocations,
    dispatches,
    hub,
    resolvedInventory,
    requisitions,
    transfers,
  ]);

  const stockAlerts = useMemo(
    () => buildHubStockAlerts(inventoryRows),
    [inventoryRows],
  );

  const liveOps = useMemo(
    () => computeLiveOpsCounts(hubId, transfers),
    [hubId, transfers],
  );

  const dispatchQueue = useMemo(() => {
    if (!hub) return [];
    return buildHubDispatchQueue(hub, transfers, requisitions);
  }, [hub, transfers, requisitions]);

  const managerProfile = useMemo(() => {
    if (!hub || !healthBreakdown) return null;
    return buildHubManagerProfile(
      hub,
      resolvedInventory,
      requisitions,
      healthBreakdown.score,
    );
  }, [hub, healthBreakdown, resolvedInventory, requisitions]);

  const activityEvents = useMemo(() => {
    if (!hub) return [];
    return computeHubActivityEvents(
      hub,
      resolvedInventory,
      transfers,
      requisitions,
      activityLogs,
      dispatches,
    );
  }, [
    activityLogs,
    dispatches,
    hub,
    requisitions,
    resolvedInventory,
    transfers,
  ]);

  const filteredOpsTransfers = useMemo(() => {
    if (!opsStage) return [];
    return filterTransfersByOpsStage(transfers, hubId, opsStage);
  }, [hubId, opsStage, transfers]);

  if (!hub || !topKpis || !performance || !healthBreakdown || !managerProfile) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Hub Not Found"
          subtitle="The requested sub-hub could not be located in the network."
        />
        <EmptyState
          title="Hub unavailable"
          description="Return to the network dashboard to select an active hub."
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

  return (
    <div className="space-y-6 pb-8">
      <HubProfileHeader hub={hub} status={operationalStatus} />

      <HubProfileKpiGrid kpis={topKpis} isLoading={isLoading} />

      <HubPerformanceStrip kpis={performance} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <motion.div className="space-y-5 xl:col-span-4" {...fadeUp}>
          <HubManagerCard profile={managerProfile} />
          <HubStockAlertsPanel hubId={hubId} alerts={stockAlerts} />
          <HubHealthScoreCard breakdown={healthBreakdown} />
        </motion.div>

        <motion.div
          className="space-y-5 xl:col-span-8"
          {...fadeUp}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <HubInventoryOverviewTable hubId={hubId} rows={inventoryRows} />
          <HubLiveOpsPanel
            hubId={hubId}
            counts={liveOps}
            activeStage={opsStage}
            onSelectStage={(stage) =>
              setOpsStage((current) => (current === stage ? null : stage))
            }
          />

          {opsStage ? (
            <DashboardCard
              title={`Filtered · ${opsStageLabel(opsStage)}`}
              action={
                <button
                  type="button"
                  onClick={() => setOpsStage(null)}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Clear filter
                </button>
              }
              contentClassName="mt-4"
            >
              {filteredOpsTransfers.length === 0 ? (
                <EmptyState
                  title="No matching transfers"
                  description="No transfers for this hub match the selected live operations stage."
                  icon={<ArrowLeftRight className="size-8" />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Transfer ID</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpsTransfers.map((transfer) => (
                        <TableRow
                          key={transfer.id}
                          className="hover:bg-orange-50/40"
                        >
                          <TableCell className="font-medium">
                            {transfer.transferId}
                          </TableCell>
                          <TableCell>{transfer.material ?? "—"}</TableCell>
                          <TableCell>{transfer.status}</TableCell>
                          <TableCell>
                            {new Date(transfer.eta).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transfer.transferId}`}
                              className={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                              })}
                            >
                              Open
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DashboardCard>
          ) : null}

          <HubDispatchQueue items={dispatchQueue} hubId={hubId} />
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ duration: 0.25, delay: 0.08 }}>
        <DashboardCard title="Operations Timeline" contentClassName="mt-5">
          <HubActivityTimeline events={activityEvents} isLoading={isLoading} />
        </DashboardCard>
      </motion.div>

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

function opsStageLabel(stage: HubOpsStageFilter): string {
  switch (stage) {
    case "incoming":
      return "Incoming Transfers";
    case "loading":
      return "Loading";
    case "ready":
      return "Ready To Dispatch";
    case "in-transit":
      return "In Transit";
    case "delivered-today":
      return "Delivered Today";
    default:
      return stage;
  }
}
