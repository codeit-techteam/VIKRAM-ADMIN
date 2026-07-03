"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Eye, Filter, MoreVertical } from "lucide-react";
import { useMemo } from "react";

import { RequisitionFilterChips } from "@/components/requisitions/RequisitionFilterChips";
import { RequisitionPriorityBadge } from "@/components/requisitions/RequisitionPriorityBadge";
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
  formatRequisitionDate,
  formatRequisitionQuantity,
  getMaterialAvailableStock,
} from "@/mock/requisitions";
import type {
  RequisitionFilterChip,
  RequisitionListItem,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface RequisitionTableProps {
  items: RequisitionListItem[];
  isLoading?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  activeChip: RequisitionFilterChip;
  onChipChange: (chip: RequisitionFilterChip) => void;
  onPageChange: (page: number) => void;
  onAdvancedFilter: () => void;
  onExport?: () => void;
  onRowSelect: (item: RequisitionListItem) => void;
}

const columnHelper = createColumnHelper<RequisitionListItem>();

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

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

function RequisitionRowActions({
  item,
  onView,
}: {
  item: RequisitionListItem;
  onView: (item: RequisitionListItem) => void;
}) {
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
        aria-label={`View details for ${item.requestId}`}
      >
        <Eye className="size-4" />
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
          <DropdownMenuItem disabled className="gap-2 text-[#64748B]">
            Allocate Stock
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="gap-2 text-[#64748B]">
            Download PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RequisitionTable({
  items,
  isLoading = false,
  currentPage,
  totalItems,
  pageSize,
  activeChip,
  onChipChange,
  onPageChange,
  onAdvancedFilter,
  onExport,
  onRowSelect,
}: RequisitionTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

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
              onRowSelect(info.row.original);
            }}
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("requestedBy", {
        header: "Requested By",
        cell: (info) => {
          const requester = info.getValue();
          return (
            <div>
              <p className="font-semibold text-[#1A1A1A]">{requester.name}</p>
              <p className="mt-0.5 text-xs text-[#64748B]">{requester.role}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("hubName", {
        header: "Hub Name",
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
            </p>
            {row.original.materialSpec ? (
              <p className="mt-0.5 text-xs text-[#64748B]">
                {row.original.materialSpec}
              </p>
            ) : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: "requestedQty",
        header: "Qty",
        cell: ({ row }) => (
          <span className="text-sm text-[#64748B]">
            {formatRequisitionQuantity(
              row.original.requestedQty,
              row.original.unit,
            )}
          </span>
        ),
      }),
      columnHelper.display({
        id: "availableStock",
        header: "Available",
        cell: ({ row }) => {
          const stock = getMaterialAvailableStock(row.original.materialId);

          if (!stock) {
            return <span className="text-sm text-[#64748B]">—</span>;
          }

          return (
            <span className="text-primary text-sm font-semibold">
              {formatRequisitionQuantity(stock.available, stock.unit)}
            </span>
          );
        },
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => <RequisitionPriorityBadge priority={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: "Requested On",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">
            {formatRequisitionDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RequisitionRowActions item={row.original} onView={onRowSelect} />
        ),
      }),
    ],
    [onRowSelect],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="space-y-4 border-b border-gray-100 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <RequisitionFilterChips
            activeChip={activeChip}
            onChipChange={onChipChange}
          />

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
              onClick={onAdvancedFilter}
            >
              <Filter className="size-4" />
              Advanced Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-9 border-gray-200 text-[#64748B]"
              onClick={onExport}
              aria-label="Export requisitions"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5">
          <DataTableSkeleton columns={9} rows={10} />
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
                    No requisitions match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50/80"
                    onClick={() => onRowSelect(row.original)}
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

      <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748B]">
          Showing {startItem}-{endItem} of {totalItems} requisitions
        </p>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 border-gray-200"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <span aria-hidden="true">&lt;</span>
            <span className="sr-only">Previous page</span>
          </Button>

          {paginationItems.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex size-8 items-center justify-center text-sm text-[#64748B]"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                type="button"
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className={cn(
                  "size-8 min-w-8 px-0",
                  page === currentPage
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "border-gray-200 text-[#64748B]",
                )}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 border-gray-200"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <span aria-hidden="true">&gt;</span>
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
