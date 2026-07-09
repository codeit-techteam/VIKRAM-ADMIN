"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Route,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { AssignDriverDialog } from "@/features/logistics/components/AssignDriverDialog";
import { AssignVehicleDialog } from "@/features/logistics/components/AssignVehicleDialog";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import {
  LogisticsSummaryPanel,
  type LogisticsSummaryItem,
} from "@/features/logistics/components/LogisticsSummaryPanel";
import { ShipmentDetailDrawer } from "@/features/logistics/components/ShipmentDetailDrawer";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import {
  computeDashboardStats,
  formatLogisticsDateTime,
  getIssueLabel,
  LOGISTICS_PAGE_SIZE,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { CriticalShipment } from "@/types/logistics.types";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    label: "Warehouse Logistics",
    href: `${ROUTES.LOGISTICS}/warehouse`,
    icon: Package,
  },
  {
    label: "Customer Deliveries",
    href: `${ROUTES.LOGISTICS}/customer`,
    icon: Truck,
  },
  {
    label: "Shipment Tracking",
    href: `${ROUTES.LOGISTICS}/tracking`,
    icon: MapPin,
  },
  {
    label: "Route & Dispatch",
    href: `${ROUTES.LOGISTICS}/dispatch`,
    icon: Route,
  },
] as const;

