"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Package } from "lucide-react";
import { useMemo } from "react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  InventoryActivity,
  InventoryActivityStatus,
  QuantityChangeType,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface InventoryActivityTableProps {
  activities: InventoryActivity[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<InventoryActivity>();

const quantityStyles: Record<QuantityChangeType, string> = {
  positive: "font-medium text-green-600",
  negative: "font-medium text-red-600",
  neutral: "text-[#64748B]",
};

const statusDotStyles: Record<InventoryActivityStatus, string> = {
  completed: "bg-green-500",
  verified: "bg-green-500",
  processing: "bg-blue-500",
  pending: "bg-amber-500",
};

const statusLabelStyles: Record<InventoryActivityStatus, string> = {
  completed: "text-green-700",
  verified: "text-green-700",
  processing: "text-blue-700",
  pending: "text-amber-700",
};

function ActivityStatusBadge({ status }: { status: InventoryActivityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium capitalize",
        statusLabelStyles[status],
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", statusDotStyles[status])}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

export function InventoryActivityTable({
  activities,
  isLoading,
}: InventoryActivityTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("time", {
        header: "Time",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("activity", {
        header: "Activity",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("material", {
        header: "Material",
        cell: (info) => (
          <span className="font-semibold text-[#1A1A1A]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Qty",
        cell: ({ row }) => (
          <span className={quantityStyles[row.original.quantityChange]}>
            {row.original.quantity}
          </span>
        ),
      }),
      columnHelper.accessor("by", {
        header: "By",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <ActivityStatusBadge status={info.getValue()} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DashboardCard
      title="Recent Inventory Activity"
      action={
        <button
          type="button"
          className="text-primary text-sm font-medium transition-colors hover:underline"
        >
          Full Log
        </button>
      }
      contentClassName="mt-6"
      className="h-full"
    >
      {isLoading ? (
        <DataTableSkeleton columns={6} rows={6} />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Inventory movements will appear here as they occur."
          icon={<Package className="size-8" />}
        />
      ) : (
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
                <TableRow
                  key={row.id}
                  className="border-gray-100 transition-colors hover:bg-gray-50/80"
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
