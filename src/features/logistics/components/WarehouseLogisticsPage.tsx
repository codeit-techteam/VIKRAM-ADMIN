"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  MoreVertical,
  Package,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { WarehouseShipmentDetailDrawer } from "@/features/logistics/components/WarehouseShipmentDetailDrawer";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import {
  EMPTY_WAREHOUSE_FILTERS,
  formatLogisticsDateTime,
  getWarehouseStats,
  LOGISTICS_HUBS,
  LOGISTICS_PAGE_SIZE,
  LOGISTICS_WAREHOUSES,
  queryWarehouseShipments,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type {
  WarehouseShipment,
  WarehouseShipmentFilters,
} from "@/types/logistics.types";
import { notify } from "@/utils/notify";

type WarehouseStatKey =
  | "transfers-today"
  | "pending"
  | "loading"
  | "in-transit"
  | "delayed"
  | "completed";

const STAT_STATUS_MAP: Record<WarehouseStatKey, string> = {
  "transfers-today": "all",
  pending: "pending",
  loading: "loading",
  "in-transit": "in_transit",
  delayed: "delayed",
  completed: "completed",
};

export function WarehouseLogisticsPage() {
  const { isLoading } = useLogisticsLoading();
  const warehouseShipments = useLogisticsStore((s) => s.warehouseShipments);
  const [filters, setFilters] = useState<WarehouseShipmentFilters>(
    EMPTY_WAREHOUSE_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [selectedShipment, setSelectedShipment] =
    useState<WarehouseShipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const stats = useMemo(
    () => getWarehouseStats(warehouseShipments),
    [warehouseShipments],
  );

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "transfers-today",
        label: "Transfers Today",
        value: String(stats.transfersToday),
        icon: Package,
      },
      {
        id: "pending",
        label: "Pending",
        value: String(stats.pending),
        variant: "warning",
        icon: Clock,
      },
      {
        id: "loading",
        label: "Loading",
        value: String(stats.loading),
        icon: Package,
      },
      {
        id: "in-transit",
        label: "In Transit",
        value: String(stats.inTransit),
        icon: Truck,
      },
      {
        id: "delayed",
        label: "Delayed",
        value: String(stats.delayed),
        variant: "critical",
        icon: AlertTriangle,
      },
      {
        id: "completed",
        label: "Completed",
        value: String(stats.completed),
        variant: "success",
        icon: CheckCircle2,
      },
    ],
    [stats],
  );

  const queryResult = useMemo(
    () =>
      queryWarehouseShipments(
        warehouseShipments,
        currentPage,
        LOGISTICS_PAGE_SIZE,
        filters,
      ),
    [warehouseShipments, currentPage, filters],
  );

  const filterConfigs = [
    {
      label: "Warehouse",
      value: filters.warehouse,
      onChange: (v: string) => setFilters((f) => ({ ...f, warehouse: v })),
      options: [
        { value: "all", label: "All Warehouses" },
        ...LOGISTICS_WAREHOUSES.map((w) => ({ value: w, label: w })),
      ],
    },
    {
      label: "Destination Hub",
      value: filters.destinationHub,
      onChange: (v: string) => setFilters((f) => ({ ...f, destinationHub: v })),
      options: [
        { value: "all", label: "All Hubs" },
        ...LOGISTICS_HUBS.map((h) => ({ value: h, label: h })),
      ],
    },
    {
      label: "Priority",
      value: filters.priority,
      onChange: (v: string) => setFilters((f) => ({ ...f, priority: v })),
      options: [
        { value: "all", label: "All Priorities" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => {
        setFilters((f) => ({ ...f, status: v }));
        setCurrentPage(1);
      },
      options: [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "assigned", label: "Assigned" },
        { value: "loading", label: "Loading" },
        { value: "dispatched", label: "Dispatched" },
        { value: "in_transit", label: "In Transit" },
        { value: "reached_hub", label: "Reached Hub" },
        { value: "completed", label: "Completed" },
        { value: "delayed", label: "Delayed" },
      ],
    },
  ];

  const handleStatCardClick = (statId: WarehouseStatKey) => {
    const nextStatus = STAT_STATUS_MAP[statId];
    setFilters((prev) => ({
      ...prev,
      status: prev.status === nextStatus ? "all" : nextStatus,
    }));
    setCurrentPage(1);
  };

  const openShipmentDetail = (item: WarehouseShipment) => {
    setSelectedShipment(item);
    setDetailOpen(true);
  };

  const handleAction = (action: string, item: WarehouseShipment) => {
    if (action === "assign-vehicle") {
      setAssignTargetId(item.shipmentId);
      setAssignVehicleOpen(true);
    } else if (action === "assign-driver") {
      setAssignTargetId(item.shipmentId);
      setAssignDriverOpen(true);
    } else if (action === "track") {
      notify.info(
        "Tracking Shipment",
        `Opening tracker for ${item.shipmentId}`,
      );
    } else if (action === "view") {
      openShipmentDetail(item);
    }
  };

  const activeStatId = (
    Object.entries(STAT_STATUS_MAP) as [WarehouseStatKey, string][]
  ).find(([, status]) => status === filters.status)?.[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((stat) => (
          <LogisticsMetricCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            isActive={activeStatId === stat.id}
            onClick={() => handleStatCardClick(stat.id as WarehouseStatKey)}
          />
        ))}
      </div>

      <LogisticsFilterBar
        searchPlaceholder="Shipment ID, warehouse, hub..."
        searchValue={filters.search}
        onSearchChange={(v) => {
          setFilters((f) => ({ ...f, search: v }));
          setCurrentPage(1);
        }}
        filters={filterConfigs}
        onReset={() => {
          setFilters(EMPTY_WAREHOUSE_FILTERS);
          setCurrentPage(1);
        }}
      />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : queryResult.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Shipments"
              description="No warehouse shipments match your filters."
              icon={<Package className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="sticky top-0 text-xs font-semibold text-gray-400 uppercase">
                    Shipment ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Warehouse
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Destination Hub
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Driver
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Dispatch Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    ETA
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Priority
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {item.shipmentId}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-[#64748B]">
                      {item.warehouse}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-[#64748B]">
                      {item.destinationHub}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.vehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {item.dispatchTime
                        ? formatLogisticsDateTime(item.dispatchTime)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDateTime(item.eta)}
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={item.priority} />
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="size-8"
                          aria-label={`View ${item.shipmentId}`}
                          onClick={() => handleAction("view", item)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="size-8"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleAction("track", item)}
                            >
                              Track Shipment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("assign-vehicle", item)
                              }
                            >
                              Assign Vehicle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("assign-driver", item)
                              }
                            >
                              Assign Driver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && queryResult.meta.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={queryResult.meta.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={queryResult.meta.total}
            onPageChange={setCurrentPage}
            itemLabel="shipments"
          />
        ) : null}
      </div>

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetType="warehouse"
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetType="warehouse"
      />
      <WarehouseShipmentDetailDrawer
        shipment={selectedShipment}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedShipment(null);
        }}
        onAssignVehicle={(shipmentId) => {
          setDetailOpen(false);
          setAssignTargetId(shipmentId);
          setAssignVehicleOpen(true);
        }}
        onAssignDriver={(shipmentId) => {
          setDetailOpen(false);
          setAssignTargetId(shipmentId);
          setAssignDriverOpen(true);
        }}
        onTrack={(shipmentId) => {
          notify.info("Tracking Shipment", `Opening tracker for ${shipmentId}`);
        }}
      />
    </div>
  );
}
