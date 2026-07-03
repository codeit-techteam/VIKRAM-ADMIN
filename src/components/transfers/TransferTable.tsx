"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Calendar,
  Download,
  Eye,
  MoreVertical,
  Search,
  SlidersHorizontal,
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
  formatTransferDateTime,
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
import { notify } from "@/utils/notify";

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
}

const columnHelper = createColumnHelper<TransferListItem>();

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "CREATED", label: "Created" },
  { value: "VEHICLE_ASSIGNED", label: "Vehicle Assigned" },
  { value: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { value: "READY", label: "Ready" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "REACHED_HUB", label: "Reached Hub" },
  { value: "DELIVERED", label: "Completed" },
  { value: "delayed", label: "Delayed" },
] as const;

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
}: {
  item: TransferListItem;
  onView: (item: TransferListItem) => void;
}) {
  const handleAction = (action: string) => {
    notify.info(
      action,
      `${action} for ${item.transferId} will be available in the next release.`,
    );
  };

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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="gap-2"
            onClick={() => handleAction("Assign Vehicle")}
          >
            Assign Vehicle
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => handleAction("Assign Driver")}
          >
            Assign Driver
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => handleAction("Start Dispatch")}
          >
            Start Dispatch
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            onClick={() => handleAction("Track Transfer")}
          >
            Track Transfer
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => handleAction("Mark Delivered")}
          >
            Mark Delivered
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        header: "Transfer ID",
        cell: (info) => {
          const transfer = info.row.original;
          return (
            <div>
              <button
                type="button"
                className="hover:text-primary text-primary font-semibold transition-colors"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(transfer);
                }}
              >
                {info.getValue()}
              </button>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Created: {formatTransferDateTime(transfer.createdAt)}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("sourceWarehouse", {
        header: "Source Warehouse",
        cell: (info) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("destinationHub", {
        header: "Destination Hub",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("vehicleNumber", {
        header: "Vehicle Number",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">
            {info.getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "assignedDriver",
        header: "Assigned Driver",
        cell: ({ row }) => {
          const driver = row.original.assignedDriver;
          if (!driver) {
            return <span className="text-sm text-[#64748B]">—</span>;
          }

          const initials = driver.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div className="flex items-center gap-2.5">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {driver.name}
                </p>
                <p className="text-xs text-[#64748B]">{driver.employeeId}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Current Status",
        cell: ({ row }) => <TransferStatusBadge transfer={row.original} />,
      }),
      columnHelper.accessor("dispatchAt", {
        header: "Dispatch Date & Time",
        cell: (info) => {
          const value = info.getValue();
          return (
            <span className="text-sm text-[#64748B]">
              {value ? formatTransferDateTime(value) : "—"}
            </span>
          );
        },
      }),
      columnHelper.accessor("eta", {
        header: "ETA",
        cell: ({ row }) => {
          const etaLabel = getTransferEtaLabel(row.original);
          return (
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {formatTransferTime(row.original.eta)}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs font-medium",
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
        cell: ({ row }) => (
          <TransferRowActions item={row.original} onView={onView} />
        ),
      }),
    ],
    [onView],
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
            placeholder="Search by Transfer ID, Vehicle Number, Driver Name, or Hub..."
            className="h-10 border-gray-200 bg-[#F8F9FB] pl-9 text-sm placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => {
                if (value)
                  updateFilter("status", value as TransferFilters["status"]);
              }}
            >
              <SelectTrigger className="h-9 w-[160px] border-gray-200 bg-white text-sm">
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
              <SelectTrigger className="h-9 w-[200px] border-gray-200 bg-white text-sm">
                <SelectValue placeholder="Source Warehouse" />
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
              <SelectTrigger className="h-9 w-[190px] border-gray-200 bg-white text-sm">
                <SelectValue placeholder="Destination Hub" />
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

            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) =>
                    updateFilter("dateFrom", event.target.value)
                  }
                  className="h-9 w-[140px] border-gray-200 bg-white pl-8 text-sm"
                  aria-label="Date from"
                />
              </div>
              <span className="text-xs text-[#64748B]">to</span>
              <div className="relative">
                <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) =>
                    updateFilter("dateTo", event.target.value)
                  }
                  className="h-9 w-[140px] border-gray-200 bg-white pl-8 text-sm"
                  aria-label="Date to"
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
          <DataTableSkeleton columns={9} rows={8} />
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
                    No transfers match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50/80"
                    onClick={() => onView(row.original)}
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
