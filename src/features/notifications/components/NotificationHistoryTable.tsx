"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  NotificationStatus,
  PushNotification,
} from "@/features/notifications/types/notification.types";

interface NotificationHistoryTableProps {
  notifications: PushNotification[];
}

const columnHelper = createColumnHelper<PushNotification>();

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getStatusBadgeProps(status: NotificationStatus): {
  status: NotificationStatus;
  className?: string;
} {
  if (status === "SCHEDULED") {
    return {
      status,
      className: "bg-blue-100 text-blue-700",
    };
  }

  return { status };
}

export function NotificationHistoryTable({
  notifications,
}: NotificationHistoryTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "notification",
        header: "Notification",
        cell: ({ row }) => {
          const notification = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {notification.imageUrl ? (
                  <Image
                    src={notification.imageUrl}
                    alt={notification.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[10px] font-medium text-gray-400">
                    N/A
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1A1A1A]">
                  {notification.title}
                </p>
                <p className="truncate text-sm text-[#64748B]">
                  {notification.message}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("audienceLabel", {
        header: "Audience",
        cell: (info) => (
          <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("sentOrScheduledAt", {
        header: "Sent / Scheduled At",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const badgeProps = getStatusBadgeProps(info.getValue());

          return (
            <StatusBadge
              status={badgeProps.status}
              className={badgeProps.className}
            />
          );
        },
      }),
      columnHelper.display({
        id: "stats",
        header: "Stats",
        cell: ({ row }) => {
          const notification = row.original;

          if (notification.status === "DRAFT") {
            return <span className="text-sm text-gray-400">—</span>;
          }

          if (notification.status === "SCHEDULED") {
            return (
              <span className="text-sm text-[#64748B]">Pending delivery</span>
            );
          }

          return (
            <span className="text-sm font-medium text-[#1A1A1A]">
              {formatCount(notification.sentCount ?? 0)} sent
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: notifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            <TableRow key={row.id} className="border-gray-100">
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
