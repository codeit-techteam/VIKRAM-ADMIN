"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  IndianRupee,
  Loader2,
  MoreHorizontal,
  Phone,
  Search,
  UserCheck,
  XCircle,
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
  DropdownMenuSeparator,
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
  cancelBulkEnquiry,
  getBulkProcurementRequests,
  getBulkProcurementStats,
  type BulkProcurementFilters,
  type BulkQuickFilter,
} from "@/features/bulk-procurement/services/bulk-procurement.service";
import {
  BULK_DELIVERY_LABELS,
  BULK_STATUS_OPTIONS,
  TERMINAL_BULK_STATUSES,
  type BulkProcurementDashboardStats,
  type BulkProcurementRequest,
} from "@/features/bulk-procurement/types";
import { getApiErrorMessage } from "@/services/api";
import { notify } from "@/utils/notify";

type DrawerIntent =
  | "view"
  | "assign"
  | "follow-up"
  | "status"
  | "quote"
  | "convert"
  | "cancel";

function phoneHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:+${digits.startsWith("91") ? digits : `91${digits}`}`;
}

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerIntent, setDrawerIntent] = useState<DrawerIntent>("view");
  const [activeStat, setActiveStat] = useState<BulkQuickFilter | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
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
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      setFilters((prev) => {
        if (prev.search === nextSearch) return prev;
        setCurrentPage(1);
        return { ...prev, search: nextSearch };
      });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const breadcrumbs = useMemo(
    () => getNavBreadcrumbsFromPath("/customer-executive/bulk-procurement"),
    [],
  );

  const openDrawer = (id: string, intent: DrawerIntent = "view") => {
    setSelectedId(id);
    setDrawerIntent(intent);
    setDrawerOpen(true);
  };

  const handleStatClick = (stat: BulkQuickFilter) => {
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

  const handleCancel = async (request: BulkProcurementRequest) => {
    if (
      !window.confirm(
        `Cancel enquiry ${request.enquiryNumber}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setCancellingId(request.id);
    try {
      await cancelBulkEnquiry(request.id);
      notify.success("Enquiry cancelled");
      await loadData();
    } catch (error) {
      notify.error("Cancel failed", getApiErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Procurement"
        subtitle="Manage bulk material requests and executive assignments."
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Open"
          value={stats?.openRequests ?? 0}
          subtext="New / unassigned"
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
          subtext="With an executive"
          icon={UserCheck}
          iconContainerClassName="bg-purple-50"
          iconClassName="text-purple-600"
          isLoading={isLoading}
          isActive={activeStat === "assigned"}
          onClick={() => handleStatClick("assigned")}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          subtext="Active pipeline"
          icon={Loader2}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
          isLoading={isLoading}
          isActive={activeStat === "inProgress"}
          onClick={() => handleStatClick("inProgress")}
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          subtext="Converted / done"
          icon={CheckCircle2}
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-600"
          isLoading={isLoading}
          isActive={activeStat === "completed"}
          onClick={() => handleStatClick("completed")}
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelled ?? 0}
          subtext="Closed lost"
          icon={XCircle}
          iconContainerClassName="bg-red-50"
          iconClassName="text-red-600"
          isLoading={isLoading}
          isActive={activeStat === "cancelled"}
          onClick={() => handleStatClick("cancelled")}
        />
        <StatCard
          label="Pipeline"
          value={stats?.pipelineDisplay ?? "—"}
          subtext={
            stats && stats.quotedPipeline > 0
              ? "Quoted pipeline"
              : stats && stats.estimatedPipeline > 0
                ? "Estimated pipeline"
                : "No quoted value yet"
          }
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
              placeholder="Search enquiry, customer, mobile, company, material, executive..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(v) => {
              if (!v) return;
              setActiveStat(null);
              setFilters((prev) => ({
                ...prev,
                status: v as BulkProcurementFilters["status"],
                quickFilter: "all",
              }));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {BULK_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadError ? (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{loadError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void loadData()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F6F8] hover:bg-[#F5F6F8]">
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Enquiry ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Company
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Material
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Quantity
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Delivery Location
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Requested Delivery
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Assigned Executive
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Created
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
                    {Array.from({ length: 11 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11}>
                    <EmptyState
                      title="No procurement requests"
                      description="Try adjusting your search or filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => {
                  const tel = phoneHref(request.customerPhone);
                  const isTerminal = TERMINAL_BULK_STATUSES.includes(
                    request.status,
                  );
                  const deliveryLabel = request.deliveryRequirement
                    ? BULK_DELIVERY_LABELS[request.deliveryRequirement]
                    : request.deliveryDate
                      ? format(new Date(request.deliveryDate), "dd MMM yyyy")
                      : "—";

                  return (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => openDrawer(request.id, "view")}
                    >
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {request.enquiryNumber}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {request.customerName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {request.customerPhone || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {request.company}
                      </TableCell>
                      <TableCell className="text-sm text-[#1A1A1A]">
                        {request.material}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {request.quantityLabel ||
                          `${request.quantity} ${request.unit}`}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-[#64748B]">
                        {request.projectLocation}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {deliveryLabel}
                      </TableCell>
                      <TableCell>
                        <BulkProcurementStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {request.assignedExecutiveName ?? (
                          <span className="text-amber-600">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {format(new Date(request.createdAt), "dd MMM yyyy")}
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
                              onClick={() => openDrawer(request.id, "view")}
                            >
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDrawer(request.id, "assign")}
                              disabled={isTerminal}
                            >
                              <UserCheck className="size-4" />
                              Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!tel}
                              onClick={() => {
                                if (tel) window.location.href = tel;
                              }}
                            >
                              <Phone className="size-4" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openDrawer(request.id, "follow-up")
                              }
                              disabled={isTerminal}
                            >
                              Add Follow-up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDrawer(request.id, "status")}
                              disabled={isTerminal}
                            >
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDrawer(request.id, "quote")}
                              disabled={isTerminal}
                            >
                              Create Quote
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDrawer(request.id, "convert")}
                            >
                              Convert
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              disabled={
                                isTerminal || cancellingId === request.id
                              }
                              onClick={() => void handleCancel(request)}
                            >
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
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
        enquiryId={selectedId}
        open={drawerOpen}
        intent={drawerIntent}
        onOpenChange={setDrawerOpen}
        onUpdated={() => void loadData()}
      />
    </div>
  );
}
