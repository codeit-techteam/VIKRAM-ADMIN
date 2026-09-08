"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryStockStatus } from "@/types/inventory.types";

export type InventoryStatusFilter = InventoryStockStatus | "all";

export interface InventoryAdvancedFilters {
  search: string;
  status: InventoryStatusFilter;
}

interface InventoryAdvancedFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: InventoryAdvancedFilters;
  onApply: (next: InventoryAdvancedFilters) => void;
}

const STATUS_OPTIONS: Array<{ value: InventoryStatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

export function InventoryAdvancedFilterDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: InventoryAdvancedFilterDialogProps) {
  const [draft, setDraft] = useState<InventoryAdvancedFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Filter</DialogTitle>
          <DialogDescription>
            Narrow the stock ledger by SKU, product name, or stock status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              Search
            </label>
            <Input
              value={draft.search}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Product name or SKU"
              className="mt-1.5 h-10"
            />
          </div>
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              Stock Status
            </label>
            <Select
              value={draft.status}
              onValueChange={(status) =>
                setDraft((current) => ({
                  ...current,
                  status: status as InventoryStatusFilter,
                }))
              }
            >
              <SelectTrigger className="mt-1.5 h-10 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="bg-transparent">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const reset = { search: "", status: "all" as const };
              setDraft(reset);
              onApply(reset);
              onOpenChange(false);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply({
                search: draft.search.trim(),
                status: draft.status,
              });
              onOpenChange(false);
            }}
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
