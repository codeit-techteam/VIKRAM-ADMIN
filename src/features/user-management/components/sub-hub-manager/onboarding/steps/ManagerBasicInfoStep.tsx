"use client";

import { Camera, User } from "lucide-react";
import { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import { getProgressPercent } from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { cn } from "@/lib/utils";

const fieldLabel =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function ManagerBasicInfoStep() {
  const { control, setValue } = useFormContext<ManagerOnboardingSchema>();
  const patchDraft = useManagerDraftStore((s) => s.patchDraft);

  const handlePhotoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setValue("profilePhoto", url);
        patchDraft({ profilePhoto: url });
      };
      reader.readAsDataURL(file);
    },
    [setValue, patchDraft],
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Basic Information"
          subtitle="Step 1 of 7: Provide the essential identifying information for the new manager."
          step={1}
        />

        <FormSectionCard icon={User} title="Personal Details">
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <Controller
                control={control}
                name="profilePhoto"
                render={({ field }) => (
                  <label className="group relative flex size-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-orange-300 hover:bg-orange-50/50">
                    {field.value ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={field.value}
                        alt="Profile"
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera className="size-6 text-gray-400 group-hover:text-[#9A3412]" />
                        <span className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">
                          Upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="sr-only"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              />
              <p className="text-xs text-gray-500">
                400×400px JPG or PNG, max 2MB
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    label="Full Name"
                    required
                    error={fieldState.error?.message}
                  >
                    <Input
                      {...field}
                      placeholder="e.g. Arjun Vardhan"
                      onChange={(e) => {
                        field.onChange(e);
                        patchDraft({ fullName: e.target.value });
                      }}
                    />
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <FieldWrapper label="Employee ID">
                    <Input {...field} readOnly className="bg-gray-50" />
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    label="Mobile Number"
                    required
                    error={fieldState.error?.message}
                  >
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                        +91
                      </span>
                      <Input
                        {...field}
                        className="rounded-l-none"
                        placeholder="9876543210"
                        maxLength={10}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          field.onChange(val);
                          patchDraft({ phone: val });
                        }}
                      />
                    </div>
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <FieldWrapper
                    label="Email Address"
                    required
                    error={fieldState.error?.message}
                  >
                    <Input
                      {...field}
                      type="email"
                      placeholder="manager@buildquick.in"
                      onChange={(e) => {
                        field.onChange(e);
                        patchDraft({ email: e.target.value });
                      }}
                    />
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="dob"
                render={({ field }) => (
                  <FieldWrapper label="DOB">
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        const val = date?.toISOString().split("T")[0] ?? "";
                        field.onChange(val);
                        patchDraft({ dob: val });
                      }}
                      placeholder="dd/mm/yyyy"
                    />
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <FieldWrapper label="Gender">
                    <RadioGroup
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        patchDraft({
                          gender: val as ManagerOnboardingSchema["gender"],
                        });
                      }}
                      className="flex gap-4 pt-1"
                    >
                      {(["male", "female", "other"] as const).map((g) => (
                        <div key={g} className="flex items-center gap-2">
                          <RadioGroupItem value={g} id={`gender-${g}`} />
                          <Label
                            htmlFor={`gender-${g}`}
                            className="cursor-pointer text-sm font-normal capitalize"
                          >
                            {g}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FieldWrapper>
                )}
              />
            </div>

            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <FieldWrapper label="Full Residential Address">
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Enter complete residential address"
                    onChange={(e) => {
                      field.onChange(e);
                      patchDraft({ address: e.target.value });
                    }}
                  />
                </FieldWrapper>
              )}
            />
          </div>
        </FormSectionCard>
      </div>

      <ManagerWizardPreview currentStep={1} />
    </div>
  );
}

function StepHeader({
  title,
  subtitle,
  step,
}: {
  title: string;
  subtitle: string;
  step: number;
}) {
  const progress = getProgressPercent(step);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{title}</h1>
        <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
      </div>
      <span className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-[#9A3412]">
        {progress}% Complete
      </span>
    </div>
  );
}

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className={fieldLabel}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

export { StepHeader, FieldWrapper, fieldLabel };
