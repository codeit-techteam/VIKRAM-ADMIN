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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { BannerModification } from "@/features/cms/types/banner.types";

interface BannerModificationsTableProps {
  modifications: BannerModification[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<BannerModification>();

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BannerModificationsTable({
  modifications,
  isLoading = false,
}: BannerModificationsTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Banner",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={row.thumbnailUrl}
                  alt={row.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <p className="font-medium text-[#1A1A1A]">{row.name}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("hubTargeting", {
        header: "Hub Targeting",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("clicks", {
        header: "Clicks",
        cell: (info) => (
          <span className="text-[#1A1A1A]">
            {info.getValue().toLocaleString("en-IN")}
          </span>
        ),
      }),
      columnHelper.accessor("updatedBy", {
        header: "Last Updated By",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={row.updatedByAvatar} alt={row.updatedBy} />
                <AvatarFallback>{getInitials(row.updatedBy)}</AvatarFallback>
              </Avatar>
              <span className="text-[#64748B]">{row.updatedBy}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
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
                      Open menu for {row.original.name}
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
    data: modifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#64748B]">
        Loading modifications...
      </div>
    );
  }

  if (modifications.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#64748B]">
        No modifications match your filters.
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
              className="border-gray-100 bg-gray-50 hover:bg-gray-50"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-medium tracking-wide text-gray-500 uppercase"
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
            <TableRow key={row.id} className="border-b border-gray-100">
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
