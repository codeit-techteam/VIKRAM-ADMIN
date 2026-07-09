"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { ExecutiveStatusBadge } from "@/features/user-management/components/customer-executive/ExecutiveStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerExecutiveRecord } from "@/features/user-management/types/support-executive.types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ExecutiveTableProps {
  executives: CustomerExecutiveRecord[];
  isLoading?: boolean;
  onAssignCustomers?: (executive: CustomerExecutiveRecord) => void;
  onEdit?: (executive: CustomerExecutiveRecord) => void;
}

const columnHelper = createColumnHelper<CustomerExecutiveRecord>();

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

export function ExecutiveTable({
  executives,
  isLoading = false,
  onAssignCustomers,
  onEdit,
}: ExecutiveTableProps) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "executive",
        header: "EXECUTIVE",
        cell: ({ row }) => {
          const executive = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  getAvatarColor(executive.id),
                )}
              >
                {executive.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={executive.photo}
                    alt={executive.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(executive.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#1A1A1A]">
                  {executive.name}
                </p>
                <p className="truncate text-xs text-[#64748B]">
                  {executive.email}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("employeeId", {
        header: "EMPLOYEE ID",
        cell: ({ getValue }) => (
          <span className="font-medium text-[#64748B]">#{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "hubRegion",
        header: "HUB / REGION",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {row.original.hub}
            </p>
            <p className="text-xs text-[#64748B]">{row.original.region}</p>
          </div>
        ),
      }),
      columnHelper.accessor("assignedCustomers", {
        header: "CUSTOMERS",
        cell: ({ getValue }) => (
          <span className="font-medium text-[#1A1A1A]">{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "stats",
        header: "STATS (TODAY / TOTAL)",
        cell: ({ row }) => (
          <div>
            <p className="text-sm">
              <span className="text-primary font-bold">
                {row.original.todayOrders}
              </span>
              <span className="text-[#64748B]">
                {" "}
                / {row.original.totalOrders.toLocaleString("en-IN")}
              </span>
            </p>
            <p className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
              Assisted Orders
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => <ExecutiveStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => {
          const executive = row.original;
          return (
            <div className="flex items-center gap-1">
              <Link
                href={`${ROUTES.CUSTOMER_EXECUTIVE}/${executive.id}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                  className: "hover:text-primary size-8 text-[#64748B]",
                })}
                aria-label={`View ${executive.name}`}
              >
                <Eye className="size-4" />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary size-8 text-[#64748B]"
                onClick={() => onEdit?.(executive)}
                aria-label={`Edit ${executive.name}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary size-8 text-[#64748B]"
                onClick={() => onAssignCustomers?.(executive)}
                aria-label={`Assign customers to ${executive.name}`}
              >
                <UserPlus className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                    className: "size-8 text-[#64748B]",
                  })}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `${ROUTES.CUSTOMER_EXECUTIVE}/${executive.id}`,
                      )
                    }
                  >
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(executive)}>
                    Edit Executive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onAssignCustomers?.(executive)}
                  >
                    Assign Customers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onAssignCustomers, onEdit, router],
  );

  const table = useReactTable({
    data: executives,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-gray-100 bg-[#FAFAF8] hover:bg-[#FAFAF8]"
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-12 text-center text-sm text-[#64748B]"
              >
                No executives match your filters.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-gray-100 transition-colors hover:bg-gray-50/80"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
