"use client";

import {
  ArrowLeftRight,
  ClipboardList,
  MapPin,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { HubActivityTimeline } from "@/components/sub-hub/HubActivityTimeline";
import { HubHealthScoreBar } from "@/components/sub-hub/HubHealthScoreBar";
import { InventoryHealthBar } from "@/components/sub-hub/InventoryHealthBar";
import { SubHubStatusBadge } from "@/components/sub-hub/SubHubStatusBadge";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import type { RequisitionListItem } from "@/types/warehouse.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import {
  computeHubActivityEvents,
  computeHubHealthScore,
  computeHubInventoryHealth,
  computeHubOperationalStatus,
  countDelayedTransfersForHub,
  countIncomingTransfersForHub,
  countLowStockMaterials,
  countOutgoingTransfersForHub,
  countPendingCustomerOrdersForHub,
  formatHubStockValue,
  formatLastSync,
  isPendingOrder,
  isPendingRequisition,
} from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

const HUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "inventory", label: "Inventory" },
  { id: "customer-orders", label: "Customer Orders" },
  { id: "transfers", label: "Transfers" },
  { id: "dispatches", label: "Dispatches" },
  { id: "requisitions", label: "Requisitions" },
  { id: "analytics", label: "Analytics" },
  { id: "activity", label: "Activity Timeline" },
] as const;

type HubTabId = (typeof HUB_TABS)[number]["id"];

interface HubDetailPageProps {
  hubId: string;
  initialTab?: string;
}

