"use client";

import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatWorkflowQuantity } from "@/mock/allocation-workflow";
import type { AllocationWorkflowStep } from "@/types/warehouse.types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface WorkflowStickyFooterProps {
  currentStep: AllocationWorkflowStep;
  selectedLabel?: string;
  continueLabel?: string;
  subtotal?: string;
  canContinue?: boolean;
  isSubmitting?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  onCancel?: () => void;
}

export function WorkflowStickyFooter({
  currentStep,
  selectedLabel,
  continueLabel = "Continue",
  subtotal,
  canContinue = true,
  isSubmitting = false,
  showBack = false,
  onBack,
  onSaveDraft,
  onContinue,
  onCancel,
}: WorkflowStickyFooterProps) {
  if (currentStep === 5) return null;

  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-6 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {showBack ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 border-gray-200"
              onClick={onBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : selectedLabel ? (
            <p className="truncate text-sm font-bold text-[#1A1A1A] uppercase">
              Selected Requisition{" "}
              <span className="text-primary normal-case">{selectedLabel}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
          {subtotal ? (
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Current Subtotal
              </p>
              <p className="text-lg font-bold text-[#1A1A1A]">{subtotal}</p>
            </div>
          ) : null}

          {onCancel && currentStep === 1 ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 gap-2 text-[#64748B]"
              onClick={onCancel}
            >
              <X className="size-4" />
              Cancel Workflow
            </Button>
          ) : null}

          {onSaveDraft ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10 text-[#64748B]"
              onClick={onSaveDraft}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
          ) : null}

          {onContinue ? (
            <Button
              type="button"
              className={cn("h-10 gap-2 px-5")}
              onClick={onContinue}
              disabled={!canContinue || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {continueLabel}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function buildSelectedRequisitionLabel(
  requestId: string,
  material: string,
  qty: number,
  unit: string,
): string {
  return `${requestId} — ${material} (${formatWorkflowQuantity(qty, unit)})`;
}

export function useWorkflowCancel() {
  const router = useRouter();

  return () => {
    router.push(`${ROUTES.CENTRAL_WAREHOUSE}/allocate`);
  };
}
