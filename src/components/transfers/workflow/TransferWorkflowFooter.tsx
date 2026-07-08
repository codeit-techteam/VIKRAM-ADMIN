"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TransferWorkflowStep } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface TransferWorkflowFooterProps {
  currentStep: TransferWorkflowStep;
  continueLabel?: string;
  canContinue?: boolean;
  isSubmitting?: boolean;
  showBack?: boolean;
  showSaveDraft?: boolean;
  showCancel?: boolean;
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  onCancel?: () => void;
}

export function TransferWorkflowFooter({
  currentStep,
  continueLabel = "Continue",
  canContinue = true,
  isSubmitting = false,
  showBack = false,
  showSaveDraft = false,
  showCancel = false,
  onBack,
  onSaveDraft,
  onContinue,
  onCancel,
}: TransferWorkflowFooterProps) {
  if (currentStep === 5) return null;

  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-6 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
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
          ) : showCancel ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 border-gray-200"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
          {showSaveDraft ? (
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
