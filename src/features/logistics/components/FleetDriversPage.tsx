"use client";

import { MoreVertical, Plus, User, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

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
import {
  useDeleteDriver,
  useDriverStats,
  useDrivers,
} from "@/features/logistics/hooks/use-drivers";
import { mapUiStatusFilterToApi } from "@/features/logistics/utils/driver-api.mapper";
import { LOGISTICS_PAGE_SIZE } from "@/features/logistics/utils/logistics-formatters";
import { hubsService } from "@/services/hubs.service";
import type { LogisticsDriver, DriverFilters } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

const EMPTY_FILTERS: DriverFilters = {
  search: "",
  status: "all",
  hub: "all",
};

export function FleetDriversPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DriverFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<LogisticsDriver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogisticsDriver | null>(
    null,
  );
  const [detailDriver, setDetailDriver] = useState<LogisticsDriver | null>(
    null,
  );

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs-for-fleet-drivers"],
    queryFn: () => hubsService.list({ page: 1, limit: 200 }),
  });

  const hubs = hubsQuery.data?.data ?? [];
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

  const selectedHubId = useMemo(() => {
    if (filters.hub === "all") return undefined;
    return deliveryHubs.find((h) => h.name === filters.hub || h.id === filters.hub)
      ?.id;
  }, [filters.hub, deliveryHubs]);

  const listParams = useMemo(
    () => ({
      page: currentPage,
      limit: LOGISTICS_PAGE_SIZE,
      search: filters.search || undefined,
      status: mapUiStatusFilterToApi(filters.status),
      hubId: selectedHubId,
      includeInactive: true,
    }),
    [currentPage, filters.search, filters.status, selectedHubId],
  );

  const driversQuery = useDrivers(listParams);
  const statsQuery = useDriverStats(
    selectedHubId ? { hubId: selectedHubId } : undefined,
  );
  const deleteMutation = useDeleteDriver();

  const drivers = driversQuery.data?.drivers ?? [];
  const meta = driversQuery.data?.meta ?? {
    page: 1,
    limit: LOGISTICS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };
  const isLoading = driversQuery.isLoading || statsQuery.isLoading;

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (!idParam) return;
    const match = drivers.find((d) => d.id === idParam);
    if (match) {
      setDetailDriver(match);
      setFilters((current) => ({ ...current, search: match.name }));
    }
  }, [searchParams, drivers]);

  const stats = statsQuery.data ?? {
    total: 0,
    available: 0,
    onTrip: 0,
    onLeave: 0,
    inactive: 0,
  };

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
        { value: "driving", label: "On Trip" },
        { value: "on_leave", label: "On Leave" },
        { value: "inactive", label: "Inactive" },
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
        { value: "all", label: "All Hubs" },
        ...deliveryHubs.map((h) => ({ value: h.name, label: h.name })),
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
        ) : drivers.length === 0 ? (
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
                {drivers.map((driver) => (
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
                            Deactivate
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
        title="Deactivate Driver"
        description={`Are you sure you want to deactivate ${deleteTarget?.name}? Historical orders will be preserved.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              notify.success("Driver Deactivated");
              setDeleteTarget(null);
            },
            onError: (err: unknown) => {
              const message =
                err && typeof err === "object" && "response" in err
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ((err as any).response?.data?.message as string)
                  : undefined;
              notify.error(message || "Failed to deactivate driver");
            },
          });
        }}
      />
    </div>
  );
}
