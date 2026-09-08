"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerOrder } from "@/features/user-management/types/customer.types";
import { formatDate } from "@/utils/format-date";

interface CustomerRecentOrdersTableProps {
  orders: CustomerOrder[];
}

const columnHelper = createColumnHelper<CustomerOrder>();

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHubName(order: CustomerOrder): string {
  if (order.hubName?.trim()) return order.hubName.trim();
  if (order.hubId?.trim()) return order.hubId.trim();
  return "Not assigned";
}

const ORDER_STATUS_STYLES: Record<
  CustomerOrder["status"],
  {
    badge: "PENDING" | "PROCESSING" | "DISPATCHED" | "DELIVERED";
    label: string;
  }
> = {
  PENDING: { badge: "PENDING", label: "Pending" },
  PROCESSING: { badge: "PROCESSING", label: "Processing" },
  PACKED: { badge: "PROCESSING", label: "Packed" },
  DISPATCHED: { badge: "DISPATCHED", label: "Dispatched" },
  OUT_FOR_DELIVERY: { badge: "DISPATCHED", label: "Out For Delivery" },
  DELIVERED: { badge: "DELIVERED", label: "Delivered" },
  CANCELLED: { badge: "PENDING", label: "Cancelled" },
};

export function CustomerRecentOrdersTable({
  orders,
}: CustomerRecentOrdersTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("orderId", {
        header: "ORDER ID",
        cell: ({ getValue }) => (
          <span className="font-medium text-[#1A1A1A]">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("date", {
        header: "DATE",
        cell: ({ getValue }) => (
          <span className="text-[#64748B]">{formatDate(getValue())}</span>
        ),
      }),
      columnHelper.accessor((row) => getHubName(row), {
        id: "hub",
        header: "HUB",
        cell: ({ getValue }) => (
          <span className="text-[#1A1A1A]">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => {
          const status = getValue();
          const badge = ORDER_STATUS_STYLES[status];

          return <StatusBadge status={badge.badge} label={badge.label} />;
        },
      }),
      columnHelper.accessor("amount", {
        header: "AMOUNT",
        cell: ({ getValue }) => (
          <span className="font-medium text-[#1A1A1A]">
            {formatAmount(getValue())}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (orders.length === 0) {
    return null;
  }

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
            <TableRow key={row.id} className="border-gray-100">
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
