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
import type { RecentOrder } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/utils/format-currency";

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

const columnHelper = createColumnHelper<RecentOrder>();

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("orderId", {
        header: "Order ID",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("customer", {
        header: "Customer",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("productCluster", {
        header: "Product Cluster",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Recent Orders
        </h2>
        <button
          type="button"
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Operations
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
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
                    className="text-xs font-medium tracking-wide text-gray-400 uppercase"
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
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
