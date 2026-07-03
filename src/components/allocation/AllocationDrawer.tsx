"use client";

import { X } from "lucide-react";

import { AllocationForm } from "@/components/allocation/AllocationForm";
import { formatAllocationQuantity } from "@/mock/allocations";
import type { MaterialAllocationItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface AllocationDrawerProps {
  open: boolean;
  item: MaterialAllocationItem | null;
  availableQty: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    warehouseSourceId: string;
    allocationQty: number;
    remarks?: string;
  }) => void;
  className?: string;
}

export function AllocationDrawer({
  open,
  item,
  availableQty,
  isSubmitting = false,
  onClose,
  onSubmit,
  className,
}: AllocationDrawerProps) {
  if (!item) return null;

  const remainingQty = item.requestedQty - item.allocatedQty;
  const isLowStock = availableQty < remainingQty;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-gray-100 bg-white shadow-sm transition-all duration-300 ease-in-out",
          "fixed inset-y-0 right-0 z-50 w-full border-l lg:static lg:z-auto lg:h-auto lg:rounded-xl lg:border",
          open
            ? "translate-x-0 lg:w-[28%]"
            : "pointer-events-none translate-x-full opacity-0 lg:w-0 lg:translate-x-0 lg:border-0 lg:opacity-100 lg:shadow-none",
          "md:w-1/2 lg:w-[28%]",
          className,
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Material Allocation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]"
            aria-label="Close allocation drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-gray-100 px-6 py-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
              Selected Material
            </p>
            <p className="mt-2 text-base font-bold text-[#1A1A1A]">
              {item.material}
              {item.materialSpec ? ` (${item.materialSpec})` : ""}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">ID: {item.sku}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Requested Qty</p>
                <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                  {formatAllocationQuantity(item.requestedQty, item.unit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Available</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-bold",
                    isLowStock ? "text-red-600" : "text-[#1A1A1A]",
                  )}
                >
                  {formatAllocationQuantity(availableQty, item.unit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AllocationForm
          item={item}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </aside>
    </>
  );
}
