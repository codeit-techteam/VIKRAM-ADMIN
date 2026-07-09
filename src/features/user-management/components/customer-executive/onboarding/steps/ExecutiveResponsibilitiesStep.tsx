"use client";

import { KeyRound, Shield } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Switch } from "@/components/ui/switch";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import type { ExecutiveResponsibilities } from "@/features/user-management/types/executive-onboarding.types";
import { RESPONSIBILITY_CARDS } from "@/mock/executive-onboarding";
import { useExecutiveDraftStore } from "@/store/executive-draft-store";
import { notify } from "@/utils/notify";
import { ExecutiveWizardPreview } from "../ExecutiveWizardPreview";
import { StepHeader } from "./ExecutiveBasicInfoStep";
import { cn } from "@/lib/utils";

export function ExecutiveResponsibilitiesStep() {
  const { control, setValue } = useFormContext<ExecutiveOnboardingSchema>();
  const updateResponsibilities = useExecutiveDraftStore(
    (s) => s.updateResponsibilities,
  );

  const responsibilities = useWatch({ control, name: "responsibilities" });

  const toggleResponsibility = (
    key: keyof ExecutiveResponsibilities,
    value: boolean,
  ) => {
    const current = responsibilities ?? {};
    const next = { ...current, [key]: value };
    setValue("responsibilities", next);
    updateResponsibilities({ [key]: value });
    notify.success(
      "Responsibilities Updated",
      `${RESPONSIBILITY_CARDS.find((c) => c.key === key)?.label} ${value ? "enabled" : "disabled"}.`,
    );
  };

  const selectAllRecommended = () => {
    const next: ExecutiveResponsibilities = {
      customerRegistration: true,
      assignCustomer: false,
      takePhoneOrders: true,
      orderFollowUp: false,
      complaintSupport: false,
      orderTracking: true,
    };
    setValue("responsibilities", next);
    updateResponsibilities(next);
    notify.success(
      "Responsibilities Updated",
      "Recommended responsibilities selected.",
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <StepHeader
            title="Customer Executive Responsibilities"
            subtitle="Step 4 of 7: Configure the scope of work. These determine system permissions and daily dashboard activities."
            step={4}
          />
          <button
            type="button"
            className="shrink-0 rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-[#9A3412] hover:bg-orange-50"
            onClick={selectAllRecommended}
          >
            Select All Recommended
          </button>
        </div>

        <FormSectionCard icon={Shield} title="Responsibility Modules">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESPONSIBILITY_CARDS.map((card) => {
              const isOn = responsibilities?.[card.key] ?? card.defaultOn;
              return (
                <div
                  key={card.key}
                  className={cn(
                    "relative rounded-xl border p-4 transition-colors",
                    isOn
                      ? "border-orange-200 bg-orange-50/30"
                      : "border-gray-100 bg-white",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <KeyRound
                      className={cn(
                        "size-5",
                        isOn ? "text-[#9A3412]" : "text-gray-400",
                      )}
                    />
                    <Switch
                      checked={isOn}
                      onCheckedChange={(checked) =>
                        toggleResponsibility(card.key, checked)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {card.label}
                    </p>
                    {card.tag && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                          card.tag === "REQUIRED" && "bg-red-100 text-red-700",
                          card.tag === "CORE ACTION" &&
                            "bg-orange-100 text-orange-700",
                          card.tag === "CRITICAL" &&
                            "bg-gray-200 text-gray-700",
                        )}
                      >
                        {card.tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </FormSectionCard>

        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <Shield className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-800">
            These responsibilities determine what modules are visible to the
            executive. Permissions can be modified later from User Management.
          </p>
        </div>
      </div>

      <ExecutiveWizardPreview currentStep={4} />
    </div>
  );
}
