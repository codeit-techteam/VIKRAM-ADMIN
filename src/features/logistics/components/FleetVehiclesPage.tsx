"use client";

import { MoreVertical, Plus, Truck, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

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
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import {
  EMPTY_VEHICLE_FILTERS,
  formatLogisticsDate,
  getVehicleStats,
  LOGISTICS_HUBS,
  LOGISTICS_PAGE_SIZE,
  LOGISTICS_WAREHOUSES,
  queryVehicles,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { LogisticsVehicle, VehicleFilters } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

export function FleetVehiclesPage() {
  const { isLoading } = useLogisticsLoading();
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const deleteVehicle = useLogisticsStore((s) => s.deleteVehicle);
  const updateVehicle = useLogisticsStore((s) => s.updateVehicle);

  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_VEHICLE_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<LogisticsVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogisticsVehicle | null>(
    null,
  );

  const stats = useMemo(() => getVehicleStats(vehicles), [vehicles]);

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

  const queryResult = useMemo(
    () => queryVehicles(vehicles, currentPage, LOGISTICS_PAGE_SIZE, filters),
    [vehicles, currentPage, filters],
  );

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => setFilters((f) => ({ ...f, status: v })),
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
      onChange: (v: string) => setFilters((f) => ({ ...f, warehouse: v })),
      options: [
        { value: "all", label: "All" },
        ...LOGISTICS_WAREHOUSES.map((w) => ({ value: w, label: w })),
      ],
    },
    {
      label: "Hub",
      value: filters.hub,
      onChange: (v: string) => setFilters((f) => ({ ...f, hub: v })),
      options: [
        { value: "all", label: "All" },
        ...LOGISTICS_HUBS.map((h) => ({ value: h, label: h })),
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
          setFilters(EMPTY_VEHICLE_FILTERS);
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
                {queryResult.data.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {vehicle.vehicleNumber}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {vehicle.vehicleType}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(vehicle.capacityKg / 1000).toFixed(1)}T
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm text-[#64748B]">
                      {vehicle.assignedWarehouse}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm text-[#64748B]">
                      {vehicle.assignedHub}
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="size-8"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
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
                            onClick={() =>
                              notify.success(
                                "Vehicle Transferred",
                                `${vehicle.vehicleNumber} transfer initiated.`,
                              )
                            }
                          >
                            Transfer Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              updateVehicle(vehicle.id, {
                                status: "maintenance",
                              });
                              notify.success("Maintenance Scheduled");
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

        {!isLoading && queryResult.meta.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={queryResult.meta.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={queryResult.meta.total}
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
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Vehicle"
        description={`Are you sure you want to delete ${deleteTarget?.vehicleNumber}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteVehicle(deleteTarget.id);
            notify.success("Vehicle Deleted");
          }
        }}
      />
    </div>
  );
}
