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
import { useRouter } from "next/navigation";
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
import { hubManagerService } from "@/services/hubManager.service";
import { getApiErrorMessage } from "@/services/api";
import { ROUTES } from "@/constants/routes";
import { downloadCsvFile } from "@/utils/download-csv";
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
  const router = useRouter();
  const [managers, setManagers] = useState<SubHubManager[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalManagers: 0,
    managersAvailable: 0,
    managersNeedAttention: 0,
    managersOnLeave: 0,
  });
  const [meta, setMeta] = useState({
    page: 1,
    limit: MANAGER_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [hubOptions, setHubOptions] = useState<
    Array<{ value: string; label: string; state?: string }>
  >([]);
  const [refreshToken, setRefreshToken] = useState(0);

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
    let active = true;
    setIsLoading(true);
    const status =
      appliedFilters.status === "ACTIVE"
        ? "ACTIVE"
        : appliedFilters.status === "LEAVE"
          ? "INACTIVE"
          : undefined;

    Promise.all([
      hubManagerService.list({
        page: currentPage,
        limit: MANAGER_PAGE_SIZE,
        search: appliedFilters.search.trim() || undefined,
        hubId:
          appliedFilters.hubId !== "all" ? appliedFilters.hubId : undefined,
        region:
          appliedFilters.region !== "all" ? appliedFilters.region : undefined,
        status,
      }),
      hubManagerService.stats(),
      hubManagerService.listHubs(),
    ])
      .then(([result, nextStats, hubs]) => {
        if (!active) return;
        setManagers(result.data);
        setMeta(result.meta);
        setStats(nextStats);
        setHubOptions(
          hubs.map((hub) => ({
            value: hub.id,
            label: hub.name,
            state: hub.state,
          })),
        );
        setFetchError(null);
      })
      .catch((error) => {
        if (!active) return;
        setFetchError(getApiErrorMessage(error));
        setManagers([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedFilters, currentPage, refreshToken]);

  const cardManagers = useMemo(() => {
    const start = (cardPage - 1) * MANAGER_CARDS_PAGE_SIZE;
    return managers.slice(start, start + MANAGER_CARDS_PAGE_SIZE);
  }, [managers, cardPage]);

  const filterOptions = useMemo(() => {
    const regions = [
      ...new Map(
        hubOptions
          .filter((hub) => hub.state)
          .map((hub) => [
            hub.state,
            { value: hub.state ?? "", label: hub.state ?? "" },
          ]),
      ).values(),
    ];
    return {
      regions,
      hubs: hubOptions,
      statuses: [
        { value: "ACTIVE", label: "Active" },
        { value: "LEAVE", label: "Inactive / Leave" },
      ],
      warehouses: [] as Array<{ value: string; label: string }>,
    };
  }, [hubOptions]);

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

  const handleTransfer = async (
    managerId: string,
    newHubId: string,
    reason: string,
    _effectiveDate: string,
  ) => {
    try {
      const updated = await hubManagerService.transferHub(
        managerId,
        newHubId,
        reason,
      );
      setManagers((current) =>
        current.map((manager) =>
          manager.id === managerId ? updated : manager,
        ),
      );
      setRefreshToken((token) => token + 1);
      notify.success(
        "Manager Transferred",
        "Manager transferred successfully to new hub.",
      );
    } catch (error) {
      notify.error("Transfer failed", getApiErrorMessage(error));
    }
  };

  const handleAssignHub = async (managerId: string, hubId: string) => {
    try {
      const updated = await hubManagerService.transferHub(
        managerId,
        hubId,
        "Hub assignment from managers list",
      );
      setManagers((current) =>
        current.map((manager) =>
          manager.id === managerId ? updated : manager,
        ),
      );
      setRefreshToken((token) => token + 1);
      notify.success(
        "Hub Assigned",
        `${updated.name} assigned to the selected hub.`,
      );
    } catch (error) {
      notify.error("Assignment failed", getApiErrorMessage(error));
    }
  };

  const handleDeactivate = async (manager: SubHubManager) => {
    try {
      const updated = await hubManagerService.deactivate(manager.id);
      setManagers((current) =>
        current.map((item) => (item.id === manager.id ? updated : item)),
      );
      setRefreshToken((token) => token + 1);
      notify.success(
        "Manager Deactivated",
        `${manager.name} has been deactivated.`,
      );
    } catch (error) {
      notify.error("Deactivation failed", getApiErrorMessage(error));
    }
  };

  const handleEdit = (manager: SubHubManager) => {
    router.push(`${ROUTES.SUB_HUB_MANAGERS}/${manager.id}`);
  };

  const handleExport = async () => {
    try {
      const blob = await hubManagerService.exportCsv({
        search: appliedFilters.search.trim() || undefined,
        hubId:
          appliedFilters.hubId !== "all" ? appliedFilters.hubId : undefined,
        region:
          appliedFilters.region !== "all" ? appliedFilters.region : undefined,
        status:
          appliedFilters.status === "ACTIVE"
            ? "ACTIVE"
            : appliedFilters.status === "LEAVE"
              ? "INACTIVE"
              : undefined,
      });
      downloadCsvFile(
        `hub-managers-${new Date().toISOString().slice(0, 10)}.csv`,
        blob,
      );
      notify.success("Export downloaded", "Manager list exported as CSV.");
    } catch (error) {
      notify.error("Export failed", getApiErrorMessage(error));
    }
  };

  const handleRefresh = () => {
    setRefreshToken((token) => token + 1);
  };

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

      {fetchError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>Unable to load hub managers.</p>
          <p className="mt-1 text-xs opacity-80">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </div>
      ) : null}

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
            Showing {cardManagers.length} of {meta.total}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ManagerCardSkeleton key={i} />
              ))
            : cardManagers.map((manager) => (
                <ManagerCard
                  key={manager.id}
                  manager={manager}
                  onTransfer={handleOpenTransfer}
                />
              ))}
        </div>

        {!isLoading && meta.total > MANAGER_CARDS_PAGE_SIZE && (
          <Pagination
            currentPage={cardPage}
            totalPages={Math.max(1, Math.ceil(managers.length / MANAGER_CARDS_PAGE_SIZE))}
            pageSize={MANAGER_CARDS_PAGE_SIZE}
            totalItems={managers.length}
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
          managers={managers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onTransfer={handleOpenTransfer}
          onDeactivate={handleDeactivate}
        />

        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          pageSize={meta.limit}
          totalItems={meta.total}
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
        managers={managers}
        onAssign={handleAssignHub}
      />
    </div>
  );
}
