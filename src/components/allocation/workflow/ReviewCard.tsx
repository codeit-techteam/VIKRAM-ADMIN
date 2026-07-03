"use client";

import {
  AlertTriangle,
  MapPin,
  Package,
  Shield,
  Warehouse,
} from "lucide-react";

import { ConfirmationModal } from "@/components/allocation/workflow/ConfirmationModal";
import { formatWorkflowQuantity } from "@/mock/allocation-workflow";
import type {
  AllocationWorkflowFormValues,
  AllocationWorkflowResult,
  MaterialWorkflowDetail,
  RequisitionListItem,
  WorkflowWarehouse,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  requisition: RequisitionListItem;
  material: MaterialWorkflowDetail;
  warehouse: WorkflowWarehouse;
  form: AllocationWorkflowFormValues;
  batchLabel: string;
  className?: string;
}

export function ReviewCard({
  requisition,
  material,
  warehouse,
  form,
  batchLabel,
  className,
}: ReviewCardProps) {
  const warehouseRemaining = warehouse.stock - form.allocationQty;
  const isExhausted = warehouseRemaining === 0;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-[#1A1A1A]">
            Allocation Details
          </h3>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[#64748B]">
            Draft
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <MapPin className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Distribution Hub
              </p>
              <p className="mt-1 font-semibold text-[#1A1A1A]">
                {requisition.hubName}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <Warehouse className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Storage Facility
              </p>
              <p className="mt-1 font-semibold text-[#1A1A1A]">
                {warehouse.name}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300">
              <Package className="size-7 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#1A1A1A]">
                {material.name}
                {material.spec ? ` (${material.spec})` : ""}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">SKU: {material.sku}</p>
              <span className="mt-2 inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 uppercase">
                Grade {material.grade}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Allocated Quantity
            </p>
            <p className="text-primary mt-2 text-lg font-bold">
              {formatWorkflowQuantity(form.allocationQty, requisition.unit)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Warehouse Balance
            </p>
            <p className="mt-2 text-lg font-bold text-[#1A1A1A]">
              {warehouseRemaining.toLocaleString("en-IN")} Remaining
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-4",
              isExhausted
                ? "border-red-200 bg-red-50"
                : "border-gray-100 bg-white",
            )}
          >
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Impact
            </p>
            <div className="mt-2 flex items-center gap-2">
              {isExhausted ? (
                <>
                  <AlertTriangle className="size-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-600">
                    Inventory Exhausted
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-green-700">
                  Within Limits
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Batch
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
              {batchLabel}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Allocation Remarks
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {form.remarks.trim() || "No remarks added."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewSummaryPanelProps {
  result?: AllocationWorkflowResult | null;
  requisition: RequisitionListItem;
  material: MaterialWorkflowDetail;
  form: AllocationWorkflowFormValues;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function ReviewSummaryPanel({
  requisition,
  material,
  form,
  isSubmitting = false,
  onConfirm,
  onBack,
}: ReviewSummaryPanelProps) {
  const baseWeight = material.unitDensity
    ? material.unitDensity * form.allocationQty
    : undefined;

  return (
    <div className="space-y-4">
      <ConfirmationModal />

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold tracking-wide text-[#1A1A1A] uppercase">
          Summary
        </h3>

        <div className="mt-4 space-y-3 text-sm">
          {baseWeight ? (
            <div className="flex justify-between">
              <span className="text-[#64748B]">Base Weight</span>
              <span className="font-semibold text-[#1A1A1A]">
                {baseWeight.toLocaleString("en-IN")} KG
              </span>
            </div>
          ) : null}
          {material.unitDensity ? (
            <div className="flex justify-between">
              <span className="text-[#64748B]">Unit Density</span>
              <span className="font-semibold text-[#1A1A1A]">
                {material.unitDensity} KG/{requisition.unit}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-[#64748B]">Load Capacity</span>
            <span className="text-primary font-semibold">High Impact</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Total Allocation</span>
            <span className="font-bold text-[#1A1A1A]">
              {form.allocationQty.toLocaleString("en-IN")}{" "}
              {requisition.unit.slice(0, 3)}.
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Reserving Inventory..." : "Confirm Allocation"}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            Back to Quantity
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Shield className="size-3.5" />
          RBAC Compliant Transaction
        </p>
      </div>
    </div>
  );
}
