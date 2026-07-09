"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowRightLeft,
  Eye,
  MoreHorizontal,
  Pencil,
  PowerOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { ManagerStatusBadge } from "@/features/user-management/components/sub-hub-manager/ManagerStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { SubHubManager } from "@/features/user-management/types/sub-hub-manager.types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ManagerTableProps {
  managers: SubHubManager[];
  isLoading?: boolean;
  onEdit?: (manager: SubHubManager) => void;
  onTransfer?: (manager: SubHubManager) => void;
  onDeactivate?: (manager: SubHubManager) => void;
}

const columnHelper = createColumnHelper<SubHubManager>();

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
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

export function ManagerTable({
  managers,
  isLoading = false,
  onEdit,
  onTransfer,
  onDeactivate,
}: ManagerTableProps) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "manager",
        header: "MANAGER",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  getAvatarColor(m.id),
                )}
              >
                {getInitials(m.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#1A1A1A]">
                  {m.name}
                </p>
                <p className="truncate text-xs text-[#64748B]">{m.email}</p>
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
        id: "hub",
        header: "HUB",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {row.original.hubName}
            </p>
            <p className="text-xs text-[#64748B]">{row.original.city}</p>
          </div>
        ),
      }),
      columnHelper.accessor("pendingRequisitions", {
        header: "PENDING REQ.",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "font-semibold",
                val > 5 ? "text-amber-600" : "text-[#1A1A1A]",
              )}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("pendingDispatches", {
        header: "PENDING DISP.",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span
              className={cn(
                "font-semibold",
                val > 15 ? "text-orange-600" : "text-[#1A1A1A]",
              )}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor("todayOrders", {
        header: "TODAY'S ORDERS",
        cell: ({ getValue }) => (
          <span className="font-semibold text-[#1A1A1A]">{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "drivers",
        header: "DRIVERS",
        cell: ({ row }) => (
          <span className="text-sm text-[#1A1A1A]">
            <span className="font-bold">{row.original.availableDrivers}</span>
            <span className="text-[#64748B]">
              {" "}
              / {row.original.totalDrivers}
            </span>
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => <ManagerStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-1">
              <Link
                href={`${ROUTES.SUB_HUB_MANAGERS}/${m.id}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                  className: "hover:text-primary size-8 text-[#64748B]",
                })}
                aria-label={`View ${m.name}`}
              >
                <Eye className="size-4" />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary size-8 text-[#64748B]"
                onClick={() => onEdit?.(m)}
                aria-label={`Edit ${m.name}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary size-8 text-[#64748B]"
                onClick={() => onTransfer?.(m)}
                aria-label={`Transfer hub for ${m.name}`}
              >
                <ArrowRightLeft className="size-4" />
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
                      router.push(`${ROUTES.SUB_HUB_MANAGERS}/${m.id}`)
                    }
                  >
                    <Eye className="mr-2 size-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(m)}>
                    <Pencil className="mr-2 size-4" />
                    Edit Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTransfer?.(m)}>
                    <ArrowRightLeft className="mr-2 size-4" />
                    Transfer Hub
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDeactivate?.(m)}
                  >
                    <PowerOff className="mr-2 size-4" />
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onEdit, onTransfer, onDeactivate, router],
  );

  const table = useReactTable({
    data: managers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
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
                No managers match your filters.
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
