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
import { CUSTOMER_HUBS } from "@/mock/customers";
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

function getHubName(hubId: string): string {
  return CUSTOMER_HUBS.find((hub) => hub.id === hubId)?.name ?? hubId;
}

const ORDER_STATUS_MAP: Record<
  CustomerOrder["status"],
  "PENDING" | "PROCESSING" | "DISPATCHED" | "DELIVERED"
> = {
  PENDING: "PENDING",
  CONFIRMED: "PROCESSING",
  DISPATCHED: "DISPATCHED",
  IN_TRANSIT: "DISPATCHED",
  DELIVERED: "DELIVERED",
  CANCELLED: "PENDING",
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
      columnHelper.accessor("hubId", {
        header: "HUB",
        cell: ({ getValue }) => (
          <span className="text-[#1A1A1A]">{getHubName(getValue())}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => {
          const status = getValue();
          const badgeStatus = ORDER_STATUS_MAP[status];

          return (
            <StatusBadge
              status={badgeStatus}
              label={status.replace("_", " ")}
            />
          );
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
