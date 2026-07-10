"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import type { RecentOrder } from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<RecentOrder>();

export function RecentOrdersTable({
  orders,
  isLoading,
}: RecentOrdersTableProps) {
  const router = useRouter();

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
        cell: (info) => {
          const row = info.row.original;
          return row.customerId ? (
            <Link
              href={NAV_FILTER_PRESETS.customerDetail(row.customerId)}
              className="hover:text-primary text-[#64748B] hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {info.getValue()}
            </Link>
          ) : (
            <span className="text-[#64748B]">{info.getValue()}</span>
          );
        },
      }),
      columnHelper.accessor("source", {
        header: "Source",
        cell: (info) => {
          const source = info.getValue();
          const filterHref =
            source === "Exec"
              ? NAV_FILTER_PRESETS.ordersBySource("EXECUTIVE")
              : NAV_FILTER_PRESETS.ordersBySource("APP");

          return <StatusBadge status={source} filterHref={filterHref} />;
        },
      }),
      columnHelper.accessor("assignedHub", {
        header: "Assigned Hub",
        cell: (info) => {
          const row = info.row.original;
          return row.hubId ? (
            <Link
              href={NAV_FILTER_PRESETS.hubDetail(row.hubId)}
              className="hover:text-primary text-[#64748B] hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {info.getValue()}
            </Link>
          ) : (
            <span className="text-[#64748B]">{info.getValue()}</span>
          );
        },
      }),
      columnHelper.accessor("paymentStatus", {
        header: "Payment",
        cell: (info) => {
          const status = info.getValue();
          const filterHref =
            status === "PENDING"
              ? NAV_FILTER_PRESETS.paymentsPending()
              : undefined;

          const content = (
            <span
              className={cn(
                "text-xs font-semibold tracking-wide uppercase",
                status === "PAID" ? "text-green-600" : "text-red-600",
                filterHref && "hover:underline",
              )}
            >
              {status}
            </span>
          );

          if (filterHref) {
            return (
              <Link
                href={filterHref}
                onClick={(event) => event.stopPropagation()}
              >
                {content}
              </Link>
            );
          }

          return content;
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusMap: Record<string, string> = {
            PROCESSING: "ACTIVE",
            DISPATCHED: "IN_TRANSIT",
            DELIVERED: "DELIVERED",
            "AWAITING HUB": "HUB_PROCESSING",
          };
          const filterHref = NAV_FILTER_PRESETS.ordersByStatus(
            statusMap[status] ?? "ALL",
          );

          return <StatusBadge status={status} filterHref={filterHref} />;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Link
            href={row.original.href}
            aria-label={`View ${row.original.orderId}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-8 text-[#8B5E3C] hover:bg-orange-50 hover:text-[#8B5E3C]",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <Eye className="size-4" />
          </Link>
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

  return (
    <DashboardCard
      title="Recent Orders"
      action={
        <Link
          href={NAV_FILTER_PRESETS.ordersAll()}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Orders
        </Link>
      }
      contentClassName="mt-6"
    >
      {isLoading ? (
        <DataTableSkeleton columns={7} rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No recent orders"
          description="New orders will appear here as they are raised."
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
