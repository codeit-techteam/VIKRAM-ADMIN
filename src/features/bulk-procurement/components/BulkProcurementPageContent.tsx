"use client";

import { format } from "date-fns";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Eye,
  IndianRupee,
  MoreHorizontal,
  Search,
  UserCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
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
import { BulkProcurementDetailDrawer } from "@/features/bulk-procurement/components/BulkProcurementDetailDrawer";
import { BulkProcurementStatusBadge } from "@/features/bulk-procurement/components/BulkProcurementStatusBadge";
import {
  BULK_PROCUREMENT_PAGE_SIZE,
  EMPTY_BULK_PROCUREMENT_FILTERS,
  getBulkProcurementRequests,
  getBulkProcurementStats,
  type BulkProcurementFilters,
} from "@/features/bulk-procurement/services/bulk-procurement.service";
import type {
  BulkProcurementDashboardStats,
  BulkProcurementRequest,
} from "@/mock/mockBulkProcurement";
import { formatCurrency } from "@/utils/format-currency";

type BulkStatFilter = "open" | "assigned" | "completed" | "pipeline";

export function BulkProcurementPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<BulkProcurementDashboardStats | null>(
    null,
  );
  const [requests, setRequests] = useState<BulkProcurementRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BulkProcurementFilters>(
    EMPTY_BULK_PROCUREMENT_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<BulkProcurementRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStat, setActiveStat] = useState<BulkStatFilter | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, queryResult] = await Promise.all([
        getBulkProcurementStats(),
        getBulkProcurementRequests({
          page: currentPage,
          limit: BULK_PROCUREMENT_PAGE_SIZE,
          filters,
        }),
      ]);
      setStats(statsData);
      setRequests(queryResult.data);
      setTotal(queryResult.total);
      setTotalPages(queryResult.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const breadcrumbs = useMemo(
    () => getNavBreadcrumbsFromPath("/customer-executive/bulk-procurement"),
    [],
  );

  const handleStatClick = (stat: BulkStatFilter) => {
    if (activeStat === stat) {
      setActiveStat(null);
      setFilters(EMPTY_BULK_PROCUREMENT_FILTERS);
      setSearchInput("");
      setCurrentPage(1);
      return;
    }

    setActiveStat(stat);
    setCurrentPage(1);
    setSearchInput("");

    setFilters({
      ...EMPTY_BULK_PROCUREMENT_FILTERS,
      quickFilter: stat,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Procurement"
        subtitle="Manage bulk material requests and executive assignments."
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Requests"
          value={stats?.openRequests ?? 0}
          subtext="Awaiting assignment"
          icon={ClipboardList}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isLoading={isLoading}
          isActive={activeStat === "open"}
          onClick={() => handleStatClick("open")}
        />
        <StatCard
          label="Assigned"
          value={stats?.assigned ?? 0}
          subtext="In progress requests"
          icon={UserCheck}
          iconContainerClassName="bg-purple-50"
          iconClassName="text-purple-600"
          isLoading={isLoading}
          isActive={activeStat === "assigned"}
          onClick={() => handleStatClick("assigned")}
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          subtext="Successfully converted"
          icon={CheckCircle2}
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-600"
          isLoading={isLoading}
          isActive={activeStat === "completed"}
          onClick={() => handleStatClick("completed")}
        />
        <StatCard
          label="Revenue Potential"
          value={stats ? formatCurrency(stats.revenuePotential) : "—"}
          subtext="Open & assigned pipeline"
          icon={IndianRupee}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isLoading={isLoading}
          isActive={activeStat === "pipeline"}
          onClick={() => handleStatClick("pipeline")}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search company, project, executive..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFilters((prev) => ({ ...prev, search: searchInput }));
                  setCurrentPage(1);
                }
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(v) => {
              setActiveStat(null);
              setFilters((prev) => ({
                ...prev,
                status: v as BulkProcurementFilters["status"],
                quickFilter: "all",
              }));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setActiveStat(null);
              setFilters((prev) => ({
                ...prev,
                search: searchInput,
                quickFilter: "all",
              }));
              setCurrentPage(1);
            }}
          >
            Search
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F6F8] hover:bg-[#F5F6F8]">
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Company
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Project
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Expected Order
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Assigned Executive
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
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      title="No procurement requests"
                      description="Try adjusting your search or filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedRequest(request);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-[#64748B]" />
                        <span className="font-medium text-[#1A1A1A]">
                          {request.company}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {request.customerName}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {request.project}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {request.projectLocation}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold text-[#1A1A1A]">
                      {formatCurrency(request.expectedOrderValue)}
                    </TableCell>
                    <TableCell>
                      <BulkProcurementStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {request.assignedExecutiveName ?? (
                        <span className="text-amber-600">Unassigned</span>
                      )}
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
                              setSelectedRequest(request);
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
          pageSize={BULK_PROCUREMENT_PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          itemLabel="requests"
        />
      </div>

      <BulkProcurementDetailDrawer
        request={selectedRequest}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
