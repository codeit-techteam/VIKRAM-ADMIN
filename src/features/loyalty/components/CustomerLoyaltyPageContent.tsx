"use client";

import {
  Eye,
  Gift,
  MoreHorizontal,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { UserManagementTabs } from "@/features/user-management/components/UserManagementTabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { LoyaltyDetailDrawer } from "@/features/loyalty/components/LoyaltyDetailDrawer";
import {
  useLoyaltyCustomers,
  useLoyaltyStats,
} from "@/features/loyalty/hooks/use-loyalty";
import {
  EMPTY_LOYALTY_FILTERS,
  LOYALTY_PAGE_SIZE,
  type LoyaltyFilters,
} from "@/features/loyalty/services/loyalty.service";
import type { CustomerLoyalty } from "@/features/loyalty/types";
import { getApiErrorMessage } from "@/services/api";

export function CustomerLoyaltyPageContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<LoyaltyFilters>(EMPTY_LOYALTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerLoyalty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: LOYALTY_PAGE_SIZE,
      filters,
    }),
    [currentPage, filters],
  );

  const statsQuery = useLoyaltyStats();
  const listQuery = useLoyaltyCustomers(queryParams);

  const isLoading = statsQuery.isLoading || listQuery.isLoading;
  const loadError =
    statsQuery.error || listQuery.error
      ? getApiErrorMessage(statsQuery.error || listQuery.error)
      : null;

  const stats = statsQuery.data ?? null;
  const customers = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;

  const breadcrumbs = useMemo(
    () => getNavBreadcrumbsFromPath("/user-management/customer-loyalty"),
    [],
  );

  const applySearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleRetry = () => {
    void statsQuery.refetch();
    void listQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Loyalty"
        subtitle="Track BajriPro Points (1% cashback) and redemption activity."
        breadcrumbs={breadcrumbs}
      />

      <UserManagementTabs activeTab="customer-loyalty" />

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>Unable to load customer loyalty data.</p>
          <p className="mt-1 text-xs opacity-80">{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Points Issued"
          value={stats?.totalPointsIssued.toLocaleString("en-IN") ?? "—"}
          subtext="Across all customers"
          icon={Star}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
          isLoading={isLoading && !stats}
        />
        <StatCard
          label="Redeemed"
          value={stats?.redeemedPoints.toLocaleString("en-IN") ?? "—"}
          subtext="Points redeemed to date"
          icon={Gift}
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-600"
          isLoading={isLoading && !stats}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingRedemptions ?? 0}
          subtext="Pending redemptions"
          icon={TrendingUp}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          valueVariant="warning"
          isLoading={isLoading && !stats}
        />
        <StatCard
          label="Top Customers"
          value={stats?.topCustomersCount ?? 0}
          subtext="Customers with a points balance"
          icon={Users}
          iconContainerClassName="bg-purple-50"
          iconClassName="text-purple-600"
          isLoading={isLoading && !stats}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by customer, phone, city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              className="pl-9"
            />
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={applySearch}
          >
            Search
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F6F8] hover:bg-[#F5F6F8]">
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Lifetime Earned
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Redeemed
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Available
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748B]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && customers.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      title="No loyalty customers yet."
                      description="Try adjusting your search or filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          {customer.customerName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {customer.customerCity}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {customer.currentPoints.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-[#64748B]">
                      {customer.redeemedPoints.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      {customer.availablePoints.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setDrawerOpen(true);
                            }}
                          >
                            <Eye className="size-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={LOYALTY_PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          itemLabel="members"
        />
      </div>

      <LoyaltyDetailDrawer
        customer={selectedCustomer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
