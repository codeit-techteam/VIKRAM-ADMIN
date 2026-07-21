"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  Crown,
  Download,
  Eye,
  IndianRupee,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MembershipDetailDrawer } from "@/features/membership/components/MembershipDetailDrawer";
import {
  MembershipPaymentBadge,
  MembershipPlanBadge,
  MembershipStatusBadge,
} from "@/features/membership/components/MembershipStatusBadge";
import {
  cancelMembership,
  EMPTY_MEMBERSHIP_FILTERS,
  getMemberships,
  getMembershipStats,
  MEMBERSHIP_PAGE_SIZE,
  renewMembership,
  type MembershipFilters,
} from "@/features/membership/services/membership.service";
import type { CustomerMembership } from "@/mock/mockMemberships";
import type { MembershipDashboardStats } from "@/mock/mockMemberships";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

type StatFilter = "all" | "active" | "expiring" | "revenue";

export function MembershipPlansPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MembershipDashboardStats | null>(null);
  const [memberships, setMemberships] = useState<CustomerMembership[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<MembershipFilters>(
    EMPTY_MEMBERSHIP_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [activeStat, setActiveStat] = useState<StatFilter | null>(null);
  const [selectedMembership, setSelectedMembership] =
    useState<CustomerMembership | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, queryResult] = await Promise.all([
        getMembershipStats(),
        getMemberships({
          page: currentPage,
          limit: MEMBERSHIP_PAGE_SIZE,
          filters,
        }),
      ]);
      setStats(statsData);
      setMemberships(queryResult.data);
      setTotal(queryResult.total);
      setTotalPages(queryResult.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleStatClick = (stat: StatFilter) => {
    if (activeStat === stat) {
      setActiveStat(null);
      setFilters(EMPTY_MEMBERSHIP_FILTERS);
    } else {
      setActiveStat(stat);
      const statusMap: Record<StatFilter, MembershipFilters["status"]> = {
        all: "all",
        active: "ACTIVE",
        expiring: "EXPIRING_SOON",
        revenue: "all",
      };
      setFilters({ ...EMPTY_MEMBERSHIP_FILTERS, status: statusMap[stat] });
    }
    setCurrentPage(1);
  };

  const openDrawer = (membership: CustomerMembership) => {
    setSelectedMembership(membership);
    setDrawerOpen(true);
  };

  const handleRenew = async (id: string) => {
    const updated = await renewMembership(id);
    setSelectedMembership(updated);
    await loadData();
  };

  const handleCancel = async (id: string) => {
    await cancelMembership(id);
    await loadData();
  };

  const handleExport = () => {
    notify.success("Export started", "Membership data exported to CSV.");
  };

  const breadcrumbs = useMemo(
    () => getNavBreadcrumbsFromPath("/user-management/membership-plans"),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Plans"
        subtitle="Manage customer memberships, renewals, and benefits."
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="size-4" />
            Export
          </Button>
        }
      />

      <UserManagementTabs activeTab="membership-plans" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats?.totalMembers ?? 0}
          subtext="All registered memberships"
          icon={Users}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isLoading={isLoading}
          isActive={activeStat === "all"}
          onClick={() => handleStatClick("all")}
        />
        <StatCard
          label="Active Memberships"
          value={stats?.activeMemberships ?? 0}
          subtext="Currently active plans"
          icon={Crown}
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-600"
          isLoading={isLoading}
          isActive={activeStat === "active"}
          onClick={() => handleStatClick("active")}
        />
        <StatCard
          label="Expiring This Month"
          value={stats?.expiringThisMonth ?? 0}
          subtext="Need renewal attention"
          icon={AlertTriangle}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
          valueVariant="warning"
          isLoading={isLoading}
          isActive={activeStat === "expiring"}
          onClick={() => handleStatClick("expiring")}
        />
        <StatCard
          label="Membership Revenue"
          value={stats ? formatCurrency(stats.membershipRevenue) : "—"}
          subtext="Total paid memberships"
          icon={IndianRupee}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isLoading={isLoading}
          isActive={activeStat === "revenue"}
          onClick={() => handleStatClick("revenue")}
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(v) => {
              setFilters((prev) => ({
                ...prev,
                status: v as MembershipFilters["status"],
              }));
              setCurrentPage(1);
              setActiveStat(null);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="EXPIRING_SOON">Expiring Soon</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSearch}
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
                  Membership
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Purchase Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Expiry Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Payment
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748B]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : memberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      title="No memberships found"
                      description="Try adjusting your search or filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                memberships.map((membership) => (
                  <TableRow
                    key={membership.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openDrawer(membership)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          {membership.customerName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {membership.customerCity}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MembershipPlanBadge plan={membership.membership} />
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {format(new Date(membership.purchaseDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {format(new Date(membership.expiryDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <MembershipStatusBadge status={membership.status} />
                    </TableCell>
                    <TableCell>
                      <MembershipPaymentBadge
                        status={membership.paymentStatus}
                      />
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
                            onClick={() => openDrawer(membership)}
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
          pageSize={MEMBERSHIP_PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          itemLabel="memberships"
        />
      </div>

      <MembershipDetailDrawer
        membership={selectedMembership}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRenew={handleRenew}
        onCancel={handleCancel}
      />
    </div>
  );
}