export function LogisticsDashboardPage() {
  const { isLoading } = useLogisticsLoading();
  const warehouseShipments = useLogisticsStore((s) => s.warehouseShipments);
  const customerDeliveries = useLogisticsStore((s) => s.customerDeliveries);
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const drivers = useLogisticsStore((s) => s.drivers);
  const criticalShipments = useLogisticsStore((s) => s.criticalShipments);

  const [selectedShipment, setSelectedShipment] =
    useState<CriticalShipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(
    () =>
      computeDashboardStats(
        warehouseShipments,
        customerDeliveries,
        vehicles,
        drivers,
      ),
    [warehouseShipments, customerDeliveries, vehicles, drivers],
  );

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "warehouse-transfers",
        label: "Warehouse Transfers",
        value: String(stats.warehouseTransfers),
        trend: "+12% vs last week",
        trendUp: true,
        icon: Package,
        href: `${ROUTES.LOGISTICS}/warehouse`,
      },
      {
        id: "hub-deliveries",
        label: "Hub Deliveries",
        value: String(stats.hubDeliveries),
        trend: "+8% vs last week",
        trendUp: true,
        icon: Truck,
        href: `${ROUTES.LOGISTICS}/customer`,
      },
      {
        id: "vehicles-running",
        label: "Vehicles Running",
        value: String(stats.vehiclesRunning),
        icon: Truck,
        variant: "success",
        href: `${ROUTES.LOGISTICS}/fleet/vehicles`,
      },
      {
        id: "drivers-active",
        label: "Drivers Active",
        value: String(stats.driversActive),
        icon: Users,
        href: `${ROUTES.LOGISTICS}/fleet/drivers`,
      },
      {
        id: "delayed-shipments",
        label: "Delayed Shipments",
        value: String(stats.delayedShipments),
        variant: stats.delayedShipments > 0 ? "critical" : "default",
        icon: AlertTriangle,
        href: `${ROUTES.LOGISTICS}/tracking`,
      },
      {
        id: "todays-deliveries",
        label: "Today's Deliveries",
        value: String(stats.todaysDeliveries),
        variant: "success",
        icon: CheckCircle2,
        href: `${ROUTES.LOGISTICS}/customer`,
      },
    ],
    [stats],
  );

  const warehouseSummary = useMemo<LogisticsSummaryItem[]>(
    () => [
      {
        id: "wh-transit",
        label: "In Transit",
        value: stats.warehouseHub.inTransit,
        icon: Truck,
      },
      {
        id: "wh-pending",
        label: "Pending Dispatch",
        value: stats.warehouseHub.pendingDispatch,
        variant: "warning",
        icon: Clock,
      },
      {
        id: "wh-delayed",
        label: "Delayed",
        value: stats.warehouseHub.delayed,
        variant: "critical",
        icon: AlertTriangle,
      },
      {
        id: "wh-completed",
        label: "Completed",
        value: stats.warehouseHub.completed,
        variant: "success",
        icon: CheckCircle2,
      },
    ],
    [stats.warehouseHub],
  );

  const customerSummary = useMemo<LogisticsSummaryItem[]>(
    () => [
      {
        id: "hc-ready",
        label: "Ready for Delivery",
        value: stats.hubCustomer.readyForDelivery,
        icon: Package,
      },
      {
        id: "hc-ofd",
        label: "Out For Delivery",
        value: stats.hubCustomer.outForDelivery,
        variant: "warning",
        icon: Truck,
      },
      {
        id: "hc-delivered",
        label: "Delivered",
        value: stats.hubCustomer.delivered,
        variant: "success",
        icon: CheckCircle2,
      },
      {
        id: "hc-failed",
        label: "Failed Delivery",
        value: stats.hubCustomer.failedDelivery,
        variant: "critical",
        icon: AlertTriangle,
      },
      {
        id: "hc-returned",
        label: "Returned",
        value: stats.hubCustomer.returned,
        icon: Package,
      },
    ],
    [stats.hubCustomer],
  );

  const paginatedCritical = useMemo(() => {
    const start = (currentPage - 1) * LOGISTICS_PAGE_SIZE;
    return {
      data: criticalShipments.slice(start, start + LOGISTICS_PAGE_SIZE),
      total: criticalShipments.length,
      totalPages: Math.max(
        1,
        Math.ceil(criticalShipments.length / LOGISTICS_PAGE_SIZE),
      ),
    };
  }, [criticalShipments, currentPage]);

  const openAssignVehicle = (id: string) => {
    setAssignTargetId(id);
    setAssignVehicleOpen(true);
  };

  const openAssignDriver = (id: string) => {
    setAssignTargetId(id);
    setAssignDriverOpen(true);
  };

  const getShipmentType = (s: CriticalShipment) =>
    s.shipmentType === "warehouse_transfer" ? "warehouse" : "customer";

  const hasDelays = stats.delayedShipments > 0;

  return (
    <div className="flex flex-col gap-6">
      {hasDelays && !isLoading ? (
        <Alert
          variant="destructive"
          className="border-destructive/20 bg-destructive/5"
        >
          <AlertTriangle />
          <AlertTitle>
            {stats.delayedShipments} delayed shipment
            {stats.delayedShipments > 1 ? "s" : ""} need attention
          </AlertTitle>
          <AlertDescription>
            Review critical shipments below and assign vehicles or drivers to
            resolve delays.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.href}
            variant="outline"
            size="sm"
            render={<Link href={action.href} />}
          >
            <action.icon data-icon="inline-start" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((stat) => (
          <LogisticsMetricCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LogisticsSummaryPanel
          title="Warehouse → Hub"
          subtitle="Transfer pipeline from central warehouse to sub-hubs"
          href={`${ROUTES.LOGISTICS}/warehouse`}
          items={warehouseSummary}
          isLoading={isLoading}
        />
        <LogisticsSummaryPanel
          title="Hub → Customer"
          subtitle="Last-mile delivery status across all hubs"
          href={`${ROUTES.LOGISTICS}/customer`}
          items={customerSummary}
          isLoading={isLoading}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Critical Shipments
              </h2>
              {!isLoading && paginatedCritical.total > 0 ? (
                <Badge variant="destructive" className="rounded-md px-1.5">
                  {paginatedCritical.total}
                </Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-[#64748B]">
              Shipments requiring immediate attention
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary shrink-0"
            render={<Link href={`${ROUTES.LOGISTICS}/tracking`} />}
          >
            View all tracking
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : paginatedCritical.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="All Clear"
              description="No critical shipments at this time. Operations are running smoothly."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Shipment ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Route
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Driver
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    ETA
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Issue
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Priority
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-gray-400 uppercase">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCritical.data.map((shipment) => {
                  const isHighPriority =
                    shipment.priority === "critical" ||
                    shipment.priority === "high";

                  return (
                    <TableRow
                      key={shipment.id}
                      className={cn(
                        "transition-colors hover:bg-gray-50/80",
                        isHighPriority && "bg-destructive/3",
                      )}
                    >
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {shipment.shipmentId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md text-xs">
                          {shipment.shipmentType === "warehouse_transfer"
                            ? "Warehouse"
                            : "Customer"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-[#64748B]">
                          {shipment.source}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          → {shipment.destination}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.vehicleNumber ?? (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.driverName ?? (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {formatLogisticsDateTime(shipment.eta)}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-sm text-[#64748B]">
                        {getIssueLabel(shipment.issue)}
                      </TableCell>
                      <TableCell>
                        <LogisticsStatusBadge status={shipment.priority} />
                      </TableCell>
                      <TableCell>
                        <LogisticsStatusBadge
                          status={shipment.status
                            .toLowerCase()
                            .replace(/\s+/g, "_")}
                          label={shipment.status}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-primary border-primary/20 hover:bg-primary/5"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setDrawerOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && paginatedCritical.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedCritical.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={paginatedCritical.total}
            onPageChange={setCurrentPage}
            itemLabel="shipments"
          />
        ) : null}
      </div>

      <ShipmentDetailDrawer
        shipment={selectedShipment}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAssignVehicle={openAssignVehicle}
        onAssignDriver={openAssignDriver}
        onApproveDocuments={(id) =>
          notify.success("Documents Approved", `${id} cleared for dispatch.`)
        }
      />

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetType={
          selectedShipment ? getShipmentType(selectedShipment) : "warehouse"
        }
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetType={
          selectedShipment ? getShipmentType(selectedShipment) : "warehouse"
        }
      />
    </div>
  );
}
