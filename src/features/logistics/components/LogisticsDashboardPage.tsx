"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignDriverDialog } from "@/features/logistics/components/AssignDriverDialog";
import { AssignVehicleDialog } from "@/features/logistics/components/AssignVehicleDialog";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
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
        trend: "12% vs last week",
        trendUp: true,
        icon: Package,
      },
      {
        id: "hub-deliveries",
        label: "Hub Deliveries",
        value: String(stats.hubDeliveries),
        trend: "8% vs last week",
        trendUp: true,
        icon: Truck,
      },
      {
        id: "vehicles-running",
        label: "Vehicles Running",
        value: String(stats.vehiclesRunning),
        icon: Truck,
        variant: "success",
      },
      {
        id: "drivers-active",
        label: "Drivers Active",
        value: String(stats.driversActive),
        icon: Users,
      },
      {
        id: "delayed-shipments",
        label: "Delayed Shipments",
        value: String(stats.delayedShipments),
        variant: stats.delayedShipments > 0 ? "critical" : "default",
        icon: AlertTriangle,
      },
      {
        id: "todays-deliveries",
        label: "Today's Deliveries",
        value: String(stats.todaysDeliveries),
        variant: "success",
        icon: CheckCircle2,
      },
    ],
    [stats],
  );

  const warehouseSummary: LogisticsMetricCardData[] = [
    {
      id: "wh-transit",
      label: "In Transit",
      value: String(stats.warehouseHub.inTransit),
      icon: Truck,
    },
    {
      id: "wh-pending",
      label: "Pending Dispatch",
      value: String(stats.warehouseHub.pendingDispatch),
      variant: "warning",
      icon: Clock,
    },
    {
      id: "wh-delayed",
      label: "Delayed",
      value: String(stats.warehouseHub.delayed),
      variant: "critical",
      icon: AlertTriangle,
    },
    {
      id: "wh-completed",
      label: "Completed",
      value: String(stats.warehouseHub.completed),
      variant: "success",
      icon: CheckCircle2,
    },
  ];

  const customerSummary: LogisticsMetricCardData[] = [
    {
      id: "hc-ready",
      label: "Ready for Delivery",
      value: String(stats.hubCustomer.readyForDelivery),
      icon: Package,
    },
    {
      id: "hc-ofd",
      label: "Out For Delivery",
      value: String(stats.hubCustomer.outForDelivery),
      variant: "warning",
      icon: Truck,
    },
    {
      id: "hc-delivered",
      label: "Delivered",
      value: String(stats.hubCustomer.delivered),
      variant: "success",
      icon: CheckCircle2,
    },
    {
      id: "hc-failed",
      label: "Failed Delivery",
      value: String(stats.hubCustomer.failedDelivery),
      variant: "critical",
      icon: AlertTriangle,
    },
    {
      id: "hc-returned",
      label: "Returned",
      value: String(stats.hubCustomer.returned),
      icon: Package,
    },
  ];

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

  return (
    <div className="space-y-6">
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
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
            Warehouse → Hub Summary
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {warehouseSummary.map((stat) => (
              <LogisticsMetricCard
                key={stat.id}
                stat={stat}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
            Hub → Customer Summary
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {customerSummary.map((stat) => (
              <LogisticsMetricCard
                key={stat.id}
                stat={stat}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Critical Shipments
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Shipments requiring immediate attention
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : paginatedCritical.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Shipments"
              description="No critical shipments at this time."
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
                    Source
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Destination
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
                {paginatedCritical.data.map((shipment) => (
                  <TableRow key={shipment.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {shipment.shipmentId}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {shipment.shipmentType === "warehouse_transfer"
                        ? "Warehouse"
                        : "Customer"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-[#64748B]">
                      {shipment.source}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-[#64748B]">
                      {shipment.destination}
                    </TableCell>
                    <TableCell className="text-sm">
                      {shipment.vehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {shipment.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDateTime(shipment.eta)}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
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
                        variant="ghost"
                        className="text-primary hover:bg-orange-50"
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setDrawerOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
