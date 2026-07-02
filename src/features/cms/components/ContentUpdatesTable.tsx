"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
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
import type { ContentUpdate } from "@/features/cms/types/cms.types";

interface ContentUpdatesTableProps {
  updates: ContentUpdate[];
}

const columnHelper = createColumnHelper<ContentUpdate>();

export function ContentUpdatesTable({ updates }: ContentUpdatesTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("assetName", {
        header: "Asset",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {row.thumbnailUrl ? (
                  <Image
                    src={row.thumbnailUrl}
                    alt={row.assetName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1A1A1A]">
                  {row.assetName}
                </p>
                <p className="truncate text-sm text-[#64748B]">
                  {row.subtitle}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("updatedBy", {
        header: "Updated By",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("lastModified", {
        header: "Last Modified",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-gray-400"
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">
                      Open menu for {row.original.assetName}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: updates,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Recent Content Updates
        </h2>
        <button
          type="button"
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Updates
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
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
    </div>
  );
}
