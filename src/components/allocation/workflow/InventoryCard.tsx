"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  formatWorkflowQuantity,
  getApprovalNote,
} from "@/mock/allocation-workflow";
import type {
  MaterialWorkflowDetail,
  RequisitionListItem,
  StockAvailabilityLevel,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  material: MaterialWorkflowDetail;
  requisition: RequisitionListItem;
  availableQty: number;
  stockLevel: StockAvailabilityLevel;
  className?: string;
}

const categoryColors: Record<string, string> = {
  STEEL: "bg-primary text-white",
  CEMENT: "bg-primary text-white",
  MASONRY: "bg-orange-600 text-white",
  PAINT: "bg-sky-600 text-white",
};

export function InventoryCard({
  material,
  requisition,
  availableQty,
  stockLevel,
  className,
}: InventoryCardProps) {
  const isEnough = stockLevel === "enough";
  const isLow = stockLevel === "low" || stockLevel === "out-of-stock";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-44 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-24 rounded-full bg-white/30 backdrop-blur-sm" />
          </div>
          <span
            className={cn(
              "absolute top-4 left-4 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase",
              categoryColors[material.categoryLabel] ?? "bg-primary text-white",
            )}
          >
            {material.categoryLabel}
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">
              {material.name}
              {material.spec ? ` ${material.spec}` : ""}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                SKU Number
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                {material.sku}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Material Grade
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                {material.grade}
              </p>
            </div>
          </div>

          {material.specifications.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Specifications
              </p>
              <ul className="mt-2 space-y-1">
                {material.specifications.map((spec) => (
                  <li
                    key={spec}
                    className="flex items-start gap-2 text-sm text-[#64748B]"
                  >
                    <span className="text-primary mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border p-5",
          isEnough
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50",
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              isEnough ? "bg-green-500 text-white" : "bg-amber-500 text-white",
            )}
          >
            {isEnough ? (
              <CheckCircle2 className="size-6" />
            ) : (
              <AlertTriangle className="size-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                "text-base font-bold",
                isEnough ? "text-green-800" : "text-amber-800",
              )}
            >
              {isEnough ? "Enough Stock" : "Low Stock"}
            </h4>
            <p
              className={cn(
                "mt-1 text-sm",
                isEnough ? "text-green-700" : "text-amber-700",
              )}
            >
              {isEnough
                ? "Inventory levels meet the requirement for this requisition. Proceed to allocation."
                : "Available stock is below the requested quantity. Select another warehouse with sufficient stock."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/60 bg-white p-3">
                <p className="text-xs text-gray-500">Requested</p>
                <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                  {formatWorkflowQuantity(
                    requisition.requestedQty,
                    requisition.unit,
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-white/60 bg-white p-3">
                <p className="text-xs text-gray-500">Available</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-bold",
                    isLow ? "text-red-600" : "text-[#1A1A1A]",
                  )}
                >
                  {formatWorkflowQuantity(availableQty, requisition.unit)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span>{" "}
          {getApprovalNote(requisition.requestedQty, requisition.unit)}
        </p>
      </div>
    </div>
  );
}
