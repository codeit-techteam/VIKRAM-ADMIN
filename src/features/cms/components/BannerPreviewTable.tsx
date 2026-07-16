"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Banner } from "@/features/cms/types/banner.types";

interface BannerPreviewTableProps {
  banners: Banner[];
  isLoading?: boolean;
  onEdit?: (banner: Banner) => void;
  onDelete?: (banner: Banner) => void;
}

const columnHelper = createColumnHelper<Banner>();

export function BannerPreviewTable({
  banners,
  isLoading = false,
  onEdit,
  onDelete,
}: BannerPreviewTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "drag",
        header: "",
        cell: () => (
          <button
            type="button"
            className="cursor-grab text-gray-300 hover:text-gray-500"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
        ),
      }),
      columnHelper.accessor("thumbnailUrl", {
        header: "Preview",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={row.thumbnailUrl}
                alt={row.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          );
        },
      }),
      columnHelper.accessor("title", {
        header: "Campaign Title",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="min-w-0">
              <p className="font-medium text-[#1A1A1A]">{row.title}</p>
              <p className="text-sm text-[#64748B]">{row.location}</p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "cta",
        header: "CTA / Redirect",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-primary text-sm font-medium">
              {row.original.ctaLabel}
            </p>
            <p className="text-sm text-[#64748B]">{row.original.ctaPath}</p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-gray-400 hover:text-gray-600"
              onClick={() => onEdit?.(row.original)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit {row.original.title}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-red-400 hover:text-red-600"
              onClick={() => onDelete?.(row.original)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete {row.original.title}</span>
            </Button>
          </div>
        ),
      }),
    ],
    [onDelete, onEdit],
  );

  const table = useReactTable({
    data: banners,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#64748B]">
        Loading banners...
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#64748B]">
        No banners match your filters.
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
