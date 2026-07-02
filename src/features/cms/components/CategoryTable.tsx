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
import type {
  Category,
  CategoryStatus,
} from "@/features/cms/types/category.types";

interface CategoryTableProps {
  categories: Category[];
}

const columnHelper = createColumnHelper<Category>();

const STATUS_LABELS: Record<CategoryStatus, string> = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  INACTIVE: "INACTIVE",
};

function formatDisplayOrder(order: number): string {
  return order.toString().padStart(2, "0");
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "dragHandle",
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
      columnHelper.display({
        id: "category",
        header: "CATEGORY",
        cell: ({ row }) => {
          const category = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={category.thumbnailUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <p className="font-semibold text-[#1A1A1A]">{category.name}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("displayOrder", {
        header: "DISPLAY ORDER",
        cell: (info) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {formatDisplayOrder(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("productCount", {
        header: "PRODUCTS",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: (info) => (
          <StatusBadge
            status={info.getValue()}
            label={STATUS_LABELS[info.getValue()]}
          />
        ),
      }),
      columnHelper.accessor("lastUpdated", {
        header: "LAST UPDATED",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-gray-400 hover:text-[#1A1A1A]"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit {row.original.name}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete {row.original.name}</span>
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: categories,
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
            <TableRow
              key={row.id}
              className="border-b border-gray-100 hover:bg-gray-50"
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
