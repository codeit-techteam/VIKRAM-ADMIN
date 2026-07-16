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
import { useSearchParams } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { UserManagementTabs } from "@/features/user-management/components/UserManagementTabs";
import { ExecutiveFiltersBar } from "@/features/user-management/components/customer-executive/ExecutiveFiltersBar";
import { ExecutiveTable } from "@/features/user-management/components/customer-executive/ExecutiveTable";
import { Button } from "@/components/ui/button";
import {
  EMPTY_EXECUTIVE_FILTERS,
  EXECUTIVE_PAGE_SIZE,
  type CustomerExecutiveRecord,
  type ExecutiveFilters,
} from "@/features/user-management/types/support-executive.types";
import { getExecutiveFilterOptions } from "@/mock/customer-executive-service";
import { ROUTES } from "@/constants/routes";
import { useCustomerStore } from "@/store/customer-store";
import { notify } from "@/utils/notify";

type ExecutiveStatKey = "total" | "available" | "ordersToday" | "callsAssisted";

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
  const queryExecutives = useCustomerStore((state) => state.queryExecutives);
  const customers = useCustomerStore((state) => state.customers);
  const orders = useCustomerStore((state) => state.orders);
  const supportExecutiveAssignmentHistory = useCustomerStore(
    (state) => state.supportExecutiveAssignmentHistory,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<ExecutiveFilters>(
    EMPTY_EXECUTIVE_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<ExecutiveFilters>(
    EMPTY_EXECUTIVE_FILTERS,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      const filters: ExecutiveFilters = {
        ...EMPTY_EXECUTIVE_FILTERS,
        status: statusParam.toLowerCase(),
      };
      setDraftFilters(filters);
      setAppliedFilters(filters);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const queryResult = useMemo(
    () =>
      queryExecutives({
        page: currentPage,
        limit: EXECUTIVE_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [
      queryExecutives,
      currentPage,
      appliedFilters,
      customers,
      orders,
      supportExecutiveAssignmentHistory,
    ],
  );

  const filterOptions = useMemo(() => getExecutiveFilterOptions(), []);

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

  const handleExecutiveAction = (
    action: string,
    executive: CustomerExecutiveRecord,
  ) => {
    notify.success(
      action,
      `${action} for ${executive.name} — mock action completed.`,
    );
  };

  const handleExport = () => {
    notify.success("Export started", "Executive list exported as CSV.");
  };

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
              onClick={() =>
                notify.success(
                  "Assign Warehouse",
                  "Warehouse assignment flow opened.",
                )
              }
            >
              <Warehouse className="size-4" />
              Assign Warehouse
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                notify.success(
                  "Assign Region",
                  "Region assignment flow opened.",
                )
              }
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
              value={queryResult.stats.totalExecutives}
              subtext={`+${queryResult.stats.joinedThisMonth} joined this month`}
              icon={Users}
              iconContainerClassName="bg-amber-50"
              iconClassName="text-amber-700"
              isActive={activeStatKey === "total"}
              onClick={() => handleStatCardClick("total")}
            />
            <StatCard
              label="Available Today"
              value={queryResult.stats.availableToday}
              subtext="Active and ready"
              icon={UserCheck}
              iconContainerClassName="bg-blue-50"
              iconClassName="text-blue-600"
              isActive={activeStatKey === "available"}
              onClick={() => handleStatCardClick("available")}
            />
            <StatCard
              label="Orders Created Today"
              value={queryResult.stats.ordersCreatedToday}
              subtext={`Average ${queryResult.stats.totalExecutives > 0 ? (queryResult.stats.ordersCreatedToday / queryResult.stats.totalExecutives).toFixed(1) : "0"} per exec`}
              icon={Package}
              iconContainerClassName="bg-purple-50"
              iconClassName="text-purple-600"
              isActive={activeStatKey === "ordersToday"}
              onClick={() => handleStatCardClick("ordersToday")}
            />
            <StatCard
              label="Customer Calls Assisted"
              value={queryResult.stats.customerCallsAssisted}
              subtext="96% resolution rate"
              icon={Headphones}
              iconContainerClassName="bg-red-50"
              iconClassName="text-red-600"
              isActive={activeStatKey === "callsAssisted"}
              onClick={() => handleStatCardClick("callsAssisted")}
            />
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <ExecutiveFiltersBar
          filters={draftFilters}
          onChange={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          regionOptions={filterOptions.regions}
          hubOptions={filterOptions.hubs}
          statusOptions={filterOptions.statuses}
        />

        <ExecutiveTable
          executives={queryResult.data}
          isLoading={isLoading}
          onEdit={(executive) =>
            handleExecutiveAction("Edit Executive", executive)
          }
          onAssignCustomers={(executive) =>
            handleExecutiveAction("Assign Customers", executive)
          }
        />

        <Pagination
          currentPage={queryResult.meta.page}
          totalPages={queryResult.meta.totalPages}
          pageSize={queryResult.meta.limit}
          totalItems={queryResult.meta.total}
          onPageChange={setCurrentPage}
          itemLabel="results"
        />
      </div>
    </div>
  );
}
