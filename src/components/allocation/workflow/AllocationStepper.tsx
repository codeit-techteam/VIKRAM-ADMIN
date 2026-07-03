"use client";

import { Check } from "lucide-react";

import { WORKFLOW_STEP_LABELS } from "@/mock/allocation-workflow";
import type { AllocationWorkflowStep } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface AllocationStepperProps {
  currentStep: AllocationWorkflowStep;
  maxCompletedStep: number;
  className?: string;
}

export function AllocationStepper({
  currentStep,
  maxCompletedStep,
  className,
}: AllocationStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {WORKFLOW_STEP_LABELS.map((label, index) => {
          const step = (index + 1) as AllocationWorkflowStep;
          const isCompleted = step < currentStep || step <= maxCompletedStep;
          const isCurrent = step === currentStep;
          const isLast = index === WORKFLOW_STEP_LABELS.length - 1;

          return (
            <div
              key={label}
              className={cn("flex flex-1 items-center", isLast && "flex-none")}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    isCurrent
                      ? "bg-primary text-white shadow-sm"
                      : isCompleted
                        ? "bg-primary/15 text-primary"
                        : "bg-gray-100 text-gray-400",
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-center text-[11px] font-semibold tracking-wide sm:block",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-[#1A1A1A]"
                        : "text-gray-400",
                  )}
                >
                  {label}
                </span>
              </div>

              {!isLast ? (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    step < currentStep || step <= maxCompletedStep
                      ? "bg-primary/40"
                      : "bg-gray-200",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
