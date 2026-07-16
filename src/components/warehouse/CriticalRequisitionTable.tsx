"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Check,
  Eye,
  MoreVertical,
  Package,
  PackageCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { RequisitionPriorityBadge } from "@/components/requisitions/RequisitionPriorityBadge";
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
import { ROUTES } from "@/constants/routes";
import { formatRequisitionQuantity } from "@/mock/requisitions";
import type { RequisitionListItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface CriticalRequisitionTableProps {
  requisitions: RequisitionListItem[];
  isLoading?: boolean;
  onView: (item: RequisitionListItem) => void;
  onApprove: (item: RequisitionListItem) => void;
  onReject: (item: RequisitionListItem) => void;
  onAllocate: (item: RequisitionListItem) => void;
}

const columnHelper = createColumnHelper<RequisitionListItem>();
const VIEW_ALL_HREF = `${ROUTES.CENTRAL_WAREHOUSE}/requisitions?chip=critical`;

function CriticalRowActions({
  item,
  onView,
  onApprove,
  onReject,
  onAllocate,
}: {
  item: RequisitionListItem;
  onView: (item: RequisitionListItem) => void;
  onApprove: (item: RequisitionListItem) => void;
  onReject: (item: RequisitionListItem) => void;
  onAllocate: (item: RequisitionListItem) => void;
}) {
  const isPending = item.status === "PENDING";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 px-2.5 text-xs font-medium"
        onClick={(event) => {
          event.stopPropagation();
          onView(item);
        }}
      >
        <Eye className="size-3.5" />
        View
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
              aria-label={`More actions for ${item.requestId}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="gap-2"
            onClick={(event) => {
              event.stopPropagation();
              onView(item);
            }}
          >
            <Eye className="size-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            disabled={!isPending}
            onClick={(event) => {
              event.stopPropagation();
              onApprove(item);
            }}
          >
            <Check className="size-4" />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            disabled={!isPending}
            onClick={(event) => {
              event.stopPropagation();
              onAllocate(item);
            }}
          >
            <PackageCheck className="size-4" />
            Allocate Inventory
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-red-600 focus:text-red-600"
            disabled={!isPending}
            onClick={(event) => {
              event.stopPropagation();
              onReject(item);
            }}
          >
            <X className="size-4" />
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CriticalRequisitionTable({
  requisitions,
  isLoading,
  onView,
  onApprove,
  onReject,
  onAllocate,
}: CriticalRequisitionTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("requestId", {
        header: "Request ID",
        cell: (info) => (
          <button
            type="button"
            className="hover:text-primary font-semibold text-[#1A1A1A] transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onView(info.row.original);
            }}
          >
            {info.getValue()}
          </button>
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
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#1A1A1A]">
                {info.getValue()}
              </p>
              {item.materialSpec ? (
                <p className="truncate text-xs text-[#64748B]">
                  {item.materialSpec}
                </p>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.accessor("requestedQty", {
        header: "Qty",
        cell: (info) => (
          <span className="whitespace-nowrap text-[#64748B]">
            {formatRequisitionQuantity(info.getValue(), info.row.original.unit)}
          </span>
        ),
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => <RequisitionPriorityBadge priority={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <CriticalRowActions
            item={row.original}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
            onAllocate={onAllocate}
          />
        ),
      }),
    ],
    [onView, onApprove, onReject, onAllocate],
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
        <Link
          href={VIEW_ALL_HREF}
          className="text-primary text-sm font-medium transition-colors hover:underline"
        >
          View All
        </Link>
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
                      className={cn(
                        "text-xs font-medium tracking-wide text-gray-400 uppercase",
                        header.id === "actions" && "text-right",
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50/80"
                  onClick={() => onView(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-4",
                        cell.column.id === "actions" && "text-right",
                      )}
                    >
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
