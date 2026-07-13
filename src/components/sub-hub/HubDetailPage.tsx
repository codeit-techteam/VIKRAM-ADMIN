"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { HubActivityTimeline } from "@/components/sub-hub/HubActivityTimeline";
import { HubInventoryOverviewTable } from "@/components/sub-hub/HubInventoryOverviewTable";
import { HubManagerCard } from "@/components/sub-hub/HubManagerCard";
import { HubPerformanceStrip } from "@/components/sub-hub/HubPerformanceStrip";
import { HubProfileHeader } from "@/components/sub-hub/HubProfileHeader";
import { HubProfileKpiGrid } from "@/components/sub-hub/HubProfileKpiGrid";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import {
  buildHubInventoryRows,
  buildHubManagerProfile,
  computeHubPerformanceKpis,
  computeHubProfileKpis,
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

  const managerProfile = useMemo(() => {
    if (!hub) return null;
    return buildHubManagerProfile(hub, resolvedInventory, requisitions, 0);
  }, [hub, resolvedInventory, requisitions]);

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

  if (!hub || !topKpis || !performance || !managerProfile) {
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
