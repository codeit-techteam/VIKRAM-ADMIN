"use client";

import {
  ArrowDownAZ,
  ArrowRightLeft,
  ArrowUpAZ,
  ClipboardList,
  Eye,
  History,
  MoreHorizontal,
  Package,
  PackagePlus,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import { HubInventoryStatusBadge } from "@/components/sub-hub/inventory/HubInventoryStatusBadge";
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
import type {
  HubInventorySortDirection,
  HubInventorySortKey,
  HubNetworkInventoryRow,
} from "@/utils/hub-inventory-overview";
import { cn } from "@/lib/utils";

interface HubInventoryTableProps {
  rows: HubNetworkInventoryRow[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  sortKey: HubInventorySortKey;
  sortDirection: HubInventorySortDirection;
  onSort: (key: HubInventorySortKey) => void;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  onView: (row: HubNetworkInventoryRow) => void;
  onAdjust: (row: HubNetworkInventoryRow) => void;
  onRaiseRequisition: (row: HubNetworkInventoryRow) => void;
  onTransfer: (row: HubNetworkInventoryRow) => void;
  onHistory: (row: HubNetworkInventoryRow) => void;
}

function formatQty(value: number, unit: string) {
  return `${value.toLocaleString("en-IN")} ${unit}`;
}

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function qtyClass(row: HubNetworkInventoryRow): string {
  if (row.status === "out-of-stock" || row.status === "critical") {
    return "text-red-600 font-semibold";
  }
  if (row.status === "low-stock") return "text-orange-600 font-semibold";
  return "text-[#1A1A1A]";
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
  sortKey: HubInventorySortKey;
  activeKey: HubInventorySortKey;
  direction: HubInventorySortDirection;
  onSort: (key: HubInventorySortKey) => void;
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

function RowActions({
  row,
  onView,
  onAdjust,
  onRaiseRequisition,
  onTransfer,
  onHistory,
}: {
  row: HubNetworkInventoryRow;
  onView: (row: HubNetworkInventoryRow) => void;
  onAdjust: (row: HubNetworkInventoryRow) => void;
  onRaiseRequisition: (row: HubNetworkInventoryRow) => void;
  onTransfer: (row: HubNetworkInventoryRow) => void;
  onHistory: (row: HubNetworkInventoryRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
            aria-label={`Actions for ${row.materialName}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(row)}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdjust(row)}>
          <PackagePlus className="size-4" />
          Adjust Inventory
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRaiseRequisition(row)}>
          <ClipboardList className="size-4" />
          Raise Requisition
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTransfer(row)}>
          <ArrowRightLeft className="size-4" />
          Transfer Stock
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onHistory(row)}>
          <History className="size-4" />
          History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HubInventoryTable({
  rows,
  isLoading,
  isRefreshing,
  currentPage,
  totalItems,
  pageSize,
  sortKey,
  sortDirection,
  onSort,
  onPageChange,
  onRefresh,
  onView,
  onAdjust,
  onRaiseRequisition,
  onTransfer,
  onHistory,
}: HubInventoryTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Inventory Status
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Real-time hub stock powered by transfers, reservations & dispatches
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-[#64748B]"
            aria-label="Filter columns"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-[#64748B]"
            onClick={onRefresh}
            aria-label="Refresh inventory"
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
      ) : rows.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No inventory matches"
            description="Try clearing filters or wait for warehouse transfers to reach hubs."
            icon={<Package className="size-8" />}
          />
        </div>
      ) : (
        <>
          <div className="max-h-[min(68vh,720px)] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SortableHead
                    label="Hub"
                    sortKey="hubName"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                  />
                  <SortableHead
                    label="Material"
                    sortKey="materialName"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                  />
                  <SortableHead
                    label="SKU"
                    sortKey="sku"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                  />
                  <SortableHead
                    label="Category"
                    sortKey="category"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                  />
                  <SortableHead
                    label="Available Qty"
                    sortKey="availableQty"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableHead
                    label="Reserved Qty"
                    sortKey="reservedQty"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableHead
                    label="Free Qty"
                    sortKey="freeQty"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableHead
                    label="Reorder Level"
                    sortKey="reorderLevel"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                    align="right"
                  />
                  <TableHead className="sticky top-0 z-10 bg-white">
                    Status
                  </TableHead>
                  <SortableHead
                    label="Last Updated"
                    sortKey="lastUpdated"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={onSort}
                  />
                  <TableHead className="sticky top-0 z-10 bg-white text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.entryKey}
                    className="transition-colors hover:bg-orange-50/40"
                    style={{
                      animation: `hubInvFadeIn 0.28s ease ${Math.min(index * 0.04, 0.28)}s both`,
                    }}
                  >
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {row.hubName}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#1A1A1A]">
                        {row.materialName}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#64748B]">
                      {row.sku}
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {row.category}
                    </TableCell>
                    <TableCell
                      className={cn("text-right tabular-nums", qtyClass(row))}
                    >
                      {formatQty(row.availableQty, row.unit)}
                    </TableCell>
                    <TableCell className="text-right text-[#475569] tabular-nums">
                      {formatQty(row.reservedQty, row.unit)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-[#1A1A1A] tabular-nums">
                      {formatQty(row.freeQty, row.unit)}
                    </TableCell>
                    <TableCell className="text-right text-[#64748B] tabular-nums">
                      {formatQty(row.reorderLevel, row.unit)}
                    </TableCell>
                    <TableCell>
                      <HubInventoryStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[#64748B]">
                      {formatUpdated(row.lastUpdated)}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        row={row}
                        onView={onView}
                        onAdjust={onAdjust}
                        onRaiseRequisition={onRaiseRequisition}
                        onTransfer={onTransfer}
                        onHistory={onHistory}
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
              {paginationItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-[#94A3B8]"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    type="button"
                    variant={item === currentPage ? "default" : "outline"}
                    size="sm"
                    className="min-w-9"
                    onClick={() => onPageChange(item)}
                  >
                    {item}
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
