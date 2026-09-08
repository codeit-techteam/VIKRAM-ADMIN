"use client";

import { Briefcase, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import { BRANCH_OFFICE_OPTIONS } from "@/mock/executive-onboarding";
import {
  hubManagerService,
  type ApiHubOption,
} from "@/services/hubManager.service";
import { useExecutiveDraftStore } from "@/store/executive-draft-store";
import { ExecutiveWizardPreview } from "../ExecutiveWizardPreview";
import { FieldWrapper, StepHeader } from "./ExecutiveBasicInfoStep";
import { notify } from "@/utils/notify";

export function ExecutiveOfficeDetailsStep() {
  const { control } = useFormContext<ExecutiveOnboardingSchema>();
  const patchDraft = useExecutiveDraftStore((s) => s.patchDraft);
  const [hubs, setHubs] = useState<ApiHubOption[]>([]);

  useEffect(() => {
    hubManagerService
      .listHubs()
      .then(setHubs)
      .catch(() => {
        notify.error("Unable to load hubs", "Hub list could not be fetched.");
      });
  }, []);

  const handleReportingHubChange = (hubId: string) => {
    const hub = hubs.find((item) => item.id === hubId);
    if (!hub) return;
    patchDraft({
      reportingHub: hubId,
      reportingHubName: hub.name,
      reportingHubRegion: hub.state,
      reportingHubDepartment: "Customer Operations",
      reportingHubBranch: hub.city,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Office Details"
          subtitle="Step 2 of 7: Define branch, department, and reporting structure."
          step={2}
        />

        <FormSectionCard icon={Briefcase} title="Office Information">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller
              control={control}
              name="executiveType"
              render={({ field }) => (
                <FieldWrapper label="Executive Type">
                  <Input
                    {...field}
                    value="Customer Executive"
                    readOnly
                    className="bg-gray-50"
                  />
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="branchOffice"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Branch Office"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      patchDraft({ branchOffice: val });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select branch office" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCH_OFFICE_OPTIONS.map((opt) => (
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
              name="department"
              render={({ field }) => (
                <FieldWrapper label="Department">
                  <Input
                    {...field}
                    value="Customer Operations"
                    readOnly
                    className="bg-gray-50"
                  />
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="designation"
              render={({ field }) => (
                <FieldWrapper label="Designation">
                  <Input
                    {...field}
                    value="Customer Executive"
                    readOnly
                    className="bg-gray-50"
                  />
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
              name="reportingHub"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Reporting Hub"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      handleReportingHubChange(val);
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select reporting hub" />
                    </SelectTrigger>
                    <SelectContent>
                      {hubs.map((hub) => (
                        <SelectItem key={hub.id} value={hub.id}>
                          {hub.name} · {hub.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />
          </div>
        </FormSectionCard>

        <ReportingHubInfoCard />
      </div>

      <ExecutiveWizardPreview currentStep={2} variant="office" />
    </div>
  );
}

function ReportingHubInfoCard() {
  const reportingHubName = useExecutiveDraftStore(
    (s) => s.draft.reportingHubName,
  );
  const reportingHubRegion = useExecutiveDraftStore(
    (s) => s.draft.reportingHubRegion,
  );
  const reportingHubDepartment = useExecutiveDraftStore(
    (s) => s.draft.reportingHubDepartment,
  );
  const reportingHubBranch = useExecutiveDraftStore(
    (s) => s.draft.reportingHubBranch,
  );

  if (!reportingHubName) return null;

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <InfoItem label="Reporting Hub" value={reportingHubName} />
          <InfoItem label="Region" value={reportingHubRegion} />
          <InfoItem label="Department" value={reportingHubDepartment} />
          <InfoItem label="Branch" value={reportingHubBranch} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-[#1A1A1A]">{value}</p>
    </div>
  );
}
