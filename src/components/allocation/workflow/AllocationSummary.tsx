"use client";

import { CheckCircle2, Info } from "lucide-react";

import { formatWorkflowQuantity } from "@/mock/allocation-workflow";
import type {
  AllocationWorkflowFormValues,
  RequisitionListItem,
  WorkflowWarehouse,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface AllocationSummaryProps {
  requisition: RequisitionListItem;
  form: AllocationWorkflowFormValues;
  warehouse: WorkflowWarehouse | null;
  className?: string;
}

export function AllocationSummary({
  requisition,
  form,
  warehouse,
  className,
}: AllocationSummaryProps) {
  const allocatedQty = form.allocationQty;
  const remainingQty = Math.max(0, requisition.requestedQty - allocatedQty);
  const isFullAllocation = allocatedQty >= requisition.requestedQty;

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-[#1A1A1A] uppercase">
          Allocation Summary
        </h3>
        <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          Live
        </span>
      </div>

      <div
        className={cn(
          "rounded-xl border p-4",
          isFullAllocation
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50",
        )}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className={cn(
              "size-5 shrink-0",
              isFullAllocation ? "text-green-600" : "text-amber-600",
            )}
          />
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                isFullAllocation
                  ? "bg-green-200 text-green-800"
                  : "bg-amber-200 text-amber-800",
              )}
            >
              {isFullAllocation ? "Full Allocation" : "Partial Allocation"}
            </span>
            <p
              className={cn(
                "mt-2 text-sm",
                isFullAllocation ? "text-green-700" : "text-amber-700",
              )}
            >
              {isFullAllocation
                ? `Requirement fully satisfied by ${warehouse?.name.split(" - ")[0] ?? "selected warehouse"} stock.`
                : `${remainingQty.toLocaleString("en-IN")} ${requisition.unit} still pending after this allocation.`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Requested</span>
          <span className="font-semibold text-[#1A1A1A]">
            {formatWorkflowQuantity(requisition.requestedQty, requisition.unit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Allocated</span>
          <span className="text-primary font-bold">
            {formatWorkflowQuantity(allocatedQty, requisition.unit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Remaining</span>
          <span className="font-semibold text-[#1A1A1A]">
            {formatWorkflowQuantity(remainingQty, requisition.unit)}
          </span>
        </div>
      </div>

      {warehouse?.insight ? (
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-800">{warehouse.insight}</p>
        </div>
      ) : null}
    </div>
  );
}
