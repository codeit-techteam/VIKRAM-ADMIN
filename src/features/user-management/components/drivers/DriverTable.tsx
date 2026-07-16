"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Truck, Warehouse } from "lucide-react";
import { useMemo } from "react";

import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { Button } from "@/components/ui/button";
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
import type { LogisticsDriver } from "@/types/logistics.types";
import { cn } from "@/lib/utils";

interface DriverTableProps {
  drivers: LogisticsDriver[];
  isLoading?: boolean;
  onView?: (driver: LogisticsDriver) => void;
  onEdit?: (driver: LogisticsDriver) => void;
  onAssignVehicle?: (driver: LogisticsDriver) => void;
  onTransferHub?: (driver: LogisticsDriver) => void;
  onDelete?: (driver: LogisticsDriver) => void;
}

const columnHelper = createColumnHelper<LogisticsDriver>();

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

export function DriverTable({
  drivers,
  isLoading = false,
  onView,
  onEdit,
  onAssignVehicle,
  onTransferHub,
  onDelete,
}: DriverTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "driver",
        header: "DRIVER",
        cell: ({ row }) => {
          const driver = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  getAvatarColor(driver.id),
                )}
              >
                {driver.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={driver.photoUrl}
                    alt={driver.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(driver.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#1A1A1A]">
                  {driver.name}
                </p>
                <p className="truncate text-xs text-[#64748B]">
                  {driver.employeeId}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("mobile", {
        header: "MOBILE",
        cell: ({ getValue }) => (
          <span className="text-sm text-[#1A1A1A]">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("licenseNumber", {
        header: "LICENSE",
        cell: ({ getValue }) => (
          <span className="text-sm text-[#64748B]">{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "vehicle",
        header: "VEHICLE",
        cell: ({ row }) => (
          <span className="text-sm text-[#1A1A1A]">
            {row.original.assignedVehicleNumber ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("assignedHub", {
        header: "HUB",
        cell: ({ getValue }) => (
          <span className="block max-w-[140px] truncate text-sm text-[#64748B]">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("tripsToday", {
        header: "TRIPS TODAY",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: ({ getValue }) => <LogisticsStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const driver = row.original;
          const canAssignVehicle = driver.status === "available";
          return (
            <div
              className="flex justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="icon-sm" variant="ghost" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(driver)}>
                    View Profile
                  </DropdownMenuItem>
                  {canAssignVehicle ? (
                    <DropdownMenuItem onClick={() => onAssignVehicle?.(driver)}>
                      <Truck className="mr-2 size-4" />
                      {driver.assignedVehicleId
                        ? "Reassign Vehicle"
                        : "Assign Vehicle"}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={() => onTransferHub?.(driver)}>
                    <Warehouse className="mr-2 size-4" />
                    Transfer Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(driver)}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete?.(driver)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onAssignVehicle, onDelete, onEdit, onTransferHub, onView],
  );

  const table = useReactTable({
    data: drivers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-base font-semibold text-[#1A1A1A]">
          No drivers found
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          Add a driver or adjust your filters.
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
              className="bg-[#F8F9FB] hover:bg-[#F8F9FB]"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-semibold tracking-wider text-gray-400 uppercase"
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
              className="cursor-pointer hover:bg-gray-50/50"
              onClick={() => onView?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
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
