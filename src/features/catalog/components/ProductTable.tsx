"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { StockLevelBar } from "@/components/shared/StockLevelBar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Product,
  ProductStatus,
} from "@/features/catalog/types/product.types";

interface ProductTableProps {
  products: Product[];
  onLiveToggle: (productId: string, isLive: boolean) => void;
}

const columnHelper = createColumnHelper<Product>();

const STATUS_LABELS: Record<ProductStatus, string> = {
  LIVE: "LIVE",
  LOW_STOCK: "LOW STOCK",
  DRAFT: "DRAFT",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN").format(price);
}

export function ProductTable({ products, onLiveToggle }: ProductTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "productInfo",
        header: "PRODUCT INFO",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.thumbnailUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#1A1A1A]">
                  {product.name}
                </p>
                <p className="truncate text-xs text-[#64748B]">
                  SKU: {product.sku}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "brandCategory",
        header: "BRAND / CATEGORY",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {product.brand}
              </p>
              <p className="text-sm text-[#64748B]">{product.category}</p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "price",
        header: "PRICE",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <span className="text-sm font-medium text-[#1A1A1A]">
              ₹{formatPrice(product.price)} / {product.priceUnit}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "stock",
        header: "STOCK",
        cell: ({ row }) => <StockLevelBar units={row.original.stockUnits} />,
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
      columnHelper.display({
        id: "live",
        header: "LIVE",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <Switch
              checked={product.isLive}
              onCheckedChange={(checked) => onLiveToggle(product.id, checked)}
            />
          );
        },
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
    [onLiveToggle],
  );

  const table = useReactTable({
    data: products,
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
              className="border-gray-100 bg-[#F8FAFC] hover:bg-[#F8FAFC]"
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-gray-100 hover:bg-gray-50">
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
