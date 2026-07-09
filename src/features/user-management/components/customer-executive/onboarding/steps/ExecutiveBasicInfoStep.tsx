"use client";

import { Camera, User } from "lucide-react";
import { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import { getProgressPercent } from "@/mock/executive-onboarding";
import { useExecutiveDraftStore } from "@/store/executive-draft-store";
import { ExecutiveWizardPreview } from "../ExecutiveWizardPreview";

const fieldLabel =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function ExecutiveBasicInfoStep() {
  const { control, setValue } = useFormContext<ExecutiveOnboardingSchema>();
  const patchDraft = useExecutiveDraftStore((s) => s.patchDraft);

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
          subtitle="Step 1 of 7: Provide essential identifying information for the new customer executive."
          step={1}
        />

        <FormSectionCard icon={User} title="Personal Details">
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 sm:flex-row sm:items-start">
              <Controller
                control={control}
                name="profilePhoto"
                render={({ field }) => (
                  <label className="group relative flex size-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white transition-colors hover:border-orange-300 hover:bg-orange-50/50">
                    {field.value ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={field.value}
                        alt="Profile"
                        className="size-full rounded-xl object-cover"
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
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Profile Photo
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPG, PNG. Max size: 2MB
                </p>
                <label className="text-primary mt-2 inline-block cursor-pointer text-xs font-medium hover:underline">
                  Upload New Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
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
                      placeholder="e.g. Arjun Sharma"
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
                      placeholder="executive@buildquick.in"
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
                  <FieldWrapper label="Date of Birth">
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
                          gender: val as ExecutiveOnboardingSchema["gender"],
                        });
                      }}
                      className="flex gap-4 pt-1"
                    >
                      {(["male", "female", "other"] as const).map((g) => (
                        <div key={g} className="flex items-center gap-2">
                          <RadioGroupItem value={g} id={`exec-gender-${g}`} />
                          <Label
                            htmlFor={`exec-gender-${g}`}
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
          </div>
        </FormSectionCard>
      </div>

      <ExecutiveWizardPreview currentStep={1} />
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
