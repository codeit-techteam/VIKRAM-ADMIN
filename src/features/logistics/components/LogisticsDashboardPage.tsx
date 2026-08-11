"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  IndianRupee,
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
import { buildFilteredUrl } from "@/utils/navigation-filters";
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
import { useLogisticsDashboard } from "@/features/logistics/hooks/use-logistics";
import {
  formatLogisticsDateTime,
  getIssueLabel,
  LOGISTICS_PAGE_SIZE,
} from "@/features/logistics/utils/logistics-formatters";
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
    label: "Delivery Pricing",
    href: `${ROUTES.LOGISTICS}/delivery-pricing`,
    icon: IndianRupee,
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
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useLogisticsDashboard();

  const stats = data;
  const criticalShipments = data?.criticalShipments ?? [];

  const [selectedShipment, setSelectedShipment] =
    useState<CriticalShipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [assignTargetLabel, setAssignTargetLabel] = useState("");
  const [assignTargetType, setAssignTargetType] = useState<
    "warehouse" | "customer"
  >("warehouse");
  const [assignDriverId, setAssignDriverId] = useState<string | null>(null);
  const [assignVehicleId, setAssignVehicleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const emptyStats = {
    warehouseTransfers: 0,
    hubDeliveries: 0,
    vehiclesRunning: 0,
    driversActive: 0,
    delayedShipments: 0,
    todaysDeliveries: 0,
    warehouseHub: {
      inTransit: 0,
      pendingDispatch: 0,
      delayed: 0,
      completed: 0,
    },
    hubCustomer: {
      readyForDelivery: 0,
      outForDelivery: 0,
      delivered: 0,
      failedDelivery: 0,
      returned: 0,
    },
  };

  const s = stats ?? emptyStats;

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "warehouse-transfers",
        label: "Warehouse Transfers",
        value: String(s.warehouseTransfers),
        icon: Package,
        href: `${ROUTES.LOGISTICS}/warehouse`,
      },
      {
        id: "hub-deliveries",
        label: "Hub Deliveries",
        value: String(s.hubDeliveries),
        icon: Truck,
        href: `${ROUTES.LOGISTICS}/customer`,
      },
      {
        id: "vehicles-running",
        label: "Vehicles Running",
        value: String(s.vehiclesRunning),
        icon: Truck,
        variant: "success",
        href: `${ROUTES.LOGISTICS}/fleet/vehicles`,
      },
      {
        id: "drivers-active",
        label: "Drivers Active",
        value: String(s.driversActive),
        icon: Users,
        href: `${ROUTES.LOGISTICS}/fleet/drivers`,
      },
      {
        id: "delayed-shipments",
        label: "Delayed Shipments",
        value: String(s.delayedShipments),
        variant: s.delayedShipments > 0 ? "critical" : "default",
        icon: AlertTriangle,
        href: `${ROUTES.LOGISTICS}/tracking`,
      },
      {
        id: "todays-deliveries",
        label: "Today's Deliveries",
        value: String(s.todaysDeliveries),
        variant: "success",
        icon: CheckCircle2,
        href: `${ROUTES.LOGISTICS}/customer`,
      },
    ],
    [s],
  );

  const warehouseSummary = useMemo<LogisticsSummaryItem[]>(
    () => [
      {
        id: "wh-transit",
        label: "In Transit",
        value: s.warehouseHub.inTransit,
        icon: Truck,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/warehouse`, {
          status: "in_transit",
        }),
      },
      {
        id: "wh-pending",
        label: "Pending Dispatch",
        value: s.warehouseHub.pendingDispatch,
        variant: "warning",
        icon: Clock,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/warehouse`, {
          status: "pending",
        }),
      },
      {
        id: "wh-delayed",
        label: "Delayed",
        value: s.warehouseHub.delayed,
        variant: "critical",
        icon: AlertTriangle,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/warehouse`, {
          status: "delayed",
        }),
      },
      {
        id: "wh-completed",
        label: "Completed",
        value: s.warehouseHub.completed,
        variant: "success",
        icon: CheckCircle2,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/warehouse`, {
          status: "completed",
        }),
      },
    ],
    [s.warehouseHub],
  );

  const customerSummary = useMemo<LogisticsSummaryItem[]>(
    () => [
      {
        id: "hc-ready",
        label: "Ready for Delivery",
        value: s.hubCustomer.readyForDelivery,
        icon: Package,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/customer`, {
          status: "packed",
        }),
      },
      {
        id: "hc-ofd",
        label: "Out For Delivery",
        value: s.hubCustomer.outForDelivery,
        variant: "warning",
        icon: Truck,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/customer`, {
          status: "out_for_delivery",
        }),
      },
      {
        id: "hc-delivered",
        label: "Delivered",
        value: s.hubCustomer.delivered,
        variant: "success",
        icon: CheckCircle2,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/customer`, {
          status: "delivered",
        }),
      },
      {
        id: "hc-failed",
        label: "Failed Delivery",
        value: s.hubCustomer.failedDelivery,
        variant: "critical",
        icon: AlertTriangle,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/customer`, {
          status: "failed",
        }),
      },
      {
        id: "hc-returned",
        label: "Returned",
        value: s.hubCustomer.returned,
        icon: Package,
        filterHref: buildFilteredUrl(`${ROUTES.LOGISTICS}/customer`, {
          status: "returned",
        }),
      },
    ],
    [s.hubCustomer],
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

  const openAssignVehicle = (shipment: CriticalShipment) => {
    setAssignTargetId(shipment.id);
    setAssignTargetLabel(shipment.shipmentId);
    setAssignTargetType(
      shipment.shipmentType === "warehouse_transfer" ? "warehouse" : "customer",
    );
    setAssignDriverId(shipment.driverId);
    setAssignVehicleId(shipment.vehicleId);
    setAssignVehicleOpen(true);
  };

  const openAssignDriver = (shipment: CriticalShipment) => {
    setAssignTargetId(shipment.id);
    setAssignTargetLabel(shipment.shipmentId);
    setAssignTargetType(
      shipment.shipmentType === "warehouse_transfer" ? "warehouse" : "customer",
    );
    setAssignDriverId(shipment.driverId);
    setAssignVehicleId(shipment.vehicleId);
    setAssignDriverOpen(true);
  };

  const hasDelays = s.delayedShipments > 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-white p-10 text-center">
        <p className="text-sm font-medium text-[#1A1A1A]">
          Unable to load logistics dashboard.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasDelays && !isLoading ? (
        <Alert
          variant="destructive"
          className="border-destructive/20 bg-destructive/5"
        >
          <AlertTriangle />
          <AlertTitle>
            {s.delayedShipments} delayed shipment
            {s.delayedShipments > 1 ? "s" : ""} need attention
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
        onAssignVehicle={(id) => {
          const shipment =
            selectedShipment?.shipmentId === id || selectedShipment?.id === id
              ? selectedShipment
              : criticalShipments.find(
                  (c) => c.id === id || c.shipmentId === id,
                );
          if (shipment) openAssignVehicle(shipment);
        }}
        onAssignDriver={(id) => {
          const shipment =
            selectedShipment?.shipmentId === id || selectedShipment?.id === id
              ? selectedShipment
              : criticalShipments.find(
                  (c) => c.id === id || c.shipmentId === id,
                );
          if (shipment) openAssignDriver(shipment);
        }}
        onApproveDocuments={(id) =>
          notify.success("Documents Approved", `${id} cleared for dispatch.`)
        }
      />

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType={assignTargetType}
        driverId={assignDriverId}
        onAssigned={() => void refetch()}
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType={assignTargetType}
        vehicleId={assignVehicleId}
        onAssigned={() => void refetch()}
      />
    </div>
  );
}
