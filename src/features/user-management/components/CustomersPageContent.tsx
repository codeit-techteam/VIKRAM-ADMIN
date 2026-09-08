"use client";

import {
  Ban,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AssignHubDialog } from "@/features/user-management/components/AssignHubDialog";
import { CustomerBulkActionsBar } from "@/features/user-management/components/CustomerBulkActionsBar";
import { CustomerConfirmationModal } from "@/features/user-management/components/CustomerConfirmationModal";
import { CustomerFiltersBar } from "@/features/user-management/components/CustomerFiltersBar";
import { CustomerTable } from "@/features/user-management/components/CustomerTable";
import { EditCustomerDrawer } from "@/features/user-management/components/EditCustomerDrawer";
import { InviteCustomerDialog } from "@/features/user-management/components/InviteCustomerDialog";
import { AssignExecutiveDrawer } from "@/features/user-management/components/support-executive/AssignExecutiveDrawer";
import { UserManagementTabs } from "@/features/user-management/components/UserManagementTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  CUSTOMER_PAGE_SIZE,
  EMPTY_CUSTOMER_FILTERS,
  type CustomerDetail,
  type CustomerEditPayload,
  type CustomerFilters,
  type CustomerListItem,
  type CustomerStats,
} from "@/features/user-management/types/customer.types";
import {
  mapAdminCustomerToListItem,
  mapUiStatusToApiStatus,
} from "@/features/user-management/utils/map-admin-customer";
import { getApiErrorMessage } from "@/services/api";
import {
  activateAdminCustomer,
  bulkAssignAdminCustomers,
  bulkUpdateAdminCustomerStatus,
  disableAdminCustomer,
  exportAdminCustomers,
  fetchAdminCustomerFilterOptions,
  fetchAdminCustomerStats,
  fetchAdminCustomers,
  updateAdminCustomer,
} from "@/services/customers";
import { downloadCsvFile } from "@/utils/download-csv";
import { notify } from "@/utils/notify";

type CustomerStatKey = "total" | "active" | "pending" | "blocked" | "newToday";

const DEFAULT_META = {
  total: 0,
  page: 1,
  limit: CUSTOMER_PAGE_SIZE,
  totalPages: 1,
};

const EMPTY_STATS: CustomerStats = {
  total: 0,
  active: 0,
  pendingVerification: 0,
  blocked: 0,
  newToday: 0,
};

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateInputValue(): string {
  return formatDateInputValue(new Date());
}

function isNewTodayFilter(filters: CustomerFilters): boolean {
  const today = getTodayDateInputValue();
  return (
    filters.registrationDateFrom === today &&
    filters.registrationDateTo === today
  );
}

function getActiveStatKey(filters: CustomerFilters): CustomerStatKey | null {
  if (isNewTodayFilter(filters) && filters.status === "all") {
    return "newToday";
  }

  if (filters.status === "ACTIVE") return "active";
  if (filters.status === "PENDING_VERIFICATION") return "pending";
  if (filters.status === "BLOCKED") return "blocked";

  if (
    filters.status === "all" &&
    !filters.registrationDateFrom &&
    !filters.registrationDateTo
  ) {
    return "total";
  }

  return null;
}

function buildStatCardFilters(statId: CustomerStatKey): CustomerFilters {
  if (statId === "newToday") {
    const today = getTodayDateInputValue();
    return {
      ...EMPTY_CUSTOMER_FILTERS,
      registrationDateFrom: today,
      registrationDateTo: today,
    };
  }

  const statusByStat: Record<Exclude<CustomerStatKey, "newToday">, string> = {
    total: "all",
    active: "ACTIVE",
    pending: "PENDING_VERIFICATION",
    blocked: "BLOCKED",
  };

  return {
    ...EMPTY_CUSTOMER_FILTERS,
    status: statusByStat[statId],
  };
}

function toCustomerDetail(item: CustomerListItem): CustomerDetail {
  return {
    ...item,
    orders: [],
    deliveryAddresses: [],
    serviceHub: item.assignedOperations.hubName,
  };
}

