"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Ban, Eye, Pencil, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { CustomerStatusBadge } from "@/features/user-management/components/CustomerStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CUSTOMER_TYPE_LABELS,
  type CustomerListItem,
} from "@/features/user-management/types/customer.types";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  customers: CustomerListItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
  onEdit?: (customer: CustomerListItem) => void;
  onBlock?: (customer: CustomerListItem) => void;
  onAssignExecutive?: (customer: CustomerListItem) => void;
}

const columnHelper = createColumnHelper<CustomerListItem>();

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getAvatarColor(id: string): string {
  const index = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function CustomerTable({
  customers,
  selectedIds,
  onSelectionChange,
  isLoading = false,
  onEdit,
  onBlock,
  onAssignExecutive,
}: CustomerTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => null,
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectionChange([...selectedIds, row.original.id]);
              } else {
                onSelectionChange(
                  selectedIds.filter((id) => id !== row.original.id),
                );
              }
            }}
            aria-label={`Select ${row.original.name}`}
          />
        ),
      }),
      columnHelper.display({
        id: "customer",
        header: "CUSTOMER",
        cell: ({ row }) => {
          const customer = row.original;

          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  getAvatarColor(customer.id),
                )}
              >
                {getInitials(customer.name)}
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A]">{customer.name}</p>
                <p className="text-xs text-[#64748B]">
                  ID: {customer.customerId}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("customerType", {
        header: "CUSTOMER TYPE",
        cell: ({ getValue }) => (
          <span className="text-sm text-[#1A1A1A]">
            {CUSTOMER_TYPE_LABELS[getValue()]}
          </span>
        ),
      }),
      columnHelper.accessor("assignedHub", {
        header: "ASSIGNED HUB",
        cell: ({ getValue }) => (
          <span
            className={cn(
              "text-sm",
              getValue() === "Not Assigned"
                ? "text-[#64748B] italic"
                : "text-[#1A1A1A]",
            )}
          >
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("assignedExecutive", {
        header: "ASSIGNED EXECUTIVE",
        cell: ({ getValue }) => (
          <span
            className={cn(
              "text-sm",
              getValue() === "Not Assigned"
                ? "text-[#64748B] italic"
                : "text-[#1A1A1A]",
            )}
          >
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("activeOrders", {
        header: "ACTIVE ORDERS",
        cell: ({ getValue }) => {
          const count = getValue();

          return (
            <Badge
              variant="outline"
              className={cn(
                "min-w-8 justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                count > 0
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-gray-200 bg-gray-50 text-[#64748B]",
              )}
            >
              {count}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("lastOrderDate", {
        header: "LAST ORDER DATE",
        cell: ({ getValue }) => {
          const value = getValue();

          return (
            <span
              className={cn(
                "text-sm",
                value ? "text-[#1A1A1A]" : "text-[#64748B] italic",
              )}
            >
              {value ? formatDate(value) : "No Orders Yet"}
            </span>
          );
        },
      }),
      columnHelper.accessor("registrationDate", {
        header: "REGISTRATION DATE",
        cell: ({ getValue }) => (
          <span className="text-sm text-[#64748B]">
            {formatDate(getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => <CustomerStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => {
          const customer = row.original;
          const hasExecutive = Boolean(customer.supportExecutiveAssignment);

          return (
            <div className="flex items-center gap-1">
              <Link
                href={`${ROUTES.USER_MANAGEMENT_CUSTOMERS}/${customer.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "hover:text-primary size-8 text-[#64748B]",
                )}
                aria-label={`View ${customer.name}`}
              >
                <Eye className="size-4" />
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary size-8 text-[#64748B]"
                aria-label={`Edit ${customer.name}`}
                onClick={() => onEdit?.(customer)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-[#64748B] hover:text-red-600"
                aria-label={`Block ${customer.name}`}
                onClick={() => onBlock?.(customer)}
              >
                <Ban className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary size-8 gap-0 text-[#64748B]"
                aria-label={
                  hasExecutive
                    ? `Change executive for ${customer.name}`
                    : `Assign executive to ${customer.name}`
                }
                title={hasExecutive ? "Change Executive" : "Assign Executive"}
                onClick={() => onAssignExecutive?.(customer)}
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [selectedIds, onSelectionChange, onEdit, onBlock, onAssignExecutive],
  );

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <CustomerTableSkeleton />;
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-[#1A1A1A]">No customers found</p>
        <p className="mt-1 text-xs text-[#64748B]">
          Try adjusting your filters or search query.
        </p>
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
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              className={cn(
                "border-gray-100 transition-colors hover:bg-gray-50/80",
                index % 2 === 1 && "bg-gray-50/40",
              )}
            >
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
  );
}

function CustomerTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-2 py-3">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}
