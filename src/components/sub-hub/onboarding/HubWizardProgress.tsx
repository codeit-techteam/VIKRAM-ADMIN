"use client";

import { Check } from "lucide-react";

import { HUB_WIZARD_STEPS } from "@/mock/hub-onboarding";
import { cn } from "@/lib/utils";

interface HubWizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: "dots" | "bar";
}

export function HubWizardProgress({
  currentStep,
  onStepClick,
  variant = "dots",
}: HubWizardProgressProps) {
  if (variant === "bar") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          {HUB_WIZARD_STEPS.map((step) => {
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                aria-label={`Step ${step.id}`}
                onClick={() => isComplete && onStepClick?.(step.id)}
                disabled={!isComplete}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  isCurrent ? "bg-primary w-8" : "w-3",
                  isComplete && "bg-primary/70",
                  !isComplete && !isCurrent && "bg-gray-200",
                )}
              />
            );
          })}
        </div>
        <p className="text-xs font-medium text-gray-500">
          Step {currentStep} of {HUB_WIZARD_STEPS.length}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex min-w-[760px] items-center">
        {HUB_WIZARD_STEPS.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => isComplete && onStepClick?.(step.id)}
                disabled={!isComplete}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isComplete && "cursor-pointer hover:opacity-80",
                  !isComplete && !isCurrent && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete && "bg-primary text-white",
                    isCurrent &&
                      "text-primary ring-primary bg-orange-50 ring-2",
                    !isComplete && !isCurrent && "bg-gray-100 text-gray-400",
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium xl:inline",
                    isCurrent ? "text-primary" : "text-gray-500",
                  )}
                >
                  {step.shortLabel}
                </span>
              </button>
              {index < HUB_WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    isComplete ? "bg-primary/40" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
