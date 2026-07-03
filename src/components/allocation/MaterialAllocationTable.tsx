"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Box, Eye, MoreVertical } from "lucide-react";
import { useMemo } from "react";

import { FilterBar } from "@/components/allocation/FilterBar";
import { Pagination } from "@/components/allocation/Pagination";
import { PriorityBadge } from "@/components/allocation/PriorityBadge";
import { StatusBadge } from "@/components/allocation/StatusBadge";
import { StockIndicator } from "@/components/allocation/StockIndicator";
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
  formatAllocationQuantity,
  getMaterialAvailableForAllocation,
} from "@/mock/allocations";
import type { MaterialAllocationItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface MaterialAllocationTableProps {
  items: MaterialAllocationItem[];
  isLoading?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onView: (item: MaterialAllocationItem) => void;
  onAllocate: (item: MaterialAllocationItem) => void;
}

const columnHelper = createColumnHelper<MaterialAllocationItem>();

function RowActions({
  item,
  onView,
  onAllocate,
}: {
  item: MaterialAllocationItem;
  onView: (item: MaterialAllocationItem) => void;
  onAllocate: (item: MaterialAllocationItem) => void;
}) {
  const canAllocate = item.status !== "ALLOCATED";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hover:text-primary size-8 text-[#64748B] hover:bg-orange-50"
        onClick={(event) => {
          event.stopPropagation();
          onView(item);
        }}
        aria-label={`View ${item.requestId}`}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          "size-8",
          canAllocate
            ? "text-primary hover:text-primary hover:bg-orange-50"
            : "text-[#64748B] hover:bg-gray-100",
        )}
        onClick={(event) => {
          event.stopPropagation();
          if (canAllocate) onAllocate(item);
        }}
        disabled={!canAllocate}
        aria-label={`Allocate ${item.requestId}`}
      >
        <Box className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-[#64748B] hover:bg-gray-100 hover:text-[#1A1A1A]"
              onClick={(event) => event.stopPropagation()}
              aria-label={`More actions for ${item.requestId}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2" onClick={() => onView(item)}>
            <Eye className="size-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            disabled={!canAllocate}
            onClick={() => onAllocate(item)}
          >
            <Box className="size-4" />
            Allocate Material
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function MaterialAllocationTable({
  items,
  isLoading = false,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onFilter,
  onExport,
  onView,
  onAllocate,
}: MaterialAllocationTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("requestId", {
        header: "Request ID",
        cell: (info) => (
          <button
            type="button"
            className="hover:text-primary font-semibold text-[#1A1A1A] transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onView(info.row.original);
            }}
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("destinationHub", {
        header: "Destination Hub",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "material",
        header: "Material",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[#1A1A1A]">
              {row.original.material}
              {row.original.materialSpec
                ? ` (${row.original.materialSpec})`
                : ""}
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">
              ID: {row.original.sku}
            </p>
          </div>
        ),
      }),
      columnHelper.display({
        id: "requestedQty",
        header: "Req. Qty",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {formatAllocationQuantity(
              row.original.requestedQty,
              row.original.unit,
            )}
          </span>
        ),
      }),
      columnHelper.display({
        id: "stockInfo",
        header: "Stock Info",
        cell: ({ row }) => {
          const stock = getMaterialAvailableForAllocation(
            row.original.materialId,
            undefined,
            row.original.id,
          );

          if (!stock) {
            return <span className="text-sm text-[#64748B]">—</span>;
          }

          return (
            <StockIndicator
              available={stock.available}
              requestedQty={row.original.requestedQty}
              unit={stock.unit}
            />
          );
        },
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => <PriorityBadge priority={info.getValue()} />,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            item={row.original}
            onView={onView}
            onAllocate={onAllocate}
          />
        ),
      }),
    ],
    [onAllocate, onView],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1A1A1A]">
            Pending Material Allocation
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Review and allocate inventory to approved requisitions.
          </p>
        </div>
        <FilterBar onFilter={onFilter} onExport={onExport} />
      </div>

      {isLoading ? (
        <div className="p-5">
          <DataTableSkeleton columns={8} rows={10} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-gray-100 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-12 text-center text-sm text-[#64748B]"
                  >
                    No pending allocations match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-gray-100 transition-colors hover:bg-gray-50/80"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="requisitions"
        onPageChange={onPageChange}
      />
    </div>
  );
}
