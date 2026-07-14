"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRight, ArrowUpRight, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type {
  InventoryActivity,
  InventoryActivityStatus,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface InventoryActivityTableProps {
  activities: InventoryActivity[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<InventoryActivity>();

const statusDotStyles: Record<InventoryActivityStatus, string> = {
  completed: "bg-green-500",
  verified: "bg-emerald-500",
  processing: "bg-sky-500",
  pending: "bg-amber-500",
};

const statusLabelStyles: Record<InventoryActivityStatus, string> = {
  completed: "text-green-700",
  verified: "text-emerald-700",
  processing: "text-sky-700",
  pending: "text-amber-700",
};

const activityStyles: Record<string, string> = {
  "Pending Dispatch": "bg-amber-50 text-amber-700 ring-amber-100",
  "Loading at Warehouse": "bg-blue-50 text-blue-700 ring-blue-100",
  "Ready to Dispatch": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "In Transit to Hub": "bg-sky-50 text-sky-700 ring-sky-100",
  "Reached Sub-Hub": "bg-orange-50 text-orange-700 ring-orange-100",
  "Delivered to Hub": "bg-green-50 text-green-700 ring-green-100",
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

function ActivityTypeBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        activityStyles[label] ?? "bg-slate-50 text-slate-700 ring-slate-100",
      )}
    >
      {label}
    </span>
  );
}

function SummaryChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        tone === "warning" && "border-amber-100 bg-amber-50/70",
        tone === "success" && "border-emerald-100 bg-emerald-50/70",
        tone === "default" && "border-gray-100 bg-gray-50/80",
      )}
    >
      <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xl font-bold",
          tone === "warning" && "text-amber-700",
          tone === "success" && "text-emerald-700",
          tone === "default" && "text-[#1A1A1A]",
        )}
      >
        {String(value).padStart(2, "0")}
      </p>
    </div>
  );
}

export function InventoryActivityTable({
  activities,
  isLoading,
}: InventoryActivityTableProps) {
  const summary = useMemo(() => {
    return {
      inTransit: activities.filter((item) =>
        item.activity.includes("In Transit"),
      ).length,
      reachedHub: activities.filter((item) =>
        item.activity.includes("Reached Sub-Hub"),
      ).length,
      pending: activities.filter((item) =>
        item.activity.includes("Pending Dispatch"),
      ).length,
    };
  }, [activities]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("time", {
        header: "Time",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("transferId", {
        header: "Transfer ID",
        cell: (info) => {
          const transferId = info.getValue();
          if (!transferId) return "—";

          return (
            <Link
              href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transferId}`}
              className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {transferId}
              <ArrowUpRight className="size-3.5" />
            </Link>
          );
        },
      }),
      columnHelper.accessor("destinationHub", {
        header: "Destination Hub",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-[#94A3B8]" />
            <span className="text-sm text-[#64748B]">
              {info.getValue() ?? "—"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("activity", {
        header: "Activity",
        cell: (info) => <ActivityTypeBadge label={info.getValue()} />,
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
        header: "Qty Sent",
        cell: (info) => (
          <span className="font-medium text-red-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("by", {
        header: "Operator",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
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
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
          <Truck className="size-3.5" />
          Central Warehouse → Sub-Hub
        </span>
      }
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary h-8 gap-1 px-2 text-sm font-medium"
          nativeButton={false}
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers`} />}
        >
          View All Transfers
          <ArrowRight className="size-4" />
        </Button>
      }
      contentClassName="mt-5 space-y-4"
      className="overflow-hidden"
    >
      <p className="text-sm text-[#64748B]">
        Live outbound movements from the central warehouse to regional sub-hubs.
      </p>

      {!isLoading && activities.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryChip
            label="In Transit"
            value={summary.inTransit}
            tone="default"
          />
          <SummaryChip
            label="Reached Sub-Hub"
            value={summary.reachedHub}
            tone="success"
          />
          <SummaryChip
            label="Pending Dispatch"
            value={summary.pending}
            tone="warning"
          />
        </div>
      ) : null}

      {isLoading ? (
        <DataTableSkeleton columns={8} rows={6} />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No outbound activity yet"
          description="Transfers from the central warehouse to sub-hubs will appear here."
          icon={<Package className="size-8" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <Table>
            <TableHeader className="bg-[#FAFAFA]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-gray-100 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-[#FAFAFA] text-xs font-semibold tracking-wide text-gray-400 uppercase"
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
                  className="border-gray-100 transition-colors hover:bg-orange-50/30"
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
