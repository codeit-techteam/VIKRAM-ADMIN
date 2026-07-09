"use client";

import { Shield } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import type { PermissionTemplate } from "@/features/user-management/types/manager-onboarding.types";
import {
  PERMISSION_MODULES,
  PERMISSION_TEMPLATE_OPTIONS,
  PERMISSION_TEMPLATES,
} from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { notify } from "@/utils/notify";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { FieldWrapper, StepHeader } from "./ManagerBasicInfoStep";

export function ManagerPermissionsStep() {
  const { control, setValue, watch } =
    useFormContext<ManagerOnboardingSchema>();
  const patchDraft = useManagerDraftStore((s) => s.patchDraft);
  const updatePermissions = useManagerDraftStore((s) => s.updatePermissions);

  const permissions = watch("permissions");
  const template = watch("permissionTemplate");

  const applyTemplate = (tpl: PermissionTemplate) => {
    const next = { ...PERMISSION_TEMPLATES[tpl] };
    setValue("permissions", next);
    setValue("permissionTemplate", tpl);
    patchDraft({ permissionTemplate: tpl, permissions: next });
    notify.success("Permissions Updated", `Applied ${tpl} template.`);
  };

  const selectAllRecommended = () => {
    applyTemplate("standard");
  };

  const resetToDefault = () => {
    applyTemplate("standard");
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Permissions Matrix"
          subtitle="Step 4 of 7: Configure access levels. This step is optional — permissions are inherited from role."
          step={4}
        />

        <FormSectionCard icon={Shield} title="Role Templates">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Controller
              control={control}
              name="permissionTemplate"
              render={({ field }) => (
                <div className="min-w-[200px] flex-1">
                  <FieldWrapper label="Auto-Inherit Profile">
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (!val) return;
                        applyTemplate(val as PermissionTemplate);
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERMISSION_TEMPLATE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-10 border-orange-200 text-[#9A3412] hover:bg-orange-50"
              onClick={selectAllRecommended}
            >
              Select All Recommended
            </Button>
            <button
              type="button"
              className="mt-5 text-sm font-medium text-gray-500 underline-offset-2 hover:text-[#1A1A1A] hover:underline"
              onClick={resetToDefault}
            >
              Reset to Default
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-100">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              <span>Module Name</span>
              <span>Access</span>
            </div>
            {PERMISSION_MODULES.map((mod) => (
              <div
                key={mod.key}
                className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-gray-50 px-4 py-3 last:border-0"
              >
                <Label className="text-sm font-medium text-[#1A1A1A]">
                  {mod.label}
                </Label>
                <Checkbox
                  checked={permissions?.[mod.key] ?? false}
                  disabled={template !== "custom"}
                  onCheckedChange={(checked) => {
                    updatePermissions({ [mod.key]: !!checked });
                    setValue(`permissions.${mod.key}`, !!checked);
                    setValue("permissionTemplate", "custom");
                    patchDraft({ permissionTemplate: "custom" });
                  }}
                />
              </div>
            ))}
          </div>
        </FormSectionCard>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-sm text-blue-800">
            Permissions are inherited from the selected role template. You can
            skip this step and edit access later from User Management.
          </p>
        </div>
      </div>

      <ManagerWizardPreview currentStep={4} />
    </div>
  );
}
