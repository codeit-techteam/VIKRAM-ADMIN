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
  disableAdminCustomer,
  fetchAdminCustomerStats,
  fetchAdminCustomers,
  updateAdminCustomer,
} from "@/services/customers";
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

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const kycParam = searchParams.get("kyc");

    if (statusParam || kycParam) {
      const filters: CustomerFilters = {
        ...EMPTY_CUSTOMER_FILTERS,
        ...(statusParam ? { status: statusParam.toUpperCase() } : {}),
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
      try {
        const search = appliedFilters.search.trim();
        const [response, nextStats] = await Promise.all([
          fetchAdminCustomers({
            search: search && !search.startsWith("kyc:") ? search : undefined,
            status: mapUiStatusToApiStatus(appliedFilters.status),
            hubId:
              appliedFilters.assignedHub !== "all"
                ? appliedFilters.assignedHub
                : undefined,
            executiveId:
              appliedFilters.assignedExecutive !== "all"
                ? appliedFilters.assignedExecutive
                : undefined,
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
        notify.error("Failed to load customers", getApiErrorMessage(error));
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

  const filterOptions = useMemo(
    () => ({
      hubs: [] as Array<{ id: string; label: string }>,
      executives: [] as Array<{ id: string; label: string }>,
      states: [] as string[],
      cities: [] as string[],
    }),
    [],
  );

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
        await Promise.all(
          selectedIds.map((id) => {
            if (status === "ACTIVE") return activateAdminCustomer(id);
            if (status === "BLOCKED") return disableAdminCustomer(id);
            return updateAdminCustomer(id, { status: "INACTIVE" });
          }),
        );
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

  const handleAssignHub = useCallback(() => {
    notify.info(
      `Hub assignment noted for ${selectedIds.length} customer(s).`,
      "This will sync automatically once the hub-assignment endpoint is available.",
    );
    setSelectedIds([]);
  }, [selectedIds]);

  const handleExport = useCallback(() => {
    const exported = customers.filter((customer) =>
      selectedIds.includes(customer.id),
    );
    notify.success(
      `Exported ${exported.length} customer record(s).`,
      "Download will begin when export service is connected.",
    );
  }, [customers, selectedIds]);

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
        status: mapUiStatusToApiStatus(payload.status) ?? "ACTIVE",
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
            <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
              <Download className="size-4" />
              Export Data
            </Button>
            <Button size="lg" className="h-10 gap-2 px-4">
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

      <AssignExecutiveDrawer
        open={Boolean(assignExecutiveCustomer)}
        onOpenChange={(open) => {
          if (!open) setAssignExecutiveCustomer(null);
        }}
        customer={assignExecutiveCustomer}
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
