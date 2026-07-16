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
  type CustomerEditPayload,
  type CustomerFilters,
  type CustomerListItem,
} from "@/features/user-management/types/customer.types";
import { getFilterOptions } from "@/mock/customer-service";
import { useCustomerStore } from "@/store/customer-store";
import { notify } from "@/utils/notify";

type CustomerStatKey = "total" | "active" | "pending" | "blocked" | "newToday";

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

export function CustomersPageContent() {
  const searchParams = useSearchParams();
  const queryCustomers = useCustomerStore((state) => state.queryCustomers);
  const customers = useCustomerStore((state) => state.customers);
  const orders = useCustomerStore((state) => state.orders);
  const supportExecutiveAssignmentHistory = useCustomerStore(
    (state) => state.supportExecutiveAssignmentHistory,
  );
  const getCustomer = useCustomerStore((state) => state.getCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const blockCustomer = useCustomerStore((state) => state.blockCustomer);
  const updateCustomerStatus = useCustomerStore(
    (state) => state.updateCustomerStatus,
  );
  const assignHubToCustomers = useCustomerStore(
    (state) => state.assignHubToCustomers,
  );
  const exportSelectedCustomers = useCustomerStore(
    (state) => state.exportSelectedCustomers,
  );

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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

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

  const queryResult = useMemo(
    () =>
      queryCustomers({
        page: currentPage,
        limit: CUSTOMER_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [
      queryCustomers,
      currentPage,
      appliedFilters,
      customers,
      orders,
      supportExecutiveAssignmentHistory,
    ],
  );

  const filterOptions = useMemo(
    () =>
      getFilterOptions(
        queryCustomers({
          page: 1,
          limit: 10_000,
          filters: EMPTY_CUSTOMER_FILTERS,
        }).data,
      ),
    [queryCustomers],
  );

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) =>
        queryResult.data.some((customer) => customer.id === id),
      ),
    );
  }, [queryResult.data]);

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
        setSelectedIds(queryResult.data.map((customer) => customer.id));
      } else {
        setSelectedIds([]);
      }
    },
    [queryResult.data],
  );

  const handleBulkStatus = useCallback(
    (status: "ACTIVE" | "INACTIVE" | "BLOCKED", label: string) => {
      if (selectedIds.length === 0) return;

      updateCustomerStatus(selectedIds, status);
      notify.success(`${label} applied to ${selectedIds.length} customer(s).`);
      setSelectedIds([]);
    },
    [selectedIds, updateCustomerStatus],
  );

  const handleAssignHub = useCallback(
    (hubId: string) => {
      assignHubToCustomers(selectedIds, hubId);
      notify.success(`Hub assigned to ${selectedIds.length} customer(s).`);
      setSelectedIds([]);
    },
    [assignHubToCustomers, selectedIds],
  );

  const handleExport = useCallback(() => {
    const exported = exportSelectedCustomers(selectedIds);
    notify.success(
      `Exported ${exported.length} customer record(s).`,
      "Download will begin when export service is connected.",
    );
  }, [exportSelectedCustomers, selectedIds]);

  const editCustomer = useMemo(
    () => (editCustomerId ? getCustomer(editCustomerId) : null),
    [editCustomerId, getCustomer, customers, orders],
  );

  const handleSaveCustomer = (payload: CustomerEditPayload) => {
    if (!editCustomerId) return;

    updateCustomer(editCustomerId, payload);
    setEditCustomerId(null);
    notify.success("Customer updated", "Profile changes saved successfully.");
  };

  const handleBlockCustomer = () => {
    if (!blockCustomerTarget) return;

    if (blockCustomerTarget.status === "BLOCKED") {
      updateCustomerStatus([blockCustomerTarget.id], "ACTIVE");
      notify.success("Customer unblocked", "Customer can place orders again.");
    } else {
      blockCustomer(blockCustomerTarget.id, "MANUAL");
      notify.success(
        "Customer blocked",
        "Customer cannot place new orders. Existing completed orders remain visible.",
      );
    }

    setBlockCustomerTarget(null);
  };

  const showingFrom =
    queryResult.meta.total === 0
      ? 0
      : (queryResult.meta.page - 1) * queryResult.meta.limit + 1;
  const showingTo = Math.min(
    queryResult.meta.page * queryResult.meta.limit,
    queryResult.meta.total,
  );

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
              value={queryResult.stats.total.toLocaleString("en-IN")}
              icon={Users}
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-600"
              isActive={activeStatKey === "total"}
              onClick={() => handleStatCardClick("total")}
            />
            <StatCard
              label="Active Customers"
              value={queryResult.stats.active.toLocaleString("en-IN")}
              icon={CheckCircle2}
              iconContainerClassName="bg-emerald-50"
              iconClassName="text-emerald-600"
              isActive={activeStatKey === "active"}
              onClick={() => handleStatCardClick("active")}
            />
            <StatCard
              label="Pending Verification"
              value={queryResult.stats.pendingVerification.toLocaleString(
                "en-IN",
              )}
              icon={Clock}
              iconContainerClassName="bg-amber-50"
              iconClassName="text-amber-600"
              isActive={activeStatKey === "pending"}
              onClick={() => handleStatCardClick("pending")}
            />
            <StatCard
              label="Blocked Customers"
              value={queryResult.stats.blocked.toLocaleString("en-IN")}
              icon={Ban}
              iconContainerClassName="bg-red-50"
              iconClassName="text-red-600"
              isActive={activeStatKey === "blocked"}
              onClick={() => handleStatCardClick("blocked")}
            />
            <StatCard
              label="New Customers Today"
              value={queryResult.stats.newToday.toLocaleString("en-IN")}
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
          totalCount={queryResult.meta.total}
          allSelected={
            queryResult.data.length > 0 &&
            queryResult.data.every((customer) =>
              selectedIds.includes(customer.id),
            )
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
          customers={queryResult.data}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isLoading={isLoading}
          onEdit={(customer) => setEditCustomerId(customer.id)}
          onBlock={(customer) => setBlockCustomerTarget(customer)}
          onAssignExecutive={(customer) => setAssignExecutiveCustomer(customer)}
        />

        {!isLoading && queryResult.meta.total > 0 ? (
          <Pagination
            currentPage={queryResult.meta.page}
            totalPages={queryResult.meta.totalPages}
            pageSize={queryResult.meta.limit}
            totalItems={queryResult.meta.total}
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
