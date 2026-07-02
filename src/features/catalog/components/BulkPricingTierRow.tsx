"use client";

import { Diamond, Trash2 } from "lucide-react";

import type { BulkTier } from "@/features/catalog/schema/product-form.schema";

interface BulkPricingTierRowProps {
  tier: BulkTier;
  onDelete: () => void;
}

export function BulkPricingTierRow({
  tier,
  onDelete,
}: BulkPricingTierRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#EEF4FF] px-4 py-3">
      <div className="flex items-center gap-3">
        <Diamond className="size-4 shrink-0 text-blue-500" />
        <p className="text-sm text-[#1A1A1A]">
          Min Qty: <span className="font-semibold">{tier.minQty} units</span>
        </p>
        <span className="hidden text-gray-300 sm:inline" aria-hidden>
          |
        </span>
        <p className="text-sm text-[#1A1A1A]">
          Discount Price:{" "}
          <span className="font-semibold">₹{tier.discountPrice}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="text-destructive hover:text-destructive/80 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
        aria-label="Delete pricing tier"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
