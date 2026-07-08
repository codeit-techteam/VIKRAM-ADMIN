"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
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

import { InventoryHealthBar } from "@/components/sub-hub/InventoryHealthBar";
import { SubHubStatusBadge } from "@/components/sub-hub/SubHubStatusBadge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { SubHubTableRow } from "@/types/erp.types";
import { cn } from "@/lib/utils";

interface SubHubTableProps {
  rows: SubHubTableRow[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<SubHubTableRow>();
const PAGE_SIZE = 8;

function hubActionLinks(hubId: string) {
  return {
    view: `${ROUTES.SUB_HUB_NETWORK}?hub=${hubId}`,
    inventory: `${ROUTES.CENTRAL_WAREHOUSE}/inventory?hub=${hubId}`,
    requisitions: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions?hub=${hubId}`,
    transfers: `${ROUTES.CENTRAL_WAREHOUSE}/transfers?hub=${hubId}`,
    details: `${ROUTES.SUB_HUB_NETWORK}?hub=${hubId}&view=details`,
  };
}

export function SubHubTable({ rows, isLoading }: SubHubTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Hub Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <MapPin className="text-primary size-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-medium text-[#1A1A1A]">{row.original.name}</p>
              <p className="text-xs text-[#64748B]">
                {row.original.nodeId} · {row.original.city}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("managerName", {
        header: "Hub Manager",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("inventoryHealth", {
        header: "Inventory Health",
        cell: ({ row }) => (
          <InventoryHealthBar health={row.original.inventoryHealth} />
        ),
      }),
      columnHelper.accessor("pendingOrders", {
        header: "Pending Orders",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("pendingRequisitions", {
        header: "Pending Requisitions",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("transfersInTransit", {
        header: "Transfers In Transit",
        cell: (info) => (
          <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Current Status",
        cell: ({ row }) => <SubHubStatusBadge status={row.original.status} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const links = hubActionLinks(row.original.hubId);

          return (
            <div className="flex items-center gap-1">
              <Link
                href={links.view}
                aria-label={`View ${row.original.name}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:text-primary size-8 text-[#64748B] hover:bg-orange-50",
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <Eye className="size-4" />
              </Link>
              <Link
                href={links.inventory}
                aria-label={`Inventory for ${row.original.name}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-8 text-[#64748B] hover:bg-blue-50 hover:text-blue-600",
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <Package className="size-4" />
              </Link>
              <Link
                href={links.requisitions}
                aria-label={`Requisitions for ${row.original.name}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-8 text-[#64748B] hover:bg-amber-50 hover:text-amber-600",
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <ClipboardList className="size-4" />
              </Link>
              <Link
                href={links.transfers}
                aria-label={`Transfers for ${row.original.name}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-8 text-[#64748B] hover:bg-green-50 hover:text-green-600",
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <ArrowLeftRight className="size-4" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-8 text-[#64748B] hover:bg-gray-100 hover:text-[#1A1A1A]",
                  )}
                  aria-label={`More actions for ${row.original.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem render={<Link href={links.view} />}>
                    <Eye />
                    View Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={links.inventory} />}>
                    <Package />
                    Inventory
                  </DropdownMenuItem>
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
                    More Details
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
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const visibleCount = table.getRowModel().rows.length;
  const totalCount = rows.length;

  return (
    <DashboardCard
      title="Active Regional Hubs"
      contentClassName="mt-6"
      className="h-full"
    >
      {isLoading ? (
        <DataTableSkeleton columns={8} rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No active hubs found"
          description="Sub-hub entries will appear here once hubs are registered."
          icon={<MapPin className="size-8" />}
        />
      ) : (
        <>
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

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#64748B]">
              Showing {visibleCount} of {totalCount} hub entries
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
  );
}
