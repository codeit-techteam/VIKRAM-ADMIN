"use client";

import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatStockQuantity,
  getAvailableStock,
  getInventoryStockStatus,
} from "@/mock/inventory";
import type { InventoryItem } from "@/types/inventory.types";
import { cn } from "@/lib/utils";

interface InventoryDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "muted" | "danger";
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-[#FAFAFA] p-3">
      <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold",
          tone === "warning" && "text-primary",
          tone === "muted" && "text-[#64748B]",
          tone === "danger" && "text-red-600",
          (!tone || tone === "default") && "text-[#1A1A1A]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function InventoryDetailSheet({
  open,
  onOpenChange,
  item,
}: InventoryDetailSheetProps) {
  const available = item ? getAvailableStock(item) : 0;
  const status = item ? getInventoryStockStatus(item) : "in-stock";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-lg"
      >
        {item ? (
          <>
            <SheetHeader className="border-b border-gray-100 p-5">
              <div className="pr-8">
                <SheetTitle className="text-lg text-[#1A1A1A]">
                  {item.productName}
                </SheetTitle>
                <SheetDescription className="mt-1">{item.sku}</SheetDescription>
                <div className="mt-3">
                  <InventoryStatusBadge status={status} />
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 p-5">
              <section>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Product Details
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Metric label="Category" value={item.category} />
                  <Metric label="Unit" value={item.unit} />
                  <Metric
                    label="Purchase Price"
                    value={`₹${item.purchasePrice.toLocaleString("en-IN")}`}
                  />
                  <Metric
                    label="Minimum Stock"
                    value={formatStockQuantity(item.minimumStock, item.unit)}
                    tone="muted"
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Current Stock
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Metric
                    label="Current Stock"
                    value={formatStockQuantity(item.currentStock, item.unit)}
                  />
                  <Metric
                    label="Reserved"
                    value={formatStockQuantity(item.committedStock, item.unit)}
                  />
                  <Metric
                    label="Available"
                    value={formatStockQuantity(available, item.unit)}
                    tone={
                      status === "out-of-stock"
                        ? "danger"
                        : status === "low-stock"
                          ? "warning"
                          : "default"
                    }
                  />
                  <Metric
                    label="Stock Value"
                    value={`₹${(item.currentStock * item.purchasePrice).toLocaleString("en-IN")}`}
                  />
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
