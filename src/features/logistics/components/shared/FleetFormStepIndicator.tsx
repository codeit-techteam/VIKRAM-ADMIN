"use client";

import { cn } from "@/lib/utils";

interface FleetFormStepIndicatorProps {
  steps: ReadonlyArray<{ id: number; label: string }>;
  activeStep: number;
  className?: string;
}

export function FleetFormStepIndicator({
  steps,
  activeStep,
  className,
}: FleetFormStepIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-1 overflow-x-auto pb-1", className)}
    >
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isCompleted = step.id < activeStep;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex min-w-0 items-center gap-1.5">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  isActive && "bg-primary text-white",
                  isCompleted && "bg-primary/15 text-primary",
                  !isActive && !isCompleted && "bg-gray-100 text-gray-400",
                )}
              >
                {step.id}
              </div>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  isActive ? "text-primary" : "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-2 h-px w-6 shrink-0",
                  isCompleted ? "bg-primary/40" : "bg-gray-200",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
