"use client";

import {
  AlertTriangle,
  Building2,
  Download,
  Plus,
  RefreshCw,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { UserManagementTabs } from "@/features/user-management/components/UserManagementTabs";
import { AssignManagerHubDialog } from "@/features/user-management/components/sub-hub-manager/AssignManagerHubDialog";
import {
  ManagerCard,
  ManagerCardSkeleton,
} from "@/features/user-management/components/sub-hub-manager/ManagerCard";
import { ManagerFiltersBar } from "@/features/user-management/components/sub-hub-manager/ManagerFiltersBar";
import { ManagerTable } from "@/features/user-management/components/sub-hub-manager/ManagerTable";
import { TransferHubModal } from "@/features/user-management/components/sub-hub-manager/TransferHubModal";
import { Button } from "@/components/ui/button";
import {
  EMPTY_MANAGER_FILTERS,
  MANAGER_CARDS_PAGE_SIZE,
  MANAGER_PAGE_SIZE,
  type ManagerFilters,
  type SubHubManager,
} from "@/features/user-management/types/sub-hub-manager.types";
import {
  getManagerFilterOptions,
  queryManagers,
} from "@/mock/sub-hub-manager-service";
import { ROUTES } from "@/constants/routes";
import { useLogisticsStore } from "@/store/logistics-store";
import { useSubHubManagerStore } from "@/store/sub-hub-manager-store";
import { normalizeHubInventory } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import { enrichManagersWithOps } from "@/utils/manager-ops-metrics";
import { notify } from "@/utils/notify";

type ManagerStatKey = "total" | "available" | "attention" | "leave";

const STAT_STATUS_MAP: Record<ManagerStatKey, string> = {
  total: "all",
  available: "ACTIVE",
  attention: "NEED_ATTENTION",
  leave: "LEAVE",
};

function getActiveStatKey(filters: ManagerFilters): ManagerStatKey | null {
  if (filters.status === "ACTIVE") return "available";
  if (filters.status === "NEED_ATTENTION") return "attention";
  if (filters.status === "LEAVE") return "leave";
  if (filters.status === "all") return "total";
  return null;
}

export function ManagersPageContent() {
  const transferHub = useSubHubManagerStore((state) => state.transferHub);
  const deactivateManager = useSubHubManagerStore(
    (state) => state.deactivateManager,
  );
  const managers = useSubHubManagerStore((state) => state.managers);

  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const drivers = useLogisticsStore((state) => state.drivers);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardPage, setCardPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<ManagerFilters>(
    EMPTY_MANAGER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<ManagerFilters>(
    EMPTY_MANAGER_FILTERS,
  );

  const [transferManager, setTransferManager] = useState<SubHubManager | null>(
    null,
  );
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const enrichedManagers = useMemo(
    () =>
      enrichManagersWithOps(managers, {
        hubInventory: normalizeHubInventory(hubInventory),
        requisitions,
        transfers,
        drivers,
      }),
    [managers, hubInventory, requisitions, transfers, drivers],
  );

  const tableResult = useMemo(
    () =>
      queryManagers(enrichedManagers, {
        page: currentPage,
        limit: MANAGER_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [enrichedManagers, currentPage, appliedFilters],
  );

  const cardResult = useMemo(
    () =>
      queryManagers(enrichedManagers, {
        page: cardPage,
        limit: MANAGER_CARDS_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [enrichedManagers, cardPage, appliedFilters],
  );

  const filterOptions = useMemo(() => getManagerFilterOptions(), []);
  const activeStatKey = getActiveStatKey(appliedFilters);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    setCardPage(1);
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(EMPTY_MANAGER_FILTERS);
    setAppliedFilters(EMPTY_MANAGER_FILTERS);
    setCurrentPage(1);
    setCardPage(1);
  }, []);

  const handleStatCardClick = useCallback(
    (statId: ManagerStatKey) => {
      const nextStatus =
        activeStatKey === statId && statId !== "total"
          ? "all"
          : STAT_STATUS_MAP[statId];

      const nextFilters: ManagerFilters = {
        ...EMPTY_MANAGER_FILTERS,
        status: nextStatus,
      };

      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setCurrentPage(1);
      setCardPage(1);
    },
    [activeStatKey],
  );

  const handleOpenTransfer = (manager: SubHubManager) => {
    setTransferManager(manager);
    setIsTransferOpen(true);
  };

  const handleTransfer = (
    managerId: string,
    newHubId: string,
    reason: string,
    effectiveDate: string,
  ) => {
    transferHub({ managerId, newHubId, reason, effectiveDate });
    notify.success(
      "Manager Transferred",
      "Manager transferred successfully to new hub.",
    );
  };

  const handleAssignHub = (managerId: string, hubId: string) => {
    transferHub({
      managerId,
      newHubId: hubId,
      reason: "Hub assignment from managers list",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    const manager = enrichedManagers.find((m) => m.id === managerId);
    notify.success(
      "Hub Assigned",
      `${manager?.name ?? "Manager"} assigned to the selected hub.`,
    );
  };

  const handleDeactivate = (manager: SubHubManager) => {
    deactivateManager(manager.id);
    notify.success(
      "Manager Deactivated",
      `${manager.name} has been deactivated.`,
    );
  };

  const handleEdit = (manager: SubHubManager) => {
    notify.success("Edit Manager", `Editing ${manager.name} — form opened.`);
  };

  const handleExport = () => {
    notify.success("Export Started", "Manager list exported as CSV.");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      notify.success("Refreshed", "Manager data refreshed.");
    }, 500);
  };

  const stats = tableResult.stats;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "User Management", href: ROUTES.USER_MANAGEMENT },
          { label: "Sub-Hub Managers" },
        ]}
      />

      <PageHeader
        title="Sub-Hub Manager Management"
        subtitle="Manage Sub-Hub Managers and monitor operational workload across all regional hubs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setIsAssignOpen(true)}
            >
              <Building2 className="size-4" />
              Assign Hub
            </Button>
            <Button
              type="button"
              className="gap-2"
              render={<Link href={ROUTES.SUB_HUB_MANAGER_ADD} />}
            >
              <Plus className="size-4" />
              Create Manager
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleExport}
              aria-label="Export managers"
            >
              <Download className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              aria-label="Refresh"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        }
      />

      <UserManagementTabs activeTab="sub-hub-managers" />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Managers"
              value={stats.totalManagers}
              subtext="Active Hub Managers"
              icon={Users}
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-600"
              isActive={activeStatKey === "total"}
              onClick={() => handleStatCardClick("total")}
            />
            <StatCard
              label="Managers Available"
              value={stats.managersAvailable}
              subtext="Status: Active"
              icon={Zap}
              iconContainerClassName="bg-emerald-50"
              iconClassName="text-emerald-600"
              isActive={activeStatKey === "available"}
              onClick={() => handleStatCardClick("available")}
            />
            <StatCard
              label="Need Attention"
              value={stats.managersNeedAttention}
              subtext="High workload or low stock"
              icon={AlertTriangle}
              iconContainerClassName="bg-amber-50"
              iconClassName="text-amber-600"
              valueVariant={
                stats.managersNeedAttention > 3 ? "warning" : "default"
              }
              isActive={activeStatKey === "attention"}
              onClick={() => handleStatCardClick("attention")}
            />
            <StatCard
              label="Managers On Leave"
              value={stats.managersOnLeave}
              subtext="Approved leave"
              icon={UserX}
              iconContainerClassName="bg-red-50"
              iconClassName="text-red-500"
              isActive={activeStatKey === "leave"}
              onClick={() => handleStatCardClick("leave")}
            />
          </>
        )}
      </div>

      {/* Manager cards section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Manager Overview
          </h2>
          <span className="text-sm text-[#64748B]">
            Showing {cardResult.data.length} of {cardResult.meta.total}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ManagerCardSkeleton key={i} />
              ))
            : cardResult.data.map((manager) => (
                <ManagerCard
                  key={manager.id}
                  manager={manager}
                  onTransfer={handleOpenTransfer}
                />
              ))}
        </div>

        {!isLoading && cardResult.meta.totalPages > 1 && (
          <Pagination
            currentPage={cardResult.meta.page}
            totalPages={cardResult.meta.totalPages}
            pageSize={MANAGER_CARDS_PAGE_SIZE}
            totalItems={cardResult.meta.total}
            onPageChange={setCardPage}
            itemLabel="managers"
          />
        )}
      </section>

      {/* Live Monitoring Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">
              Live Monitoring Table
            </h2>
            <p className="mt-0.5 text-sm text-[#64748B]">
              Real-time operational data for all managers
            </p>
          </div>
        </div>

        <ManagerFiltersBar
          filters={draftFilters}
          onChange={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          regionOptions={filterOptions.regions}
          hubOptions={filterOptions.hubs}
          statusOptions={filterOptions.statuses}
          warehouseOptions={filterOptions.warehouses}
        />

        <ManagerTable
          managers={tableResult.data}
          isLoading={isLoading}
          onEdit={handleEdit}
          onTransfer={handleOpenTransfer}
          onDeactivate={handleDeactivate}
        />

        <Pagination
          currentPage={tableResult.meta.page}
          totalPages={tableResult.meta.totalPages}
          pageSize={tableResult.meta.limit}
          totalItems={tableResult.meta.total}
          onPageChange={setCurrentPage}
          itemLabel="managers"
        />
      </div>

      <TransferHubModal
        manager={transferManager}
        open={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setTransferManager(null);
        }}
        onTransfer={handleTransfer}
      />

      <AssignManagerHubDialog
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        managers={enrichedManagers}
        onAssign={handleAssignHub}
      />
    </div>
  );
}
