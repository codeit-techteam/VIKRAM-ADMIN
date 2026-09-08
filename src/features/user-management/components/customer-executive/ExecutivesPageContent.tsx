"use client";

import {
  Download,
  Headphones,
  MapPin,
  Package,
  Plus,
  UserCheck,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { UserManagementTabs } from "@/features/user-management/components/UserManagementTabs";
import { ExecutiveFiltersBar } from "@/features/user-management/components/customer-executive/ExecutiveFiltersBar";
import { ExecutiveTable } from "@/features/user-management/components/customer-executive/ExecutiveTable";
import { AssignHubDialog } from "@/features/user-management/components/AssignHubDialog";
import { Button } from "@/components/ui/button";
import {
  EMPTY_EXECUTIVE_FILTERS,
  EXECUTIVE_PAGE_SIZE,
  type CustomerExecutiveRecord,
  type ExecutiveDashboardStats,
  type ExecutiveFilters,
} from "@/features/user-management/types/support-executive.types";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/services/api";
import {
  assignAdminUserHub,
  exportAdminUsers,
  fetchAdminUserStats,
  fetchCustomerExecutives,
  type AdminUserListItem,
} from "@/services/admin-users";
import { fetchAdminCustomerFilterOptions } from "@/services/customers";
import { downloadCsvFile } from "@/utils/download-csv";
import { notify } from "@/utils/notify";

type ExecutiveStatKey = "total" | "available" | "ordersToday" | "callsAssisted";

function mapAdminUserToExecutive(user: AdminUserListItem): CustomerExecutiveRecord {
  const isActive = user.isActive || user.status === "ACTIVE";
  return {
    id: user.id,
    employeeId: user.id.slice(0, 8).toUpperCase(),
    name: user.fullName || user.email,
    phone: user.phone ?? "Not available",
    email: user.email,
    hubId: user.assignedHubId ?? "",
    hub: user.assignedHubName ?? "Not assigned",
    region: user.assignedHubState ?? "Not assigned",
    assignedCustomers: user.assignedCustomers ?? 0,
    todayOrders: user.todayOrders ?? 0,
    totalOrders: user.totalOrders ?? 0,
    todayCalls: user.todayCalls ?? 0,
    status: isActive ? "AVAILABLE" : "OFFLINE",
    joiningDate: user.createdAt,
  };
}

function getActiveStatKey(filters: ExecutiveFilters): ExecutiveStatKey | null {
  if (filters.activity === "orders-today" && filters.status === "all") {
    return "ordersToday";
  }

  if (filters.activity === "calls-assisted" && filters.status === "all") {
    return "callsAssisted";
  }

  if (filters.status === "AVAILABLE" && filters.activity === "all") {
    return "available";
  }

  if (filters.status === "all" && filters.activity === "all") {
    return "total";
  }

  return null;
}

function buildStatCardFilters(statId: ExecutiveStatKey): ExecutiveFilters {
  if (statId === "available") {
    return {
      ...EMPTY_EXECUTIVE_FILTERS,
      status: "AVAILABLE",
    };
  }

  if (statId === "ordersToday") {
    return {
      ...EMPTY_EXECUTIVE_FILTERS,
      activity: "orders-today",
    };
  }

  if (statId === "callsAssisted") {
    return {
      ...EMPTY_EXECUTIVE_FILTERS,
      activity: "calls-assisted",
    };
  }

  return { ...EMPTY_EXECUTIVE_FILTERS };
}

export function ExecutivesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [executives, setExecutives] = useState<CustomerExecutiveRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<ExecutiveDashboardStats>({
    totalExecutives: 0,
    availableToday: 0,
    ordersCreatedToday: 0,
    customerCallsAssisted: 0,
    joinedThisMonth: 0,
  });
  const [draftFilters, setDraftFilters] = useState<ExecutiveFilters>(
    EMPTY_EXECUTIVE_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<ExecutiveFilters>(
    EMPTY_EXECUTIVE_FILTERS,
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const [assignTarget, setAssignTarget] =
    useState<CustomerExecutiveRecord | null>(null);
  const [assignMode, setAssignMode] = useState<"warehouse" | "region" | null>(
    null,
  );
  const [hubOptions, setHubOptions] = useState<
    Array<{ value: string; label: string; state?: string; hubType?: string | null }>
  >([]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      const filters: ExecutiveFilters = {
        ...EMPTY_EXECUTIVE_FILTERS,
        status: statusParam.toUpperCase(),
      };
      setDraftFilters(filters);
      setAppliedFilters(filters);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      try {
        const statusFilter =
          appliedFilters.status === "AVAILABLE"
            ? "ACTIVE"
            : appliedFilters.status === "OFFLINE"
              ? "INACTIVE"
              : undefined;

        const [list, statsResponse, options] = await Promise.all([
          fetchCustomerExecutives({
            search: appliedFilters.search.trim() || undefined,
            status: statusFilter,
            hubId:
              appliedFilters.hubId !== "all" ? appliedFilters.hubId : undefined,
            region:
              appliedFilters.region !== "all"
                ? appliedFilters.region
                : undefined,
            page: currentPage,
            limit: EXECUTIVE_PAGE_SIZE,
          }),
          fetchAdminUserStats("CUSTOMER_EXECUTIVE"),
          fetchAdminCustomerFilterOptions(),
        ]);

        if (ignore) return;

        const mapped = list.data.map(mapAdminUserToExecutive);
        setExecutives(mapped);
        setTotal(list.meta.total);
        setTotalPages(list.meta.totalPages);
        setStats(statsResponse);
        setHubOptions(options.hubs);
      } catch (error) {
        if (ignore) return;
        notify.error("Failed to load executives", getApiErrorMessage(error));
        setExecutives([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [currentPage, appliedFilters, refreshToken]);

  const filterOptions = useMemo(() => {
    const regions = [
      ...new Map(
        hubOptions
          .filter((hub) => hub.state)
          .map((hub) => [hub.state, { value: hub.state ?? "", label: hub.state ?? "" }]),
      ).values(),
    ];
    return {
      regions,
      hubs: hubOptions.map((hub) => ({ value: hub.value, label: hub.label })),
    };
  }, [hubOptions]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(EMPTY_EXECUTIVE_FILTERS);
    setAppliedFilters(EMPTY_EXECUTIVE_FILTERS);
    setCurrentPage(1);
  }, []);

  const activeStatKey = getActiveStatKey(appliedFilters);

  const handleStatCardClick = useCallback(
    (statId: ExecutiveStatKey) => {
      const nextFilters =
        activeStatKey === statId && statId !== "total"
          ? EMPTY_EXECUTIVE_FILTERS
          : buildStatCardFilters(statId);

      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setCurrentPage(1);
    },
    [activeStatKey],
  );

  const handleExport = async () => {
    try {
      const blob = await exportAdminUsers({
        role: "CUSTOMER_EXECUTIVE",
        search: appliedFilters.search.trim() || undefined,
        hubId: appliedFilters.hubId !== "all" ? appliedFilters.hubId : undefined,
        region:
          appliedFilters.region !== "all" ? appliedFilters.region : undefined,
        status:
          appliedFilters.status === "AVAILABLE"
            ? "ACTIVE"
            : appliedFilters.status === "OFFLINE"
              ? "INACTIVE"
              : undefined,
      });
      downloadCsvFile(
        `customer-executives-${new Date().toISOString().slice(0, 10)}.csv`,
        blob,
      );
      notify.success("Export downloaded", "Executive list exported as CSV.");
    } catch (error) {
      notify.error("Export failed", getApiErrorMessage(error));
    }
  };

  const handleAssignHub = async (hubId: string) => {
    if (!assignTarget) return;
    try {
      await assignAdminUserHub(assignTarget.id, hubId);
      notify.success(
        assignMode === "region" ? "Region assigned" : "Warehouse assigned",
        `${assignTarget.name} is now scoped to the selected hub.`,
      );
      setAssignTarget(null);
      setAssignMode(null);
      setRefreshToken((token) => token + 1);
    } catch (error) {
      notify.error("Assignment failed", getApiErrorMessage(error));
    }
  };

  const statusOptions = [
    { value: "AVAILABLE", label: "Available" },
    { value: "OFFLINE", label: "Offline" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "User Management", href: ROUTES.USER_MANAGEMENT },
          { label: "Customer Executives" },
        ]}
      />

      <PageHeader
        title="Customer Executive Management"
        subtitle="Manage customer support executives, customer assignments and assisted order operations."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (executives.length === 0) {
                  notify.info(
                    "No executives yet",
                    "Create an executive before assigning a warehouse.",
                  );
                  return;
                }
                setAssignMode("warehouse");
                setAssignTarget(executives[0] ?? null);
              }}
            >
              <Warehouse className="size-4" />
              Assign Warehouse
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (executives.length === 0) {
                  notify.info(
                    "No executives yet",
                    "Create an executive before assigning a region.",
                  );
                  return;
                }
                setAssignMode("region");
                setAssignTarget(executives[0] ?? null);
              }}
            >
              <MapPin className="size-4" />
              Assign Region
            </Button>
            <Button
              type="button"
              className="gap-2"
              render={<Link href={ROUTES.CUSTOMER_EXECUTIVE_ADD} />}
            >
              <Plus className="size-4" />
              New Executive
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleExport}
              aria-label="Export executives"
            >
              <Download className="size-4" />
            </Button>
          </div>
        }
      />

      <UserManagementTabs activeTab="customer-executives" />

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
              label="Total Executives"
              value={stats.totalExecutives}
              subtext={`+${stats.joinedThisMonth} joined this month`}
              icon={Users}
              iconContainerClassName="bg-amber-50"
              iconClassName="text-amber-700"
              isActive={activeStatKey === "total"}
              onClick={() => handleStatCardClick("total")}
            />
            <StatCard
              label="Available Today"
              value={stats.availableToday}
              subtext="Active and ready"
              icon={UserCheck}
              iconContainerClassName="bg-emerald-50"
              iconClassName="text-emerald-600"
              isActive={activeStatKey === "available"}
              onClick={() => handleStatCardClick("available")}
            />
            <StatCard
              label="Orders Created Today"
              value={stats.ordersCreatedToday}
              subtext="From CE workbench"
              icon={Package}
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-600"
              isActive={activeStatKey === "ordersToday"}
              onClick={() => handleStatCardClick("ordersToday")}
            />
            <StatCard
              label="Customer Calls Assisted"
              value={stats.customerCallsAssisted}
              subtext="Tracked when CE call logging is enabled"
              icon={Headphones}
              iconContainerClassName="bg-violet-50"
              iconClassName="text-violet-600"
              isActive={activeStatKey === "callsAssisted"}
              onClick={() => handleStatCardClick("callsAssisted")}
            />
          </>
        )}
      </div>

      <ExecutiveFiltersBar
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        regionOptions={filterOptions.regions}
        hubOptions={filterOptions.hubs}
        statusOptions={statusOptions}
      />

      <ExecutiveTable
        executives={executives}
        isLoading={isLoading}
        onEdit={(executive) =>
          router.push(
            `${ROUTES.USER_MANAGEMENT_CUSTOMER_EXECUTIVES}/${executive.id}`,
          )
        }
        onAssignCustomers={(executive) =>
          router.push(
            `${ROUTES.USER_MANAGEMENT_CUSTOMERS}?executive=${executive.id}`,
          )
        }
        onAssignHub={(executive) => {
          setAssignMode("warehouse");
          setAssignTarget(executive);
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        pageSize={EXECUTIVE_PAGE_SIZE}
        onPageChange={setCurrentPage}
        itemLabel="executives"
      />

      <AssignHubDialog
        open={Boolean(assignTarget && assignMode)}
        onOpenChange={(open) => {
          if (!open) {
            setAssignTarget(null);
            setAssignMode(null);
          }
        }}
        hubOptions={(() => {
          const warehouseHubs = hubOptions.filter((hub) =>
            String(hub.hubType ?? "")
              .toUpperCase()
              .includes("WAREHOUSE"),
          );
          const source =
            assignMode === "warehouse" && warehouseHubs.length > 0
              ? warehouseHubs
              : hubOptions;
          return source.map((hub) => ({
            value: hub.value,
            label: hub.state ? `${hub.label} · ${hub.state}` : hub.label,
          }));
        })()}
        selectedCount={1}
        onConfirm={handleAssignHub}
      />
    </div>
  );
}
