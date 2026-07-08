"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ClipboardList,
  Eye,
  Info,
  MapPin,
  MoreVertical,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { SubHubTableRow } from "@/types/erp.types";
import { getHubInventoryHref } from "@/utils/hub-profile-metrics";
import {
  getHubDetailPath,
  getHubHealthScoreBarColor,
  getHubHealthScoreColor,
  getInventoryHealthBarColor,
  getInventoryHealthColor,
} from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

interface SubHubTableProps {
  rows: SubHubTableRow[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<SubHubTableRow>();
const PAGE_SIZE = 10;

const COLUMN_WIDTHS = [
  "20%",
  "16%",
  "14%",
  "12%",
  "12%",
  "14%",
  "12%",
] as const;

function hubActionLinks(hubId: string) {
  return {
    view: getHubDetailPath(hubId),
    inventory: getHubInventoryHref(hubId),
    requisitions: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions?hub=${hubId}`,
    transfers: `${ROUTES.CENTRAL_WAREHOUSE}/transfers?hub=${hubId}`,
    details: `${getHubDetailPath(hubId)}?tab=analytics`,
  };
}

function CompactHealthBar({
  value,
  barColor,
  textColor,
  suffix = "",
}: {
  value: number;
  barColor: string;
  textColor: string;
  suffix?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span
        className={cn(
          "w-9 shrink-0 text-right text-xs font-semibold tabular-nums",
          textColor,
        )}
      >
        {value}
        {suffix}
      </span>
    </div>
  );
}

function TableActionButton({
  href,
  label,
  icon: Icon,
  className,
}: {
  href: string;
  label: string;
  icon: typeof Eye;
  className?: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-8 shrink-0 text-[#64748B]",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <Icon className="size-4" />
    </Link>
  );
}

export function SubHubTable({ rows, isLoading }: SubHubTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Hub",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-lg">
              <MapPin className="text-primary size-3.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1A1A1A]">
                {row.original.name}
              </p>
              <p className="truncate text-xs text-[#64748B]">
                {row.original.nodeId} · {row.original.city}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("managerName", {
        header: "Manager",
        cell: (info) => (
          <span className="block truncate text-sm text-[#64748B]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("inventoryHealth", {
        header: "Inventory",
        cell: ({ row }) => (
          <CompactHealthBar
            value={row.original.inventoryHealth}
            barColor={getInventoryHealthBarColor(row.original.inventoryHealth)}
            textColor={getInventoryHealthColor(row.original.inventoryHealth)}
            suffix="%"
          />
        ),
      }),
      columnHelper.accessor("pendingOrders", {
        header: "Orders",
        cell: (info) => (
          <span className="text-sm font-semibold text-[#1A1A1A] tabular-nums">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "transfers",
        header: "Transfers",
        cell: ({ row }) => (
          <div className="text-xs font-medium tabular-nums">
            <span className="text-emerald-600">
              ↓{row.original.incomingTransfers}
            </span>
            <span className="mx-1 text-[#94A3B8]">/</span>
            <span className="text-blue-600">
              ↑{row.original.outgoingTransfers}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("healthScore", {
        header: "Hub Health",
        cell: ({ row }) => (
          <CompactHealthBar
            value={row.original.healthScore}
            barColor={getHubHealthScoreBarColor(row.original.healthScore)}
            textColor={getHubHealthScoreColor(row.original.healthScore)}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const links = hubActionLinks(row.original.hubId);

          return (
            <div className="flex items-center justify-end gap-0.5">
              <TableActionButton
                href={links.view}
                label="View"
                icon={Eye}
                className="hover:text-primary hover:bg-orange-50"
              />
              <TableActionButton
                href={links.inventory}
                label="Inventory"
                icon={Package}
                className="hover:bg-blue-50 hover:text-blue-600"
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-8 shrink-0 text-[#64748B] hover:bg-gray-100 hover:text-[#1A1A1A]",
                  )}
                  aria-label={`More actions for ${row.original.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem render={<Link href={links.requisitions} />}>
                    <ClipboardList />
                    Requisitions
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={links.transfers} />}>
                    <ArrowLeftRight />
                    Transfers
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={links.details} />}>
                    <Info />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={links.view} />}>
                    <Eye />
                    Hub Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const visibleCount = table.getRowModel().rows.length;
  const totalCount = rows.length;

  return (
    <motion.div
      className="w-full min-w-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <DashboardCard
        contentClassName="mt-0"
        className="w-full min-w-0 overflow-hidden p-0"
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Active Hub Table
          </h2>
        </div>

        {isLoading ? (
          <div className="px-6 pb-6">
            <DataTableSkeleton columns={7} rows={5} />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              title="No active hubs found"
              description="Sub-hub entries will appear here once hubs are registered."
              icon={<MapPin className="size-8" />}
            />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm">
                <colgroup>
                  {COLUMN_WIDTHS.map((width, index) => (
                    <col key={index} style={{ width }} />
                  ))}
                </colgroup>
                <TableHeader className="sticky top-0 z-10 bg-white [&_tr]:border-b [&_tr]:border-gray-100">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="h-10 bg-white px-4 text-xs font-medium tracking-wide text-gray-400 uppercase"
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
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/80"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-4 py-3.5 align-middle",
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
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#64748B]">
                Showing {pageIndex * PAGE_SIZE + 1}–
                {pageIndex * PAGE_SIZE + visibleCount} of {totalCount} hub
                entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pageCount }, (_, index) => index + 1)
                    .slice(
                      Math.max(0, pageIndex - 1),
                      Math.min(pageCount, pageIndex + 2),
                    )
                    .map((page) => (
                      <Button
                        key={page}
                        variant={pageIndex + 1 === page ? "default" : "outline"}
                        size="sm"
                        className="min-w-9"
                        onClick={() => table.setPageIndex(page - 1)}
                      >
                        {page}
                      </Button>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </DashboardCard>
    </motion.div>
  );
}
