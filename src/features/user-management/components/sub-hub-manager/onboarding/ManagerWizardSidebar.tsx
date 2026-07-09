"use client";

import { Check } from "lucide-react";

import {
  MANAGER_WIZARD_STEPS,
  getProgressPercent,
} from "@/mock/manager-onboarding";
import { cn } from "@/lib/utils";

interface ManagerWizardSidebarProps {
  currentStep: number;
  permissionsSkipped?: boolean;
  onStepClick?: (step: number) => void;
}

export function ManagerWizardSidebar({
  currentStep,
  permissionsSkipped = false,
  onStepClick,
}: ManagerWizardSidebarProps) {
  const progress = getProgressPercent(currentStep);

  return (
    <aside className="w-full shrink-0 lg:w-56 xl:w-64">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:sticky lg:top-4">
        <div className="mb-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Onboarding Wizard v2.4
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="bg-primary h-1.5 flex-1 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-[#9A3412] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#9A3412]">
              {progress}%
            </span>
          </div>
        </div>

        <nav className="space-y-0.5">
          {MANAGER_WIZARD_STEPS.map((step) => {
            const isComplete =
              currentStep > step.id ||
              (step.id === 4 && permissionsSkipped && currentStep > 4);
            const isCurrent = currentStep === step.id;
            const isSkipped = step.id === 4 && permissionsSkipped && !isCurrent;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isComplete && onStepClick?.(step.id)}
                disabled={!isComplete}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isCurrent && "bg-orange-50",
                  isComplete && "cursor-pointer hover:bg-gray-50",
                  !isComplete && !isCurrent && "cursor-default",
                )}
              >
                {isCurrent && (
                  <span className="bg-primary absolute top-1 bottom-1 left-0 w-0.5 rounded-full" />
                )}
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isComplete && "bg-emerald-500 text-white",
                    isCurrent && "text-primary bg-white ring-2 ring-orange-200",
                    isSkipped && "bg-gray-200 text-gray-500",
                    !isComplete &&
                      !isCurrent &&
                      !isSkipped &&
                      "bg-gray-100 text-gray-400",
                  )}
                >
                  {isComplete ? <Check className="size-3.5" /> : step.id}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    isCurrent && "text-primary",
                    isComplete && "text-gray-700",
                    !isComplete && !isCurrent && "text-gray-400",
                  )}
                >
                  {step.shortLabel}
                  {step.optional && (
                    <span className="ml-1 text-[10px] font-normal text-gray-400">
                      (Optional)
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
