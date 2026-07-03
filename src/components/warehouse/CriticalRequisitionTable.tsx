"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, Eye, MoreVertical, Package, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Requisition, RequisitionPriority } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface CriticalRequisitionTableProps {
  requisitions: Requisition[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<Requisition>();

const priorityStyles: Record<RequisitionPriority, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
};

function PriorityBadge({ priority }: { priority: RequisitionPriority }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function CriticalRequisitionTable({
  requisitions,
  isLoading,
}: CriticalRequisitionTableProps) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("requestId", {
        header: "Request ID",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("hubName", {
        header: "Hub Name",
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
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => <PriorityBadge priority={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              href={row.original.href}
              aria-label={`View ${row.original.requestId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hover:text-primary size-8 text-[#64748B] hover:bg-orange-50",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <Eye className="size-4" />
            </Link>
            <button
              type="button"
              aria-label={`Approve ${row.original.requestId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-8 text-[#64748B] hover:bg-green-50 hover:text-green-600",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Allocate ${row.original.requestId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-8 text-[#64748B] hover:bg-blue-50 hover:text-blue-600",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <PackageCheck className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`More actions for ${row.original.requestId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-8 text-[#64748B] hover:bg-gray-100 hover:text-[#1A1A1A]",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: requisitions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DashboardCard
      title="Critical Requisition Queue"
      action={
        <button
          type="button"
          className="text-primary text-sm font-medium transition-colors hover:underline"
        >
          View All
        </button>
      }
      contentClassName="mt-6"
      className="h-full"
    >
      {isLoading ? (
        <DataTableSkeleton columns={6} rows={5} />
      ) : requisitions.length === 0 ? (
        <EmptyState
          title="No pending requisitions"
          description="Critical requisition requests will appear here."
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
                  className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50/80"
                  onClick={() => router.push(row.original.href)}
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