export function HubDetailPage({ hubId, initialTab }: HubDetailPageProps) {
  const [activeTab, setActiveTab] = useState<HubTabId>(
    (HUB_TABS.some((tab) => tab.id === initialTab)
      ? initialTab
      : "overview") as HubTabId,
  );

  const subHubs = useWarehouseErpStore((state) => state.subHubs);
  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const dispatches = useWarehouseErpStore((state) => state.dispatches);
  const activityLogs = useWarehouseErpStore((state) => state.activityLogs);

  const hub = useMemo(
    () => resolveSubHubs(subHubs).find((entry) => entry.id === hubId),
    [hubId, subHubs],
  );

  const resolvedInventory = useMemo(
    () => normalizeHubInventory(hubInventory),
    [hubInventory],
  );

  const hubInventoryEntries = useMemo(
    () => resolvedInventory.filter((entry) => entry.hubId === hubId),
    [hubId, resolvedInventory],
  );

  const hubRequisitions = useMemo(
    () => requisitions.filter((item) => item.hubId === hubId),
    [hubId, requisitions],
  );

  const hubTransfers = useMemo(
    () => transfers.filter((item) => item.destinationHubId === hubId),
    [hubId, transfers],
  );

  const hubDispatches = useMemo(
    () => dispatches.filter((item) => hub && item.destinationHub === hub.name),
    [dispatches, hub],
  );

  const customerOrders = useMemo(
    () => hubRequisitions.filter(isPendingOrder),
    [hubRequisitions],
  );

  const pendingRequisitions = useMemo(
    () => hubRequisitions.filter(isPendingRequisition),
    [hubRequisitions],
  );

  const metrics = useMemo(() => {
    if (!hub) return null;

    const inventoryHealth = computeHubInventoryHealth(resolvedInventory, hubId);
    const healthScore = computeHubHealthScore(
      hubId,
      resolvedInventory,
      transfers,
      requisitions,
    );
    const status = computeHubOperationalStatus(
      hubId,
      resolvedInventory,
      transfers,
      requisitions,
    );

    return {
      inventoryHealth,
      healthScore,
      status,
      incomingTransfers: countIncomingTransfersForHub(transfers, hubId),
      outgoingTransfers: countOutgoingTransfersForHub(requisitions, hubId),
      pendingOrders: countPendingCustomerOrdersForHub(requisitions, hubId),
      pendingRequisitionCount: pendingRequisitions.length,
      lowStockCount: countLowStockMaterials(resolvedInventory, hubId),
      delayedTransfers: countDelayedTransfersForHub(transfers, hubId),
      stockValueLabel: formatHubStockValue(
        hubInventoryEntries.reduce(
          (sum, entry) => sum + entry.quantity * entry.purchasePrice,
          0,
        ),
      ),
    };
  }, [
    hub,
    hubId,
    hubInventoryEntries,
    pendingRequisitions.length,
    requisitions,
    resolvedInventory,
    transfers,
  ]);

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

  if (!hub || !metrics) {
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
    <div className="space-y-5">
      <PageHeader
        title={hub.name}
        subtitle={`${hub.city} · ${hub.region} · ${hub.nodeId}`}
        actions={
          <div className="flex items-center gap-2">
            <SubHubStatusBadge status={metrics.status} />
            <Link
              href={ROUTES.SUB_HUB_NETWORK}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Back to Network
            </Link>
          </div>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as HubTabId)}
      >
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-gray-100/80 p-1">
          {HUB_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="shrink-0 text-xs sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Manager" value={hub.managerName} />
            <MetricCard
              label="Inventory Health"
              value={`${metrics.inventoryHealth}%`}
            />
            <MetricCard
              label="Hub Health Score"
              value={String(metrics.healthScore)}
            />
            <MetricCard
              label="Last Inventory Sync"
              value={formatLastSync(hub.lastInventorySync)}
            />
            <MetricCard
              label="Pending Customer Orders"
              value={String(metrics.pendingOrders)}
            />
            <MetricCard
              label="Pending Requisitions"
              value={String(metrics.pendingRequisitionCount)}
            />
            <MetricCard
              label="Incoming Transfers"
              value={String(metrics.incomingTransfers)}
            />
            <MetricCard label="Stock Value" value={metrics.stockValueLabel} />
          </div>

          <DashboardCard title="Supply Chain Position">
            <p className="text-sm leading-relaxed text-[#64748B]">
              Central Warehouse → Inventory → Allocation → Transfer → Dispatch →
              In Transit → Hub Receives → Hub Inventory Updated → Customer
              Orders → Hub Dispatches → Inventory Reduced → Below Reorder Level
              → Hub Raises Requisition → Warehouse Approves → Allocation Cycle
              Restarts.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <QuickLink
                href={`${ROUTES.CENTRAL_WAREHOUSE}/inventory?hub=${hubId}`}
                icon={Package}
                label="Hub Inventory"
              />
              <QuickLink
                href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers?hub=${hubId}`}
                icon={ArrowLeftRight}
                label="Transfers"
              />
              <QuickLink
                href={`${ROUTES.CENTRAL_WAREHOUSE}/requisitions?hub=${hubId}`}
                icon={ClipboardList}
                label="Requisitions"
              />
              <QuickLink
                href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch`}
                icon={Truck}
                label="Dispatch Control"
              />
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="inventory" className="mt-5">
          <DashboardCard title="Hub Inventory">
            {hubInventoryEntries.length === 0 ? (
              <EmptyState
                title="No inventory records"
                description="Inventory for this hub will appear after the first receipt."
                icon={<Package className="size-8" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Material</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Health</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hubInventoryEntries.map((entry) => {
                      const health = Math.round(
                        (entry.quantity / Math.max(entry.minimumRequired, 1)) *
                          100,
                      );
                      return (
                        <TableRow key={`${entry.hubId}-${entry.materialId}`}>
                          <TableCell className="font-medium">
                            {entry.materialName}
                          </TableCell>
                          <TableCell>{entry.sku}</TableCell>
                          <TableCell>
                            {entry.quantity} {entry.unit}
                          </TableCell>
                          <TableCell>
                            {entry.minimumRequired} {entry.unit}
                          </TableCell>
                          <TableCell>
                            <InventoryHealthBar health={health} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </TabsContent>

        <TabsContent value="customer-orders" className="mt-5">
          <RequisitionTable
            title="Customer Orders"
            items={customerOrders}
            emptyTitle="No pending customer orders"
            emptyDescription="Allocated or in-transit customer orders for this hub appear here."
            icon={<ShoppingCart className="size-8" />}
          />
        </TabsContent>

        <TabsContent value="transfers" className="mt-5">
          <DashboardCard title="Incoming Transfers">
            {hubTransfers.length === 0 ? (
              <EmptyState
                title="No transfers"
                description="Warehouse-to-hub transfers will appear here."
                icon={<ArrowLeftRight className="size-8" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hubTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          {transfer.transferId}
                        </TableCell>
                        <TableCell>{transfer.material}</TableCell>
                        <TableCell>
                          {transfer.quantity} {transfer.quantityUnit}
                        </TableCell>
                        <TableCell>{transfer.status}</TableCell>
                        <TableCell>{transfer.eta}</TableCell>
                        <TableCell>
                          <Link
                            href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transfer.transferId}`}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </TabsContent>

        <TabsContent value="dispatches" className="mt-5">
          <DashboardCard title="Dispatch Logs">
            {hubDispatches.length === 0 ? (
              <EmptyState
                title="No dispatches"
                description="Outbound dispatches linked to this hub appear here."
                icon={<Truck className="size-8" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Dispatch ID</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hubDispatches.map((dispatch) => (
                      <TableRow key={dispatch.id}>
                        <TableCell className="font-medium">
                          {dispatch.dispatchId}
                        </TableCell>
                        <TableCell>{dispatch.material}</TableCell>
                        <TableCell>
                          {dispatch.quantity} {dispatch.unit}
                        </TableCell>
                        <TableCell>{dispatch.status}</TableCell>
                        <TableCell>
                          {new Date(dispatch.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </TabsContent>

        <TabsContent value="requisitions" className="mt-5">
          <RequisitionTable
            title="Hub Requisitions"
            items={hubRequisitions}
            emptyTitle="No requisitions"
            emptyDescription="Hub replenishment requests appear here."
            icon={<ClipboardList className="size-8" />}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-5 space-y-5">
          <DashboardCard title="Hub Health Score">
            <div className="max-w-md">
              <HubHealthScoreBar score={metrics.healthScore} />
            </div>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AnalyticsRow
                label="Inventory Penalty"
                value={Math.round(
                  Math.max(0, 100 - metrics.inventoryHealth) * 0.25,
                )}
              />
              <AnalyticsRow
                label="Delayed Transfer Penalty"
                value={Math.min(20, metrics.delayedTransfers * 8)}
              />
              <AnalyticsRow
                label="Pending Requisition Penalty"
                value={Math.min(20, metrics.pendingRequisitionCount * 5)}
              />
              <AnalyticsRow
                label="Low Stock Penalty"
                value={Math.min(20, metrics.lowStockCount * 5)}
              />
            </dl>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="activity" className="mt-5">
          <DashboardCard title="Activity Timeline">
            <HubActivityTimeline events={activityEvents} />
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-[#1A1A1A]">{value}</p>
    </div>
  );
}

function AnalyticsRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
      <dt className="text-xs text-[#64748B]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-[#1A1A1A]">−{value}</dd>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Package;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-2",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function RequisitionTable({
  title,
  items,
  emptyTitle,
  emptyDescription,
  icon,
}: {
  title: string;
  items: RequisitionListItem[];
  emptyTitle: string;
  emptyDescription: string;
  icon: React.ReactNode;
}) {
  return (
    <DashboardCard title={title}>
      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={icon}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Request ID</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.requestId}
                  </TableCell>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>
                    {item.requestedQty} {item.unit}
                  </TableCell>
                  <TableCell className="capitalize">{item.priority}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    <Link
                      href={item.href}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
