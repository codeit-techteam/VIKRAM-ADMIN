"use client";

import { MoreVertical, Plus, Truck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { SubModuleTabs } from "@/components/shared/SubModuleTabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { FLEET_TABS } from "@/constants/logistics-navigation.constants";
import { ROUTES } from "@/constants/routes";
import { AddVehicleDialog } from "@/features/logistics/components/AddVehicleDialog";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import { VehicleDetailDrawer } from "@/features/logistics/components/VehicleDetailDrawer";
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useStartMaintenance } from "@/features/logistics/hooks/use-logistics";
import {
  useDeleteVehicle,
  useVehicleStats,
  useVehicles,
} from "@/features/logistics/hooks/use-vehicles";
import { mapUiStatusFilterToApi } from "@/features/logistics/utils/vehicle-api.mapper";
import {
  formatLogisticsDate,
  LOGISTICS_PAGE_SIZE,
} from "@/features/logistics/utils/logistics-formatters";
import { hubsService } from "@/services/hubs.service";
import type { LogisticsVehicle, VehicleFilters } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

type VehicleStatKey =
  | "total"
  | "running"
  | "available"
  | "maintenance"
  | "inactive";

const STAT_STATUS_MAP: Record<VehicleStatKey, string> = {
  total: "all",
  running: "running",
  available: "available",
  maintenance: "maintenance",
  inactive: "inactive",
};

const EMPTY_FILTERS: VehicleFilters = {
  search: "",
  status: "all",
  warehouse: "all",
  hub: "all",
};

