"use client";

import { MoreVertical, Plus, User, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { SubModuleTabs } from "@/components/shared/SubModuleTabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { AddDriverDialog } from "@/features/logistics/components/AddDriverDialog";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import { DriverDetailDrawer } from "@/features/logistics/components/DriverDetailDrawer";
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import {
  EMPTY_DRIVER_FILTERS,
  getDriverStats,
  LOGISTICS_HUBS,
  LOGISTICS_PAGE_SIZE,
  queryDrivers,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { LogisticsDriver, DriverFilters } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

export function FleetDriversPage() {
  const { isLoading } = useLogisticsLoading();
  const drivers = useLogisticsStore((s) => s.drivers);
  const deleteDriver = useLogisticsStore((s) => s.deleteDriver);

  const [filters, setFilters] = useState<DriverFilters>(EMPTY_DRIVER_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<LogisticsDriver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogisticsDriver | null>(
    null,
  );
  const [detailDriver, setDetailDriver] = useState<LogisticsDriver | null>(
    null,
  );

  const stats = useMemo(() => getDriverStats(drivers), [drivers]);

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "total",
        label: "Total Drivers",
        value: String(stats.total),
        icon: Users,
      },
      {
        id: "available",
        label: "Available",
        value: String(stats.available),
        variant: "success",
      },
      { id: "on-trip", label: "On Trip", value: String(stats.onTrip) },
      {
        id: "on-leave",
        label: "On Leave",
        value: String(stats.onLeave),
        variant: "warning",
      },
      { id: "inactive", label: "Inactive", value: String(stats.inactive) },
    ],
    [stats],
  );

  const queryResult = useMemo(
    () => queryDrivers(drivers, currentPage, LOGISTICS_PAGE_SIZE, filters),
    [drivers, currentPage, filters],
  );

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => setFilters((f) => ({ ...f, status: v })),
      options: [
        { value: "all", label: "All Statuses" },
        { value: "available", label: "Available" },
        { value: "driving", label: "Driving" },
        { value: "on_leave", label: "On Leave" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      label: "Hub",
      value: filters.hub,
      onChange: (v: string) => setFilters((f) => ({ ...f, hub: v })),
      options: [
        { value: "all", label: "All Hubs" },
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
        activeTab="drivers"
      />

      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditDriver(null);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Add Driver
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
        searchPlaceholder="Driver name, employee ID..."
        searchValue={filters.search}
        onSearchChange={(v) => {
          setFilters((f) => ({ ...f, search: v }));
          setCurrentPage(1);
        }}
        filters={filterConfigs}
        onReset={() => {
          setFilters(EMPTY_DRIVER_FILTERS);
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
              title="No Drivers Available"
              description="Add a driver or adjust your filters."
              icon={<User className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Photo
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Driver Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Employee ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Mobile
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    License
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Hub
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Trips Today
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
                {queryResult.data.map((driver) => (
                  <TableRow
                    key={driver.id}
                    className="cursor-pointer hover:bg-gray-50/50"
                    onClick={() => setDetailDriver(driver)}
                  >
                    <TableCell>
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {driver.employeeId}
                    </TableCell>
                    <TableCell className="text-sm">{driver.mobile}</TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {driver.licenseNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {driver.assignedVehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-sm text-[#64748B]">
                      {driver.assignedHub}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {driver.tripsToday}
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={driver.status} />
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
                            onClick={() => setDetailDriver(driver)}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              notify.success(
                                "Vehicle Assigned",
                                `Vehicle assignment initiated for ${driver.name}.`,
                              )
                            }
                          >
                            Assign Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              notify.success(
                                "Hub Transfer Initiated",
                                `${driver.name} transfer scheduled.`,
                              )
                            }
                          >
                            Transfer Hub
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditDriver(driver);
                              setAddDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteTarget(driver)}
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
            itemLabel="drivers"
          />
        ) : null}
      </div>

      <AddDriverDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        editDriver={editDriver}
      />
      <DriverDetailDrawer
        driver={detailDriver}
        open={!!detailDriver}
        onOpenChange={(open) => !open && setDetailDriver(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Driver"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteDriver(deleteTarget.id);
            notify.success("Driver Deleted");
          }
        }}
      />
    </div>
  );
}
