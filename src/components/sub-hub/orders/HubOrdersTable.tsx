"use client";

import {
  Download,
  Eye,
  MapPin,
  MoreHorizontal,
  Printer,
  UserPlus,
  XCircle,
} from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { HubOrderStatusBadge } from "@/components/sub-hub/orders/HubOrderStatusBadge";
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
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import type { HubOrderListItem } from "@/types/hub-orders.types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { formatPaymentMethodLabel } from "@/utils/payment-method-labels";

interface HubOrdersTableProps {
  orders: HubOrderListItem[];
  hubCode?: string;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onView: (orderId: string) => void;
  onTrack?: (orderId: string) => void;
  onAssignDriver?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onDownloadInvoice?: (orderId: string) => void;
  onPrintInvoice?: (orderId: string) => void;
}

export function HubOrdersTable({
  orders,
  hubCode,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onView,
  onTrack,
  onAssignDriver,
  onCancel,
  onDownloadInvoice,
  onPrintInvoice,
}: HubOrdersTableProps) {
  if (isLoading) {
    return <CeTableSkeleton columns={12} rows={8} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description={
          hubCode
            ? `No customer orders match your filters for ${hubCode}.`
            : "No customer orders match your filters."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead className="min-w-[180px]">Delivery Address</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Pay Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hub</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-orange-50/30">
                <TableCell className="font-medium whitespace-nowrap">
                  {order.orderNumber}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {order.customer?.fullName ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {order.customer?.phone ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-[#64748B]">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-[#64748B]">
                  {order.deliveryAddressLabel}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatPaymentMethodLabel(order.paymentMethod)}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap capitalize">
                  {order.paymentStatus?.toLowerCase() ?? "—"}
                </TableCell>
                <TableCell>
                  <HubOrderStatusBadge
                    status={order.orderStatus}
                    label={order.statusLabel}
                  />
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {order.hub?.code ?? hubCode ?? "—"}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {order.assignedDriver?.name ?? "—"}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {order.assignedVehicle?.registration ?? "—"}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatCurrency(order.grandTotal)}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-[#64748B]">
                  {order.expectedDeliveryAt
                    ? formatDate(order.expectedDeliveryAt)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onView(order.id)}>
                        <Eye className="mr-2 size-4" />
                        View Order
                      </DropdownMenuItem>
                      {onTrack ? (
                        <DropdownMenuItem onClick={() => onTrack(order.id)}>
                          <MapPin className="mr-2 size-4" />
                          Track Order
                        </DropdownMenuItem>
                      ) : null}
                      {order.invoiceId ? (
                        <DropdownMenuItem onClick={() => onView(order.id)}>
                          View Invoice
                        </DropdownMenuItem>
                      ) : null}
                      {onAssignDriver ? (
                        <DropdownMenuItem
                          onClick={() => onAssignDriver(order.id)}
                        >
                          <UserPlus className="mr-2 size-4" />
                          Assign Driver
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      {onDownloadInvoice ? (
                        <DropdownMenuItem
                          onClick={() => onDownloadInvoice(order.id)}
                        >
                          <Download className="mr-2 size-4" />
                          Download Invoice
                        </DropdownMenuItem>
                      ) : null}
                      {onPrintInvoice ? (
                        <DropdownMenuItem
                          onClick={() => onPrintInvoice(order.id)}
                        >
                          <Printer className="mr-2 size-4" />
                          Print Invoice
                        </DropdownMenuItem>
                      ) : null}
                      {onCancel &&
                      !["DELIVERED", "CANCELLED"].includes(
                        order.orderStatus,
                      ) ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onCancel(order.id)}
                          >
                            <XCircle className="mr-2 size-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748B]">
          Showing {orders.length} of {total} orders
        </p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={15}
          totalItems={total}
          onPageChange={onPageChange}
          itemLabel="orders"
        />
      </div>
    </div>
  );
}