export function FleetVehiclesPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<LogisticsVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogisticsVehicle | null>(
    null,
  );
  const [detailVehicle, setDetailVehicle] = useState<LogisticsVehicle | null>(
    null,
  );

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs-for-fleet"],
    queryFn: () => hubsService.list({ page: 1, limit: 200 }),
  });

  const hubs = hubsQuery.data?.data ?? [];
  const warehouseHubs = useMemo(
    () =>
      hubs.filter(
        (h) =>
          String(h.hubType ?? "")
            .toUpperCase()
            .includes("WAREHOUSE") ||
          String(h.code ?? "")
            .toUpperCase()
            .includes("WAREHOUSE"),
      ),
    [hubs],
  );
  const deliveryHubs = useMemo(
    () =>
      hubs.filter(
        (h) =>
          !String(h.hubType ?? "")
            .toUpperCase()
            .includes("WAREHOUSE"),
      ),
    [hubs],
  );

  const listParams = useMemo(
    () => ({
      page: currentPage,
      limit: LOGISTICS_PAGE_SIZE,
      search: filters.search || undefined,
      status: mapUiStatusFilterToApi(filters.status),
      hubId: filters.hub !== "all" ? filters.hub : undefined,
      warehouseHubId:
        filters.warehouse !== "all" ? filters.warehouse : undefined,
    }),
    [currentPage, filters],
  );

  const vehiclesQuery = useVehicles(listParams);
  const statsQuery = useVehicleStats();
  const deleteMutation = useDeleteVehicle();
  const startMaintenance = useStartMaintenance();

  const vehicles = vehiclesQuery.data?.vehicles ?? [];
  const meta = vehiclesQuery.data?.meta ?? {
    page: 1,
    limit: LOGISTICS_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  };
  const isLoading = vehiclesQuery.isLoading || statsQuery.isLoading;

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (!idParam) return;
    const match = vehicles.find((v) => v.id === idParam);
    if (match) {
      setDetailVehicle(match);
      setFilters((current) => ({
        ...current,
        search: match.vehicleNumber,
      }));
    }
  }, [searchParams, vehicles]);

  const stats = statsQuery.data ?? {
    total: 0,
    running: 0,
    available: 0,
    maintenance: 0,
    inactive: 0,
  };

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "total",
        label: "Total Vehicles",
        value: String(stats.total),
        icon: Truck,
      },
      {
        id: "running",
        label: "Running",
        value: String(stats.running),
        variant: "success",
      },
      { id: "available", label: "Available", value: String(stats.available) },
      {
        id: "maintenance",
        label: "Maintenance",
        value: String(stats.maintenance),
        variant: "warning",
      },
      { id: "inactive", label: "Inactive", value: String(stats.inactive) },
    ],
    [stats],
  );

  const handleStatCardClick = (statId: VehicleStatKey) => {
    const nextStatus = STAT_STATUS_MAP[statId];
    setFilters((prev) => ({
      ...prev,
      status: prev.status === nextStatus ? "all" : nextStatus,
    }));
    setCurrentPage(1);
  };

  const activeStatId = (
    Object.entries(STAT_STATUS_MAP) as [VehicleStatKey, string][]
  ).find(([, status]) => status === filters.status)?.[0];

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => {
        setFilters((f) => ({ ...f, status: v }));
        setCurrentPage(1);
      },
      options: [
        { value: "all", label: "All Statuses" },
        { value: "available", label: "Available" },
        { value: "assigned", label: "Assigned" },
        { value: "loading", label: "Loading" },
        { value: "running", label: "Running" },
        { value: "maintenance", label: "Maintenance" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      label: "Warehouse",
      value: filters.warehouse,
      onChange: (v: string) => {
        setFilters((f) => ({ ...f, warehouse: v }));
        setCurrentPage(1);
      },
      options: [
        { value: "all", label: "All" },
        ...warehouseHubs.map((w) => ({ value: w.id, label: w.name })),
      ],
    },
    {
      label: "Hub",
      value: filters.hub,
      onChange: (v: string) => {
        setFilters((f) => ({ ...f, hub: v }));
        setCurrentPage(1);
      },
      options: [
        { value: "all", label: "All" },
        ...deliveryHubs.map((h) => ({ value: h.id, label: h.name })),
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <SubModuleTabs
        backHref={ROUTES.LOGISTICS}
        backLabel="Logistics"
        tabs={FLEET_TABS}
        activeTab="vehicles"
      />

      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditVehicle(null);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((stat) => (
          <LogisticsMetricCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            isActive={activeStatId === stat.id}
            onClick={() => handleStatCardClick(stat.id as VehicleStatKey)}
          />
        ))}
      </div>

      <LogisticsFilterBar
        searchPlaceholder="Vehicle number, type..."
        searchValue={filters.search}
        onSearchChange={(v) => {
          setFilters((f) => ({ ...f, search: v }));
          setCurrentPage(1);
        }}
        filters={filterConfigs}
        onReset={() => {
          setFilters(EMPTY_FILTERS);
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
        ) : vehicles.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Vehicles Found"
              description="Add a vehicle or adjust your filters."
              icon={<Truck className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle Number
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Capacity
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Warehouse
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Hub
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Driver
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Shipment
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Fitness Expiry
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Insurance Expiry
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
                {vehicles.map((vehicle) => (
                  <TableRow
                    key={vehicle.id}
                    className="cursor-pointer hover:bg-gray-50/50"
                    onClick={() => setDetailVehicle(vehicle)}
                  >
                    <TableCell className="font-medium">
                      {vehicle.vehicleNumber}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {vehicle.vehicleType}
                    </TableCell>
                    <TableCell className="text-sm">
                      {vehicle.capacityLabel ??
                        `${(vehicle.capacityKg / 1000).toFixed(1)}T`}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm text-[#64748B]">
                      {vehicle.assignedWarehouse || "—"}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm text-[#64748B]">
                      {vehicle.assignedHub || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {vehicle.assignedDriverName ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {vehicle.currentShipmentId ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDate(vehicle.fitnessExpiry)}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDate(vehicle.insuranceExpiry)}
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={vehicle.status} />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                            onClick={() => {
                              setEditVehicle(vehicle);
                              setAddDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              startMaintenance.mutate(
                                { vehicleId: vehicle.id },
                                {
                                  onSuccess: () =>
                                    notify.success("Maintenance Scheduled"),
                                  onError: (err) =>
                                    notify.error(
                                      "Failed",
                                      err instanceof Error
                                        ? err.message
                                        : "Could not update vehicle",
                                    ),
                                },
                              );
                            }}
                          >
                            Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteTarget(vehicle)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            itemLabel="vehicles"
          />
        ) : null}
      </div>

      <AddVehicleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        editVehicle={editVehicle}
      />
      <VehicleDetailDrawer
        vehicle={detailVehicle}
        open={!!detailVehicle}
        onOpenChange={(open) => !open && setDetailVehicle(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Vehicle"
        description={`Are you sure you want to delete ${deleteTarget?.vehicleNumber}?`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              notify.success("Vehicle deactivated");
              setDeleteTarget(null);
            },
            onError: (err) =>
              notify.error(
                "Failed",
                err instanceof Error ? err.message : "Could not delete vehicle",
              ),
          });
        }}
      />
    </div>
  );
}