export function CustomersPageContent() {
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [stats, setStats] = useState<CustomerStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<CustomerFilters>(
    EMPTY_CUSTOMER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<CustomerFilters>(
    EMPTY_CUSTOMER_FILTERS,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAssignHubOpen, setIsAssignHubOpen] = useState(false);
  const [assignExecutiveCustomer, setAssignExecutiveCustomer] =
    useState<CustomerListItem | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [blockCustomerTarget, setBlockCustomerTarget] =
    useState<CustomerListItem | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    hubs: [] as Array<{ value: string; label: string }>,
    executives: [] as Array<{ value: string; label: string }>,
    states: [] as Array<{ value: string; label: string }>,
    cities: [] as Array<{ value: string; label: string }>,
  });

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  useEffect(() => {
    let ignore = false;
    fetchAdminCustomerFilterOptions()
      .then((options) => {
        if (ignore) return;
        setFilterOptions({
          hubs: options.hubs,
          executives: options.executives,
          states: options.states,
          cities: [],
        });
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions({
            hubs: [],
            executives: [],
            states: [],
            cities: [],
          });
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setAppliedFilters((current) => {
        if (current.search === draftFilters.search) return current;
        setCurrentPage(1);
        return { ...current, search: draftFilters.search };
      });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [draftFilters.search]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const kycParam = searchParams.get("kyc");
    const executiveParam = searchParams.get("executive");

    if (statusParam || kycParam || executiveParam) {
      const filters: CustomerFilters = {
        ...EMPTY_CUSTOMER_FILTERS,
        ...(statusParam ? { status: statusParam.toUpperCase() } : {}),
        ...(executiveParam ? { assignedExecutive: executiveParam } : {}),
      };
      if (kycParam) {
        filters.search = `kyc:${kycParam.toUpperCase()}`;
      }
      setDraftFilters(filters);
      setAppliedFilters(filters);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const search = appliedFilters.search.trim();
        const [response, nextStats] = await Promise.all([
          fetchAdminCustomers({
            search: search && !search.startsWith("kyc:") ? search : undefined,
            status: mapUiStatusToApiStatus(appliedFilters.status),
            customerType:
              appliedFilters.customerType !== "all"
                ? appliedFilters.customerType
                : undefined,
            hubId:
              appliedFilters.assignedHub !== "all"
                ? appliedFilters.assignedHub
                : undefined,
            executiveId:
              appliedFilters.assignedExecutive !== "all"
                ? appliedFilters.assignedExecutive
                : undefined,
            state:
              appliedFilters.state !== "all" ? appliedFilters.state : undefined,
            city: appliedFilters.city.trim() || undefined,
            createdFrom: appliedFilters.registrationDateFrom || undefined,
            createdTo: appliedFilters.registrationDateTo || undefined,
            page: currentPage,
            limit: CUSTOMER_PAGE_SIZE,
          }),
          fetchAdminCustomerStats(),
        ]);

        if (ignore) return;

        setCustomers(response.data.map(mapAdminCustomerToListItem));
        setMeta(response.meta);
        setStats(nextStats);
      } catch (error) {
        if (ignore) return;
        const message = getApiErrorMessage(error);
        setLoadError(message);
        notify.error("Failed to load customers", message);
        setCustomers([]);
        setMeta(DEFAULT_META);
        setStats(EMPTY_STATS);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [currentPage, appliedFilters, refreshToken]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => customers.some((customer) => customer.id === id)),
    );
  }, [customers]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(EMPTY_CUSTOMER_FILTERS);
    setAppliedFilters(EMPTY_CUSTOMER_FILTERS);
    setCurrentPage(1);
  }, []);

  const activeStatKey = getActiveStatKey(appliedFilters);

  const handleStatCardClick = useCallback(
    (statId: CustomerStatKey) => {
      const nextFilters =
        activeStatKey === statId && statId !== "total"
          ? EMPTY_CUSTOMER_FILTERS
          : buildStatCardFilters(statId);

      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setCurrentPage(1);
    },
    [activeStatKey],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(customers.map((customer) => customer.id));
      } else {
        setSelectedIds([]);
      }
    },
    [customers],
  );

  const handleBulkStatus = useCallback(
    async (status: "ACTIVE" | "INACTIVE" | "BLOCKED", label: string) => {
      if (selectedIds.length === 0) return;

      try {
        const apiStatus =
          status === "BLOCKED"
            ? "SUSPENDED"
            : status === "INACTIVE"
              ? "INACTIVE"
              : "ACTIVE";
        await bulkUpdateAdminCustomerStatus({
          ids: selectedIds,
          status: apiStatus,
        });
        notify.success(
          `${label} applied to ${selectedIds.length} customer(s).`,
        );
        setSelectedIds([]);
        refresh();
      } catch (error) {
        notify.error(
          `Failed to apply ${label.toLowerCase()}`,
          getApiErrorMessage(error),
        );
      }
    },
    [selectedIds, refresh],
  );

  const handleAssignHub = useCallback(
    async (hubId: string) => {
      if (selectedIds.length === 0) return;
      try {
        await bulkAssignAdminCustomers({
          ids: selectedIds,
          hubId,
          reason: "Bulk hub assignment from User Management",
        });
        notify.success(
          `Hub assigned to ${selectedIds.length} customer(s).`,
        );
        setSelectedIds([]);
        setIsAssignHubOpen(false);
        refresh();
      } catch (error) {
        notify.error("Failed to assign hub", getApiErrorMessage(error));
      }
    },
    [selectedIds, refresh],
  );

  const buildExportParams = useCallback(
    (ids?: string[]) => ({
      search: appliedFilters.search.trim() || undefined,
      status: mapUiStatusToApiStatus(appliedFilters.status),
      customerType:
        appliedFilters.customerType !== "all"
          ? appliedFilters.customerType
          : undefined,
      hubId:
        appliedFilters.assignedHub !== "all"
          ? appliedFilters.assignedHub
          : undefined,
      executiveId:
        appliedFilters.assignedExecutive !== "all"
          ? appliedFilters.assignedExecutive
          : undefined,
      state: appliedFilters.state !== "all" ? appliedFilters.state : undefined,
      city: appliedFilters.city.trim() || undefined,
      createdFrom: appliedFilters.registrationDateFrom || undefined,
      createdTo: appliedFilters.registrationDateTo || undefined,
      ids: ids?.length ? ids.join(",") : undefined,
    }),
    [appliedFilters],
  );

  const handleExport = useCallback(async () => {
    try {
      const blob = await exportAdminCustomers(
        buildExportParams(selectedIds.length > 0 ? selectedIds : undefined),
      );
      downloadCsvFile(
        `customers-${new Date().toISOString().slice(0, 10)}.csv`,
        blob,
      );
      notify.success(
        selectedIds.length > 0
          ? `Exported ${selectedIds.length} selected customer(s).`
          : "Customer export downloaded.",
      );
    } catch (error) {
      notify.error("Export failed", getApiErrorMessage(error));
    }
  }, [buildExportParams, selectedIds]);

  const editCustomer = useMemo(() => {
    if (!editCustomerId) return null;
    const found = customers.find((customer) => customer.id === editCustomerId);
    return found ? toCustomerDetail(found) : null;
  }, [editCustomerId, customers]);

  const handleSaveCustomer = async (payload: CustomerEditPayload) => {
    if (!editCustomerId) return;

    try {
      await updateAdminCustomer(editCustomerId, {
        fullName: payload.name,
        email: payload.email || undefined,
        companyName: payload.address.primaryAddress || undefined,
        businessType: payload.customerType,
        status:
          mapUiStatusToApiStatus(payload.status) === "PENDING_VERIFICATION"
            ? "ACTIVE"
            : (mapUiStatusToApiStatus(payload.status) ?? "ACTIVE"),
      });
      notify.success("Customer updated", "Profile changes saved successfully.");
      setEditCustomerId(null);
      refresh();
    } catch (error) {
      notify.error("Failed to update customer", getApiErrorMessage(error));
    }
  };

  const handleBlockCustomer = async () => {
    if (!blockCustomerTarget) return;

    try {
      if (blockCustomerTarget.status === "BLOCKED") {
        await activateAdminCustomer(blockCustomerTarget.id);
        notify.success(
          "Customer unblocked",
          "Customer can place orders again.",
        );
      } else {
        await disableAdminCustomer(blockCustomerTarget.id);
        notify.success(
          "Customer blocked",
          "Customer cannot place new orders. Existing completed orders remain visible.",
        );
      }
      refresh();
    } catch (error) {
      notify.error(
        "Failed to update customer status",
        getApiErrorMessage(error),
      );
    } finally {
      setBlockCustomerTarget(null);
    }
  };

  const showingFrom = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const showingTo = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management Dashboard"
        subtitle="Comprehensive oversight of all platform stakeholders and permissions."
        breadcrumbs={getNavBreadcrumbsFromPath("/user-management/customers")}
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              className="h-10 gap-2 px-4"
              onClick={handleExport}
            >
              <Download className="size-4" />
              Export Data
            </Button>
            <Button
              size="lg"
              className="h-10 gap-2 px-4"
              onClick={() => setIsInviteOpen(true)}
            >
              <Plus className="size-4" />
              Invite New User
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Total Customers"
              value={stats.total.toLocaleString("en-IN")}
              icon={Users}
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-600"
              isActive={activeStatKey === "total"}
              onClick={() => handleStatCardClick("total")}
            />
            <StatCard
              label="Active Customers"
              value={stats.active.toLocaleString("en-IN")}
              icon={CheckCircle2}
              iconContainerClassName="bg-emerald-50"
              iconClassName="text-emerald-600"
              isActive={activeStatKey === "active"}
              onClick={() => handleStatCardClick("active")}
            />
            <StatCard
              label="Pending Verification"
              value={stats.pendingVerification.toLocaleString("en-IN")}
              icon={Clock}
              iconContainerClassName="bg-amber-50"
              iconClassName="text-amber-600"
              isActive={activeStatKey === "pending"}
              onClick={() => handleStatCardClick("pending")}
            />
            <StatCard
              label="Blocked Customers"
              value={stats.blocked.toLocaleString("en-IN")}
              icon={Ban}
              iconContainerClassName="bg-red-50"
              iconClassName="text-red-600"
              isActive={activeStatKey === "blocked"}
              onClick={() => handleStatCardClick("blocked")}
            />
            <StatCard
              label="New Customers Today"
              value={stats.newToday.toLocaleString("en-IN")}
              icon={UserPlus}
              iconContainerClassName="bg-orange-50"
              iconClassName="text-primary"
              isActive={activeStatKey === "newToday"}
              onClick={() => handleStatCardClick("newToday")}
            />
          </>
        )}
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>Unable to load customers from the server.</p>
          <p className="mt-1 text-xs opacity-80">{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={refresh}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <UserManagementTabs activeTab="customers" className="mb-6" />

        <CustomerFiltersBar
          draftFilters={draftFilters}
          onDraftChange={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          hubOptions={filterOptions.hubs}
          executiveOptions={filterOptions.executives}
          stateOptions={filterOptions.states}
          className="mb-6"
        />

        <CustomerBulkActionsBar
          selectedCount={selectedIds.length}
          totalCount={meta.total}
          allSelected={
            customers.length > 0 &&
            customers.every((customer) => selectedIds.includes(customer.id))
          }
          onSelectAll={handleSelectAll}
          onActivate={() => handleBulkStatus("ACTIVE", "Activation")}
          onDeactivate={() => handleBulkStatus("INACTIVE", "Deactivation")}
          onBlock={() => handleBulkStatus("BLOCKED", "Block")}
          onAssignHub={() => setIsAssignHubOpen(true)}
          onExport={handleExport}
          showingFrom={showingFrom}
          showingTo={showingTo}
        />

        <CustomerTable
          customers={customers}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isLoading={isLoading}
          onEdit={(customer) => setEditCustomerId(customer.id)}
          onBlock={(customer) => setBlockCustomerTarget(customer)}
          onAssignExecutive={(customer) => setAssignExecutiveCustomer(customer)}
        />

        {!isLoading && meta.total > 0 ? (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            pageSize={meta.limit}
            totalItems={meta.total}
            onPageChange={setCurrentPage}
            itemLabel="customers"
            className="px-0"
          />
        ) : null}
      </div>

      <AssignHubDialog
        open={isAssignHubOpen}
        onOpenChange={setIsAssignHubOpen}
        hubOptions={filterOptions.hubs}
        selectedCount={selectedIds.length}
        onConfirm={handleAssignHub}
      />

      <InviteCustomerDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        hubOptions={filterOptions.hubs}
        executiveOptions={filterOptions.executives}
        onInvited={refresh}
      />

      <AssignExecutiveDrawer
        open={Boolean(assignExecutiveCustomer)}
        onOpenChange={(open) => {
          if (!open) setAssignExecutiveCustomer(null);
        }}
        customer={assignExecutiveCustomer}
        onAssigned={() => {
          setAssignExecutiveCustomer(null);
          refresh();
        }}
      />

      <EditCustomerDrawer
        open={Boolean(editCustomerId)}
        onOpenChange={(open) => {
          if (!open) setEditCustomerId(null);
        }}
        customer={editCustomer}
        onSave={handleSaveCustomer}
      />

      <CustomerConfirmationModal
        open={Boolean(blockCustomerTarget)}
        onOpenChange={(open) => {
          if (!open) setBlockCustomerTarget(null);
        }}
        title={
          blockCustomerTarget?.status === "BLOCKED"
            ? "Unblock Customer?"
            : "Block Customer?"
        }
        description={
          blockCustomerTarget?.status === "BLOCKED"
            ? "This customer will be able to place new orders again."
            : "Blocked customers cannot place new orders. Existing completed orders remain visible."
        }
        confirmLabel={
          blockCustomerTarget?.status === "BLOCKED"
            ? "Unblock Customer"
            : "Block Customer"
        }
        confirmVariant={
          blockCustomerTarget?.status === "BLOCKED" ? "default" : "destructive"
        }
        onConfirm={handleBlockCustomer}
      />
    </div>
  );
}
