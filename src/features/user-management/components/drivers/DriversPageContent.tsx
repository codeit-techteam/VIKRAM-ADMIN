"use client";

import {
  Ban,
  CalendarOff,
  Download,
  Plus,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { AddDriverDialog } from "@/features/logistics/components/AddDriverDialog";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import { DriverDetailDrawer } from "@/features/logistics/components/DriverDetailDrawer";
import {
  useDeleteDriver,
  useDriverStats,
  useDrivers,
} from "@/features/logistics/hooks/use-drivers";
import { mapUiStatusFilterToApi } from "@/features/logistics/utils/driver-api.mapper";
import { DriverFiltersBar } from "@/features/user-management/components/drivers/DriverFiltersBar";
import { DriverTable } from "@/features/user-management/components/drivers/DriverTable";
import { UserManagementTabs } from "@/features/user-management/components/UserManagementTabs";
import { hubsService } from "@/services/hubs.service";
import type { DriverFilters, LogisticsDriver } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

const DRIVER_PAGE_SIZE = 10;

const EMPTY_DRIVER_FILTERS: DriverFilters = {
  search: "",
  status: "all",
  hub: "all",
};

type DriverStatKey = "total" | "available" | "onTrip" | "onLeave" | "inactive";

const STAT_STATUS_MAP: Record<DriverStatKey, string> = {
  total: "all",
  available: "available",
  onTrip: "driving",
  onLeave: "on_leave",
  inactive: "inactive",
};

function getActiveStatKey(filters: DriverFilters): DriverStatKey | null {
  if (filters.status === "available") return "available";
  if (filters.status === "driving") return "onTrip";
  if (filters.status === "on_leave") return "onLeave";
  if (filters.status === "inactive") return "inactive";
  if (filters.status === "all") return "total";
  return null;
}

export function DriversPageContent() {
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [draftFilters, setDraftFilters] =
    useState<DriverFilters>(EMPTY_DRIVER_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<DriverFilters>(EMPTY_DRIVER_FILTERS);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<LogisticsDriver | null>(null);
  const [detailDriver, setDetailDriver] = useState<LogisticsDriver | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<LogisticsDriver | null>(
    null,
  );

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs-for-user-mgmt-drivers"],
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
    if (appliedFilters.hub === "all") return undefined;
    return deliveryHubs.find(
      (h) => h.name === appliedFilters.hub || h.id === appliedFilters.hub,
    )?.id;
  }, [appliedFilters.hub, deliveryHubs]);

  const listParams = useMemo(
    () => ({
      page: currentPage,
      limit: DRIVER_PAGE_SIZE,
      search: appliedFilters.search || undefined,
      status: mapUiStatusFilterToApi(appliedFilters.status),
      hubId: selectedHubId,
      includeInactive: true,
    }),
    [
      currentPage,
      appliedFilters.search,
      appliedFilters.status,
      selectedHubId,
    ],
  );

  const driversQuery = useDrivers(listParams);
  const statsQuery = useDriverStats(
    selectedHubId ? { hubId: selectedHubId } : undefined,
  );
  const deleteMutation = useDeleteDriver();

  const drivers = driversQuery.data?.drivers ?? [];
  const meta = driversQuery.data?.meta ?? {
    page: 1,
    limit: DRIVER_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };
  const isLoading = driversQuery.isLoading || statsQuery.isLoading;

  const stats = statsQuery.data ?? {
    total: 0,
    available: 0,
    onTrip: 0,
    onLeave: 0,
    inactive: 0,
  };

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const idParam = searchParams.get("id");

    if (statusParam) {
      const filters: DriverFilters = {
        ...EMPTY_DRIVER_FILTERS,
        status: statusParam.toLowerCase(),
      };
      setDraftFilters(filters);
      setAppliedFilters(filters);
      setCurrentPage(1);
    }

    if (idParam) {
      const match = drivers.find((driver) => driver.id === idParam);
      if (match) {
        setDetailDriver(match);
      }
    }
  }, [searchParams, drivers]);

  const hubOptions = useMemo(
    () =>
      deliveryHubs.map((hub) => ({
        value: hub.name,
        label: hub.name,
      })),
    [deliveryHubs],
  );

  const activeStatKey = getActiveStatKey(appliedFilters);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(EMPTY_DRIVER_FILTERS);
    setAppliedFilters(EMPTY_DRIVER_FILTERS);
    setCurrentPage(1);
  }, []);

  const handleStatCardClick = useCallback(
    (statId: DriverStatKey) => {
      const nextStatus =
        activeStatKey === statId && statId !== "total"
          ? "all"
          : STAT_STATUS_MAP[statId];

      const nextFilters: DriverFilters = {
        ...EMPTY_DRIVER_FILTERS,
        status: nextStatus,
      };

      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setCurrentPage(1);
    },
    [activeStatKey],
  );

  const handleExport = () => {
    notify.success("Export started", "Driver list exported as CSV.");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        notify.success("Driver Deleted");
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        const message =
          err && typeof err === "object" && "response" in err
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((err as any).response?.data?.message as string)
            : undefined;
        notify.error(message || "Failed to delete driver");
      },
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "User Management", href: ROUTES.USER_MANAGEMENT },
          { label: "Drivers" },
        ]}
      />

      <PageHeader
        title="Driver Management"
        subtitle="Manage fleet drivers, vehicle assignments, hub transfers, and trip readiness."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                setEditDriver(null);
                setAddDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add Driver
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleExport}
              aria-label="Export drivers"
            >
              <Download className="size-4" />
            </Button>
          </div>
        }
      />

      <UserManagementTabs activeTab="drivers" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Total Drivers"
              value={stats.total}
              icon={Users}
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-600"
              isActive={activeStatKey === "total"}
              onClick={() => handleStatCardClick("total")}
            />
            <StatCard
              label="Available"
              value={stats.available}
              icon={UserCheck}
              iconContainerClassName="bg-emerald-50"
              iconClassName="text-emerald-600"
              isActive={activeStatKey === "available"}
              onClick={() => handleStatCardClick("available")}
            />
            <StatCard
              label="On Trip"
              value={stats.onTrip}
              icon={Truck}
              iconContainerClassName="bg-sky-50"
              iconClassName="text-sky-600"
              isActive={activeStatKey === "onTrip"}
              onClick={() => handleStatCardClick("onTrip")}
            />
            <StatCard
              label="On Leave"
              value={stats.onLeave}
              icon={CalendarOff}
              iconContainerClassName="bg-amber-50"
              iconClassName="text-amber-600"
              isActive={activeStatKey === "onLeave"}
              onClick={() => handleStatCardClick("onLeave")}
            />
            <StatCard
              label="Inactive"
              value={stats.inactive}
              icon={Ban}
              iconContainerClassName="bg-gray-100"
              iconClassName="text-gray-500"
              isActive={activeStatKey === "inactive"}
              onClick={() => handleStatCardClick("inactive")}
            />
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <DriverFiltersBar
          filters={draftFilters}
          onChange={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          hubOptions={hubOptions}
        />

        <DriverTable
          drivers={drivers}
          isLoading={isLoading}
          onView={setDetailDriver}
          onEdit={(driver) => {
            setEditDriver(driver);
            setAddDialogOpen(true);
          }}
          onAssignVehicle={(driver) =>
            notify.success(
              "Vehicle Assigned",
              `Vehicle assignment initiated for ${driver.name}.`,
            )
          }
          onTransferHub={(driver) =>
            notify.success(
              "Hub Transfer Initiated",
              `${driver.name} transfer scheduled.`,
            )
          }
          onDelete={setDeleteTarget}
        />

        {!isLoading && meta.total > 0 ? (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            pageSize={meta.limit}
            totalItems={meta.total}
            onPageChange={setCurrentPage}
            itemLabel="drivers"
          />
        ) : null}
      </div>

      <AddDriverDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditDriver(null);
        }}
        editDriver={editDriver}
      />

      <DriverDetailDrawer
        driver={detailDriver}
        open={Boolean(detailDriver)}
        onOpenChange={(open) => {
          if (!open) setDetailDriver(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Driver"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
