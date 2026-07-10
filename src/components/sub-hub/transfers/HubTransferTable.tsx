"use client";

import {
  Eye,
  MoreHorizontal,
  Phone,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  Truck,
  User,
} from "lucide-react";

import { HubTransferStatusBadge } from "@/components/sub-hub/transfers/HubTransferStatusBadge";
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
  formatHubTransferDateTime,
  HUB_TRANSFER_PAGE_SIZE,
} from "@/mock/hub-transfers";
import type { HubTransfer } from "@/types/hub-transfer.types";
import { cn } from "@/lib/utils";

interface HubTransferTableProps {
  items: HubTransfer[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  onRowSelect: (item: HubTransfer) => void;
  onAssignVehicle?: (item: HubTransfer) => void;
  onAssignDriver?: (item: HubTransfer) => void;
  onUpdateStatus?: (item: HubTransfer) => void;
  onPrint?: (item: HubTransfer) => void;
  onCallDriver?: (item: HubTransfer) => void;
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

const priorityStyles = {
  critical: "text-red-600 font-bold",
  high: "text-orange-600 font-semibold",
  medium: "text-blue-600",
  low: "text-gray-500",
} as const;

function RowActions({
  item,
  onView,
  onAssignVehicle,
  onAssignDriver,
  onUpdateStatus,
  onPrint,
  onCallDriver,
}: {
  item: HubTransfer;
  onView: (item: HubTransfer) => void;
  onAssignVehicle?: (item: HubTransfer) => void;
  onAssignDriver?: (item: HubTransfer) => void;
  onUpdateStatus?: (item: HubTransfer) => void;
  onPrint?: (item: HubTransfer) => void;
  onCallDriver?: (item: HubTransfer) => void;
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
            aria-label={`Actions for ${item.transferId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onView(item);
          }}
        >
          <Eye className="size-4" />
          View Details
        </DropdownMenuItem>
        {onAssignVehicle ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onAssignVehicle(item);
            }}
          >
            <Truck className="size-4" />
            Assign Vehicle
          </DropdownMenuItem>
        ) : null}
        {onAssignDriver ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onAssignDriver(item);
            }}
          >
            <User className="size-4" />
            Assign Driver
          </DropdownMenuItem>
        ) : null}
        {onUpdateStatus ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onUpdateStatus(item);
            }}
          >
            Update Status
          </DropdownMenuItem>
        ) : null}
        {item.driverMobile && onCallDriver ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onCallDriver(item);
            }}
          >
            <Phone className="size-4" />
            Call Driver
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
              Print Dispatch Slip
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HubTransferTable({
  items,
  isLoading,
  isRefreshing,
  currentPage,
  totalItems,
  pageSize = HUB_TRANSFER_PAGE_SIZE,
  onPageChange,
  onRefresh,
  onRowSelect,
  onAssignVehicle,
  onAssignDriver,
  onUpdateStatus,
  onPrint,
  onCallDriver,
}: HubTransferTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Hub Customer Dispatch Registry
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Last-mile deliveries dispatched from sub-hubs to customers
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
            aria-label="Refresh transfers"
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <DataTableSkeleton columns={12} rows={6} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No dispatches found"
            description="Adjust filters or wait for hub managers to accept customer orders."
          />
        </div>
      ) : (
        <>
          <div className="max-h-[min(68vh,720px)] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Transfer ID
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Order ID
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Customer
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Mobile
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 min-w-[180px] bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Delivery Address
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Hub
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Driver
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Dispatch Time
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Expected Delivery
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Status
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Priority
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-white text-right text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-orange-50/40",
                      item.isDelayed && "bg-red-50/30",
                    )}
                    onClick={() => onRowSelect(item)}
                    style={{
                      animation: `hubInvFadeIn 0.28s ease ${Math.min(index * 0.04, 0.28)}s both`,
                    }}
                  >
                    <TableCell className="font-mono text-sm font-semibold text-[#1A1A1A]">
                      {item.transferId}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#64748B]">
                      {item.orderId}
                    </TableCell>
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {item.customerName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[#64748B]">
                      {item.customerMobile}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-[#475569]">
                      {item.deliveryAddress}
                    </TableCell>
                    <TableCell className="text-[#1A1A1A]">
                      {item.hubName}
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {item.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#475569]">
                      {item.vehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[#64748B]">
                      {item.dispatchTime
                        ? formatHubTransferDateTime(item.dispatchTime)
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap",
                        item.isDelayed
                          ? "font-semibold text-red-600"
                          : "text-[#64748B]",
                      )}
                    >
                      {formatHubTransferDateTime(item.expectedDelivery)}
                    </TableCell>
                    <TableCell>
                      <HubTransferStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-xs uppercase",
                        priorityStyles[item.priority],
                      )}
                    >
                      {item.priority}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        item={item}
                        onView={onRowSelect}
                        onAssignVehicle={onAssignVehicle}
                        onAssignDriver={onAssignDriver}
                        onUpdateStatus={onUpdateStatus}
                        onPrint={onPrint}
                        onCallDriver={onCallDriver}
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
