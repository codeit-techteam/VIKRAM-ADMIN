"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowRightLeft,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";

import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
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
  formatStockQuantity,
  getAvailableStock,
  getInventoryStockStatus,
} from "@/mock/inventory";
import type { InventoryItem } from "@/types/inventory.types";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewItem?: (item: InventoryItem) => void;
  onEditItem?: (item: InventoryItem) => void;
  header?: React.ReactNode;
}

const columnHelper = createColumnHelper<InventoryItem>();

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

function InventoryRowActions({
  item,
  onView,
  onEdit,
}: {
  item: InventoryItem;
  onView?: (item: InventoryItem) => void;
  onEdit?: (item: InventoryItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
        onClick={(event) => {
          event.stopPropagation();
          onView?.(item);
        }}
        aria-label={`View ${item.productName}`}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
        onClick={(event) => {
          event.stopPropagation();
          onEdit?.(item);
        }}
        aria-label={`Edit ${item.productName}`}
      >
        <Pencil className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
              onClick={(event) => event.stopPropagation()}
              aria-label={`More actions for ${item.productName}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem disabled className="gap-2 text-[#64748B]">
            <ArrowRightLeft className="size-4" />
            Transfer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="gap-2 text-red-500">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function InventoryTable({
  items,
  isLoading = false,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onViewItem,
  onEditItem,
  header,
}: InventoryTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "product",
        header: "Product Name & SKU",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[#1A1A1A]">
              {row.original.productName}
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">{row.original.sku}</p>
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("currentStock", {
        header: "Current Stock",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {formatStockQuantity(row.original.currentStock, row.original.unit)}
          </span>
        ),
      }),
      columnHelper.accessor("committedStock", {
        header: "Reserved",
        cell: ({ row }) => (
          <span className="text-sm text-[#64748B]">
            {formatStockQuantity(
              row.original.committedStock,
              row.original.unit,
            )}
          </span>
        ),
      }),
      columnHelper.display({
        id: "available",
        header: "Available",
        cell: ({ row }) => {
          const available = getAvailableStock(row.original);
          const status = getInventoryStockStatus(row.original);

          return (
            <span
              className={cn(
                "text-sm font-semibold",
                status === "out-of-stock" ? "text-red-600" : "text-primary",
              )}
            >
              {formatStockQuantity(available, row.original.unit)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <InventoryStatusBadge
            status={getInventoryStockStatus(row.original)}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <InventoryRowActions
            item={row.original}
            onView={onViewItem}
            onEdit={onEditItem}
          />
        ),
      }),
    ],
    [onEditItem, onViewItem],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {header ? (
        <div className="border-b border-gray-100 p-6 pb-4">{header}</div>
      ) : null}

      {isLoading ? (
        <div className="p-6">
          <DataTableSkeleton columns={7} rows={4} />
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
                      className="bg-white text-xs font-medium tracking-wide text-gray-400 uppercase"
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
                    No inventory items match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50/80"
                    onClick={() => onViewItem?.(row.original)}
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

      <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748B]">
          Showing {startItem} to {endItem} of{" "}
          {totalItems.toLocaleString("en-IN")} items
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
