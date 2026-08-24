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
import { useRouter } from "next/navigation";

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
import { ROUTES } from "@/constants/routes";
import { AssignDriverDialog } from "@/features/logistics/components/AssignDriverDialog";
import { AssignVehicleDialog } from "@/features/logistics/components/AssignVehicleDialog";
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { WarehouseShipmentDetailDrawer } from "@/features/logistics/components/WarehouseShipmentDetailDrawer";
import {
  useLogisticsFilters,
  useWarehouseLogistics,
} from "@/features/logistics/hooks/use-logistics";
import {
  EMPTY_WAREHOUSE_FILTERS,
  formatLogisticsDateTime,
  LOGISTICS_PAGE_SIZE,
} from "@/features/logistics/utils/logistics-formatters";
import type {
  WarehouseShipment,
  WarehouseShipmentFilters,
} from "@/types/logistics.types";

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
  const router = useRouter();
  const [filters, setFilters] = useState<WarehouseShipmentFilters>(
    EMPTY_WAREHOUSE_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [assignTargetLabel, setAssignTargetLabel] = useState("");
  const [selectedShipment, setSelectedShipment] =
    useState<WarehouseShipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: filterOptions } = useLogisticsFilters();

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      warehouseId:
        filters.warehouse !== "all" ? filters.warehouse : undefined,
      destinationHubId:
        filters.destinationHub !== "all" ? filters.destinationHub : undefined,
      priority: filters.priority !== "all" ? filters.priority : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      page: currentPage,
      limit: LOGISTICS_PAGE_SIZE,
    }),
    [filters, currentPage],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useWarehouseLogistics(queryParams);

  const stats = data?.stats ?? {
    transfersToday: 0,
    pending: 0,
    loading: 0,
    inTransit: 0,
    delayed: 0,
    completed: 0,
  };

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

  const filterConfigs = [
    {
      label: "Warehouse",
      value: filters.warehouse,
      onChange: (v: string) => setFilters((f) => ({ ...f, warehouse: v })),
      options: [
        { value: "all", label: "All Warehouses" },
        ...(filterOptions?.warehouses ?? []).map((w) => ({
          value: w.id,
          label: w.name,
        })),
      ],
    },
    {
      label: "Destination Hub",
      value: filters.destinationHub,
      onChange: (v: string) =>
        setFilters((f) => ({ ...f, destinationHub: v })),
      options: [
        { value: "all", label: "All Hubs" },
        ...(filterOptions?.hubs ?? []).map((h) => ({
          value: h.id,
          label: h.name,
        })),
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

  const openAssign = (
    item: WarehouseShipment,
    type: "vehicle" | "driver",
  ) => {
    setAssignTargetId(item.id);
    setAssignTargetLabel(item.shipmentId);
    if (type === "vehicle") setAssignVehicleOpen(true);
    else setAssignDriverOpen(true);
  };

  const activeStatId = (
    Object.entries(STAT_STATUS_MAP) as [WarehouseStatKey, string][]
  ).find(([, status]) => status === filters.status)?.[0];

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-white p-10 text-center">
        <p className="text-sm font-medium">Unable to load warehouse transfers.</p>
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

  const rows = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: LOGISTICS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

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
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No warehouse transfers found."
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
                {rows.map((item) => (
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
                          onClick={() => {
                            setSelectedShipment(item);
                            setDetailOpen(true);
                          }}
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
                              onClick={() =>
                                router.push(
                                  `${ROUTES.LOGISTICS}/tracking?id=${encodeURIComponent(item.shipmentId)}`,
                                )
                              }
                            >
                              Track Shipment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openAssign(item, "vehicle")}
                            >
                              Assign Vehicle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openAssign(item, "driver")}
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

        {!isLoading && meta.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={meta.total}
            onPageChange={setCurrentPage}
            itemLabel="shipments"
          />
        ) : null}
      </div>

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType="warehouse"
        onAssigned={() => void refetch()}
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType="warehouse"
        onAssigned={() => void refetch()}
      />
      <WarehouseShipmentDetailDrawer
        shipment={selectedShipment}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedShipment(null);
        }}
        onAssignVehicle={() => {
          if (!selectedShipment) return;
          setDetailOpen(false);
          openAssign(selectedShipment, "vehicle");
        }}
        onAssignDriver={() => {
          if (!selectedShipment) return;
          setDetailOpen(false);
          openAssign(selectedShipment, "driver");
        }}
        onTrack={(shipmentId) => {
          router.push(
            `${ROUTES.LOGISTICS}/tracking?id=${encodeURIComponent(shipmentId)}`,
          );
        }}
      />
    </div>
  );
}
