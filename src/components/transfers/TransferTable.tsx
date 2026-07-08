"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowRight,
  Download,
  Eye,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { useMemo } from "react";

import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatTransferTime,
  getTransferEtaLabel,
  TRANSFER_HUB_OPTIONS,
  TRANSFER_WAREHOUSE_OPTIONS,
} from "@/mock/transfers";
import type {
  TransferFilters,
  TransferListItem,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";
import {
  getPriorityLabel,
  getPriorityStyles,
  getTransferActionLabel,
  getTransferRowActions,
  type TransferRowAction,
} from "@/utils/transfer-actions";

interface TransferTableProps {
  items: TransferListItem[];
  isLoading?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  filters: TransferFilters;
  onFiltersChange: (filters: TransferFilters) => void;
  onPageChange: (page: number) => void;
  onView: (item: TransferListItem) => void;
  onAction: (action: TransferRowAction, item: TransferListItem) => void;
  onCreateTransfer?: () => void;
}

const columnHelper = createColumnHelper<TransferListItem>();

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "TRANSFER_CREATED", label: "Transfer Created" },
  { value: "LOADING", label: "Loading" },
  { value: "READY_FOR_DISPATCH", label: "Ready For Dispatch" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "REACHED_HUB", label: "Reached Hub" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "delayed", label: "Delayed" },
] as const;

function truncateText(text: string, max = 28): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

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

