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
import { Textarea } from "@/components/ui/textarea";
import { formatStockQuantity, getAvailableStock } from "@/mock/inventory";
import type { InventoryItem } from "@/types/inventory.types";

interface InventoryAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  isSubmitting?: boolean;
  onConfirm: (payload: {
    availableQty: number;
    minimumStock: number;
    remarks: string;
  }) => void;
}

export function InventoryAdjustDialog({
  open,
  onOpenChange,
  item,
  isSubmitting = false,
  onConfirm,
}: InventoryAdjustDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (item && open) {
      setQuantity(String(getAvailableStock(item)));
      setMinimumStock(String(item.minimumStock));
      setRemarks("");
    }
  }, [item, open]);

  const parsedQty = Number(quantity);
  const parsedMin = Number(minimumStock);
  const valid =
    Number.isFinite(parsedQty) &&
    parsedQty >= 0 &&
    Number.isFinite(parsedMin) &&
    parsedMin >= 0 &&
    remarks.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Inventory</DialogTitle>
          <DialogDescription>
            {item
              ? `Update available stock and reorder level for ${item.productName}.`
              : "Update warehouse stock quantity."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              Available Qty ({item?.unit ?? "units"})
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-1.5 h-10"
            />
            {item ? (
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                Current: {formatStockQuantity(getAvailableStock(item), item.unit)}{" "}
                · Reserved:{" "}
                {formatStockQuantity(item.committedStock, item.unit)}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              Minimum Stock
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={minimumStock}
              onChange={(event) => setMinimumStock(event.target.value)}
              className="mt-1.5 h-10"
            />
          </div>
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              Reason
            </label>
            <Textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Cycle count / damage / correction…"
              className="mt-1.5 min-h-20"
            />
          </div>
        </div>

        <DialogFooter className="bg-transparent">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!valid || isSubmitting}
            onClick={() =>
              onConfirm({
                availableQty: Math.round(parsedQty),
                minimumStock: Math.round(parsedMin),
                remarks: remarks.trim(),
              })
            }
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
