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
import type { HubNetworkInventoryRow } from "@/utils/hub-inventory-overview";

interface HubInventoryAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: HubNetworkInventoryRow | null;
  onConfirm: (payload: { newQuantity: number; reason: string }) => void;
}

export function HubInventoryAdjustDialog({
  open,
  onOpenChange,
  row,
  onConfirm,
}: HubInventoryAdjustDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (row && open) {
      setQuantity(String(row.availableQty));
      setReason("");
    }
  }, [row, open]);

  const parsed = Number(quantity);
  const valid =
    Number.isFinite(parsed) && parsed >= 0 && reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
          <DialogDescription>
            {row
              ? `Update available stock for ${row.materialName} at ${row.hubName}. Changes sync across the ERP mock store.`
              : "Update hub stock quantity."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              New Available Qty ({row?.unit ?? "units"})
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-1.5 h-10"
            />
            {row ? (
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                Current: {row.availableQty.toLocaleString("en-IN")} {row.unit} ·
                Reserved: {row.reservedQty.toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-medium tracking-wide text-[#64748B] uppercase">
              Reason
            </label>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Cycle count / damage / correction…"
              className="mt-1.5 h-10"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!valid}
            onClick={() => {
              onConfirm({
                newQuantity: Math.round(parsed),
                reason: reason.trim(),
              });
              onOpenChange(false);
            }}
          >
            Save Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
