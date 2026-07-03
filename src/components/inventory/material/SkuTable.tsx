"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { getUnitLabel } from "@/mock/units";
import type { MaterialSku } from "@/types/material.types";
import { cn } from "@/lib/utils";

interface SkuTableProps {
  skus: MaterialSku[];
  onEdit?: (sku: MaterialSku) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (sku: MaterialSku) => void;
  readOnly?: boolean;
  className?: string;
}

function SkuStatusBadge({ status }: { status: MaterialSku["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        status === "active"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-100 text-gray-600",
      )}
    >
      {status}
    </span>
  );
}

export function SkuTable({
  skus,
  onEdit,
  onDelete,
  onDuplicate,
  readOnly = false,
  className,
}: SkuTableProps) {
  if (skus.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-[#1A1A1A]">No SKUs added yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Add at least one SKU variant to continue.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              SKU Code
            </TableHead>
            <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              SKU Name
            </TableHead>
            <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Variant
            </TableHead>
            <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Unit
            </TableHead>
            <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Stock Range
            </TableHead>
            <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Status
            </TableHead>
            {!readOnly && <TableHead className="w-12 text-right" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {skus.map((sku) => (
            <TableRow key={sku.id}>
              <TableCell className="font-mono text-sm font-medium text-[#1A1A1A]">
                {sku.skuCode}
              </TableCell>
              <TableCell className="text-sm text-[#1A1A1A]">
                {sku.skuName}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {sku.variant || sku.size || "—"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {getUnitLabel(sku.unit)}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {sku.minimumStock.toLocaleString("en-IN")} –{" "}
                {sku.maximumStock.toLocaleString("en-IN")}
              </TableCell>
              <TableCell>
                <SkuStatusBadge status={sku.status} />
              </TableCell>
              {!readOnly && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${sku.skuCode}`}
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(sku)}>
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate?.(sku)}>
                        <Copy className="size-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete?.(sku.id)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
