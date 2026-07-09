"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderSourceBadge } from "@/features/user-management/components/OrderSourceBadge";
import type { CustomerOrder } from "@/features/user-management/types/customer.types";
import { CUSTOMER_HUBS } from "@/mock/customers";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface CustomerOrderTableProps {
  orders: CustomerOrder[];
  onViewOrder: (orderId: string) => void;
}

const columnHelper = createColumnHelper<CustomerOrder>();

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHubName(hubId: string): string {
  return CUSTOMER_HUBS.find((hub) => hub.id === hubId)?.name ?? hubId;
}

const ORDER_STATUS_STYLES: Record<
  CustomerOrder["status"],
  { badge: string; label: string }
> = {
  PENDING: {
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    label: "Pending",
  },
  PROCESSING: {
    badge: "bg-blue-50 text-blue-700 border border-blue-100",
    label: "Processing",
  },
  PACKED: {
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    label: "Packed",
  },
  DISPATCHED: {
    badge: "bg-sky-50 text-sky-700 border border-sky-100",
    label: "Dispatched",
  },
  OUT_FOR_DELIVERY: {
    badge: "bg-violet-50 text-violet-700 border border-violet-100",
    label: "Out For Delivery",
  },
  DELIVERED: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    label: "Delivered",
  },
  CANCELLED: {
    badge: "bg-red-50 text-red-700 border border-red-100",
    label: "Cancelled",
  },
};

function OrderStatusBadge({ status }: { status: CustomerOrder["status"] }) {
  const styles = ORDER_STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
        styles.badge,
      )}
    >
      {styles.label}
    </span>
  );
}

export function CustomerOrderTable({
  orders,
  onViewOrder,
}: CustomerOrderTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("orderId", {
        header: "ORDER ID",
        cell: ({ getValue }) => (
          <span className="font-medium text-[#1A1A1A]">#{getValue()}</span>
        ),
      }),
      columnHelper.accessor("date", {
        header: "ORDER DATE",
        cell: ({ getValue }) => (
          <span className="text-[#64748B]">{formatDate(getValue())}</span>
        ),
      }),
      columnHelper.accessor("hubId", {
        header: "HUB",
        cell: ({ getValue }) => (
          <span className="text-[#1A1A1A]">{getHubName(getValue())}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "AMOUNT",
        cell: ({ getValue }) => (
          <span className="font-medium text-[#1A1A1A]">
            {formatAmount(getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("orderSource", {
        header: "ORDER SOURCE",
        cell: ({ getValue }) => <OrderSourceBadge source={getValue()} />,
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => <OrderStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hover:text-primary size-8 text-[#64748B]"
            onClick={() => onViewOrder(row.original.id)}
            aria-label={`View order ${row.original.orderId}`}
          >
            <Eye className="size-4" />
          </Button>
        ),
      }),
    ],
    [onViewOrder],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-gray-100 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase"
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-gray-100 transition-colors hover:bg-gray-50/80"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
