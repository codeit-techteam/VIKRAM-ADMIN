"use client";

import { Briefcase, Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import {
  DEPARTMENT_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  getReportingManagerById,
  REPORTING_MANAGERS,
} from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { FieldWrapper, StepHeader, fieldLabel } from "./ManagerBasicInfoStep";

export function ManagerEmploymentStep() {
  const { control } = useFormContext<ManagerOnboardingSchema>();
  const patchDraft = useManagerDraftStore((s) => s.patchDraft);

  const reportingOptions = REPORTING_MANAGERS.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.employeeId})`,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Employment Details"
          subtitle="Step 2 of 7: Define role, department, and reporting structure."
          step={2}
        />

        <FormSectionCard icon={Briefcase} title="Employment Information">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller
              control={control}
              name="employeeType"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Employee Type"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      patchDraft({ employeeType: val });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select Manager Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="joiningDate"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Joining Date"
                  required
                  error={fieldState.error?.message}
                >
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => {
                      const val = date?.toISOString().split("T")[0] ?? "";
                      field.onChange(val);
                      patchDraft({ joiningDate: val });
                    }}
                    placeholder="Select joining date"
                  />
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="department"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Department"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      patchDraft({ department: val });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="reportingManager"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Reporting Manager"
                  required
                  error={fieldState.error?.message}
                >
                  <Combobox
                    options={reportingOptions}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      const manager = getReportingManagerById(val);
                      patchDraft({
                        reportingManager: val,
                        reportingManagerName: manager?.name ?? "",
                      });
                    }}
                    placeholder="Search by name or ID..."
                    searchPlaceholder="Search managers..."
                    emptyText="No manager found."
                  />
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="employmentStatus"
              render={({ field }) => (
                <FieldWrapper label="Employment Status">
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      patchDraft({
                        employmentStatus:
                          val as ManagerOnboardingSchema["employmentStatus"],
                      });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />
          </div>
        </FormSectionCard>

        <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
          <Info className="text-primary mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#9A3412]">
              Role-Based Access Control
            </p>
            <p className="mt-1 text-sm text-[#9A3412]/80">
              Selecting the Manager Role will automatically populate default
              permission sets in Step 4. Permissions can be edited later from
              User Management.
            </p>
          </div>
        </div>
      </div>

      <ManagerWizardPreview currentStep={2} />
    </div>
  );
}
