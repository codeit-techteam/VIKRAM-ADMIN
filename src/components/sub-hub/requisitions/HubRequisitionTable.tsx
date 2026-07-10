"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowRightLeft,
  Check,
  Eye,
  MoreHorizontal,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { RequisitionPriorityBadge } from "@/components/requisitions/RequisitionPriorityBadge";
import { RequisitionStatusBadge } from "@/components/requisitions/RequisitionStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatHubRequisitionDate,
  HUB_REQUISITION_PAGE_SIZE,
} from "@/mock/hub-requisitions";
import { formatRequisitionQuantity } from "@/mock/requisitions";
import type { RequisitionListItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

export type HubRequisitionSortKey =
  | "requestId"
  | "hubName"
  | "manager"
  | "material"
  | "requestedQty"
  | "approvedQty"
  | "priority"
  | "status"
  | "createdAt";

export type HubRequisitionSortDirection = "asc" | "desc";

interface HubRequisitionTableProps {
  items: RequisitionListItem[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  onRowSelect: (item: RequisitionListItem) => void;
  onApprove?: (item: RequisitionListItem) => void;
  onReject?: (item: RequisitionListItem) => void;
  onGenerateTransfer?: (item: RequisitionListItem) => void;
  onPrint?: (item: RequisitionListItem) => void;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 3) return [1, 2, 3, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: HubRequisitionSortKey;
  activeKey: HubRequisitionSortKey;
  direction: HubRequisitionSortDirection;
  onSort: (key: HubRequisitionSortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === sortKey;
  const Icon = direction === "asc" ? ArrowUpAZ : ArrowDownAZ;

  return (
    <TableHead
      className={cn(
        "sticky top-0 z-10 bg-white",
        align === "right" && "text-right",
      )}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase transition-colors",
          align === "right" && "w-full justify-end",
          active ? "text-primary" : "text-[#64748B] hover:text-[#1A1A1A]",
        )}
      >
        {label}
        {active ? <Icon className="size-3.5" /> : null}
      </button>
    </TableHead>
  );
}

function resolveApprovedQty(item: RequisitionListItem): string {
  if (item.status === "PENDING" || item.status === "REJECTED") return "—";
  const qty = item.approvedQty ?? item.requestedQty;
  return formatRequisitionQuantity(qty, item.unit);
}

function RowActions({
  item,
  onView,
  onApprove,
  onReject,
  onGenerateTransfer,
  onPrint,
}: {
  item: RequisitionListItem;
  onView: (item: RequisitionListItem) => void;
  onApprove?: (item: RequisitionListItem) => void;
  onReject?: (item: RequisitionListItem) => void;
  onGenerateTransfer?: (item: RequisitionListItem) => void;
  onPrint?: (item: RequisitionListItem) => void;
}) {
  const isPending = item.status === "PENDING";
  const canTransfer = item.status === "APPROVED" && Boolean(item.allocationId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
            aria-label={`Actions for ${item.requestId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onView(item);
          }}
        >
          <Eye className="size-4" />
          View Details
        </DropdownMenuItem>
        {isPending && onApprove ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onApprove(item);
            }}
          >
            <Check className="size-4" />
            Approve
          </DropdownMenuItem>
        ) : null}
        {isPending && onReject ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onReject(item);
            }}
          >
            <X className="size-4" />
            Reject
          </DropdownMenuItem>
        ) : null}
        {canTransfer && onGenerateTransfer ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onGenerateTransfer(item);
            }}
          >
            <ArrowRightLeft className="size-4" />
            Generate Transfer
          </DropdownMenuItem>
        ) : null}
        {onPrint ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                onPrint(item);
              }}
            >
              <Printer className="size-4" />
              Print
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function sortItems(
  items: RequisitionListItem[],
  sortKey: HubRequisitionSortKey,
  direction: HubRequisitionSortDirection,
): RequisitionListItem[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortKey) {
      case "requestId":
        comparison = a.requestId.localeCompare(b.requestId);
        break;
      case "hubName":
        comparison = a.hubName.localeCompare(b.hubName);
        break;
      case "manager":
        comparison = a.requestedBy.name.localeCompare(b.requestedBy.name);
        break;
      case "material":
        comparison = a.material.localeCompare(b.material);
        break;
      case "requestedQty":
        comparison = a.requestedQty - b.requestedQty;
        break;
      case "approvedQty":
        comparison =
          (a.approvedQty ?? (a.status === "PENDING" ? -1 : a.requestedQty)) -
          (b.approvedQty ?? (b.status === "PENDING" ? -1 : b.requestedQty));
        break;
      case "priority": {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison = order[a.priority] - order[b.priority];
        break;
      }
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }

    return direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function HubRequisitionTable({
  items,
  isLoading,
  isRefreshing,
  currentPage,
  totalItems,
  pageSize = HUB_REQUISITION_PAGE_SIZE,
  onPageChange,
  onRefresh,
  onRowSelect,
  onApprove,
  onReject,
  onGenerateTransfer,
  onPrint,
}: HubRequisitionTableProps) {
  const [sortKey, setSortKey] = useState<HubRequisitionSortKey>("createdAt");
  const [sortDirection, setSortDirection] =
    useState<HubRequisitionSortDirection>("desc");

  const sortedItems = useMemo(
    () => sortItems(items, sortKey, sortDirection),
    [items, sortKey, sortDirection],
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const handleSort = (key: HubRequisitionSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Hub Requisition Queue
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Material requests raised by sub-hub managers across the network
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-[#64748B]"
            aria-label="Column settings"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-[#64748B]"
            onClick={onRefresh}
            aria-label="Refresh requisitions"
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <DataTableSkeleton columns={10} rows={6} />
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No requisitions found"
            description="Try adjusting filters or wait for hub managers to raise new requests."
          />
        </div>
      ) : (
        <>
          <div className="max-h-[min(68vh,720px)] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SortableHead
                    label="Req ID"
                    sortKey="requestId"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Hub"
                    sortKey="hubName"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Manager"
                    sortKey="manager"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Material"
                    sortKey="material"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Requested Qty"
                    sortKey="requestedQty"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortableHead
                    label="Approved Qty"
                    sortKey="approvedQty"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortableHead
                    label="Priority"
                    sortKey="priority"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Status"
                    sortKey="status"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Created Date"
                    sortKey="createdAt"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHead className="sticky top-0 z-10 bg-white text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer transition-colors hover:bg-orange-50/40"
                    onClick={() => onRowSelect(item)}
                    style={{
                      animation: `hubInvFadeIn 0.28s ease ${Math.min(index * 0.04, 0.28)}s both`,
                    }}
                  >
                    <TableCell className="font-mono text-sm font-semibold text-[#1A1A1A]">
                      {item.requestId}
                    </TableCell>
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {item.hubName}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#1A1A1A]">
                        {item.requestedBy.name}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {item.requestedBy.role}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#1A1A1A]">
                        {item.material}
                      </div>
                      {item.materialSpec ? (
                        <div className="text-xs text-[#64748B]">
                          {item.materialSpec}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right text-[#475569] tabular-nums">
                      {formatRequisitionQuantity(item.requestedQty, item.unit)}
                    </TableCell>
                    <TableCell className="text-right text-[#475569] tabular-nums">
                      {resolveApprovedQty(item)}
                    </TableCell>
                    <TableCell>
                      <RequisitionPriorityBadge priority={item.priority} />
                    </TableCell>
                    <TableCell>
                      <RequisitionStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[#64748B]">
                      {formatHubRequisitionDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        item={item}
                        onView={onRowSelect}
                        onApprove={onApprove}
                        onReject={onReject}
                        onGenerateTransfer={onGenerateTransfer}
                        onPrint={onPrint}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#64748B]">
              Showing {rangeStart.toLocaleString("en-IN")}–
              {rangeEnd.toLocaleString("en-IN")} of{" "}
              {totalItems.toLocaleString("en-IN")} records
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Button>
              {paginationItems.map((pageItem, index) =>
                pageItem === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-[#94A3B8]"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={pageItem}
                    type="button"
                    variant={pageItem === currentPage ? "default" : "outline"}
                    size="sm"
                    className="min-w-9"
                    onClick={() => onPageChange(pageItem)}
                  >
                    {pageItem}
                  </Button>
                ),
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