function TransferRowActions({
  item,
  onView,
  onAction,
}: {
  item: TransferListItem;
  onView: (item: TransferListItem) => void;
  onAction: (action: TransferRowAction, item: TransferListItem) => void;
}) {
  const actions = getTransferRowActions(item);
  const menuActions = actions.filter((action) => action !== "view-details");

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
        aria-label={`View ${item.transferId}`}
      >
        <Eye className="size-4" />
      </Button>
      {menuActions.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 text-[#64748B] hover:bg-gray-100 hover:text-[#1A1A1A]"
                onClick={(event) => event.stopPropagation()}
                aria-label={`More actions for ${item.transferId}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            {menuActions.map((action, index) => (
              <div key={action}>
                {index > 0 &&
                (action === "start-dispatch" ||
                  action === "track" ||
                  action === "delete") ? (
                  <DropdownMenuSeparator />
                ) : null}
                <DropdownMenuItem
                  className={cn(
                    "gap-2",
                    action === "delete" && "text-red-600 focus:text-red-600",
                  )}
                  onClick={() => onAction(action, item)}
                >
                  {getTransferActionLabel(action)}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

export function TransferTable({
  items,
  isLoading = false,
  currentPage,
  totalItems,
  pageSize,
  filters,
  onFiltersChange,
  onPageChange,
  onView,
  onAction,
  onCreateTransfer,
}: TransferTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const updateFilter = <K extends keyof TransferFilters>(
    key: K,
    value: TransferFilters[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
    onPageChange(1);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("transferId", {
        header: "Transfer",
        size: 160,
        cell: (info) => {
          const transfer = info.row.original;
          const material =
            transfer.material ?? transfer.materials[0]?.split(" x")[0];
          return (
            <div className="min-w-0">
              <button
                type="button"
                className="hover:text-primary text-primary text-sm font-semibold transition-colors"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(transfer);
                }}
              >
                {info.getValue()}
              </button>
              <p className="mt-0.5 truncate text-xs text-[#64748B]">
                {transfer.allocationId ?? "—"}
                {material ? ` · ${truncateText(material, 22)}` : ""}
              </p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "route",
        header: "Route",
        size: 220,
        cell: ({ row }) => {
          const transfer = row.original;
          return (
            <div className="min-w-0 space-y-1">
              <p
                className="truncate text-sm font-medium text-[#1A1A1A]"
                title={transfer.sourceWarehouse}
              >
                {truncateText(transfer.sourceWarehouse, 32)}
              </p>
              <p className="flex items-center gap-1 text-xs text-[#64748B]">
                <ArrowRight className="size-3 shrink-0 text-orange-400" />
                <span className="truncate" title={transfer.destinationHub}>
                  {truncateText(transfer.destinationHub, 32)}
                </span>
              </p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "fleet",
        header: "Fleet",
        size: 180,
        cell: ({ row }) => {
          const transfer = row.original;
          const driver = transfer.assignedDriver;

          if (!transfer.vehicleNumber && !driver) {
            return (
              <span className="text-xs font-medium text-[#64748B]">
                Not assigned
              </span>
            );
          }

          return (
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-1.5 truncate text-sm text-[#1A1A1A]">
                <Truck className="size-3.5 shrink-0 text-[#64748B]" />
                <span className="truncate">
                  {transfer.vehicleNumber ?? "—"}
                </span>
              </p>
              {driver ? (
                <p className="truncate text-xs text-[#64748B]">
                  {driver.name.split(" ")[0]} {driver.name.split(" ").at(-1)}
                </p>
              ) : (
                <p className="text-xs text-[#64748B]">No driver</p>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        size: 150,
        cell: ({ row }) => {
          const transfer = row.original;
          const priority = getPriorityLabel(transfer);
          const showPriority = priority !== "Standard";

          return (
            <div className="flex flex-col items-start gap-1.5">
              <TransferStatusBadge transfer={transfer} />
              {showPriority ? (
                <span
                  className={cn(
                    "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    getPriorityStyles(transfer),
                  )}
                >
                  {priority}
                </span>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.accessor("eta", {
        header: "ETA",
        size: 120,
        cell: ({ row }) => {
          const transfer = row.original;
          const etaLabel = getTransferEtaLabel(transfer);
          return (
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {formatTransferTime(transfer.eta)}
              </p>
              <p
                className={cn(
                  "mt-0.5 truncate text-xs font-medium",
                  etaLabel.tone === "success" && "text-green-600",
                  etaLabel.tone === "warning" && "text-orange-600",
                  etaLabel.tone === "muted" && "text-[#64748B]",
                )}
              >
                {etaLabel.label}
              </p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        size: 88,
        cell: ({ row }) => (
          <TransferRowActions
            item={row.original}
            onView={onView}
            onAction={onAction}
          />
        ),
      }),
    ],
    [onAction, onView],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="space-y-4 border-b border-gray-100 p-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search Transfer ID, Allocation, Vehicle, Driver, Hub..."
            className="h-10 border-gray-200 bg-[#F8F9FB] pl-9 text-sm placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => {
                if (value)
                  updateFilter("status", value as TransferFilters["status"]);
              }}
            >
              <SelectTrigger className="h-9 w-[150px] border-gray-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sourceWarehouseId}
              onValueChange={(value) => {
                if (value) updateFilter("sourceWarehouseId", value);
              }}
            >
              <SelectTrigger className="h-9 w-[170px] border-gray-200 bg-white text-sm">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {TRANSFER_WAREHOUSE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.destinationHubId}
              onValueChange={(value) => {
                if (value) updateFilter("destinationHubId", value);
              }}
            >
              <SelectTrigger className="h-9 w-[150px] border-gray-200 bg-white text-sm">
                <SelectValue placeholder="Hub" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hubs</SelectItem>
                {TRANSFER_HUB_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onCreateTransfer ? (
              <Button
                type="button"
                size="sm"
                className="h-9 gap-2 px-3 text-sm font-semibold"
                onClick={onCreateTransfer}
              >
                <Plus className="size-4" />
                Create Transfer
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
            >
              <SlidersHorizontal className="size-4" />
              Advanced Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-9 border-gray-200 text-[#64748B]"
              aria-label="Export transfers"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5">
          <DataTableSkeleton columns={6} rows={8} />
        </div>
      ) : (
        <div>
          <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-gray-100 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase",
                        header.id === "actions" &&
                          "sticky right-0 z-20 w-[88px] bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]",
                      )}
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
                    No transfers match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group cursor-pointer border-gray-100 transition-colors hover:bg-gray-50/80"
                    onClick={() => onView(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3.5",
                          cell.column.id === "actions" &&
                            "sticky right-0 z-10 w-[88px] bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] group-hover:bg-gray-50/80",
                        )}
                      >
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
          <p className="border-t border-gray-50 px-5 py-2 text-xs text-[#64748B] lg:hidden">
            Tap a row or use the eye icon for allocation, dispatch date, and
            full details.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748B]">
          Showing {startItem}-{endItem} of {totalItems} active transfers
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
