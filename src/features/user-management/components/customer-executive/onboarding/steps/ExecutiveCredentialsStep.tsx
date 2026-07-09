"use client";

import { KeyRound, Lock, Mail, RefreshCw, User } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { EmptyState } from "@/components/shared/EmptyState";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import {
  generateExecutivePassword,
  generateExecutiveUsername,
} from "@/mock/executive-onboarding";
import { useExecutiveDraftStore } from "@/store/executive-draft-store";
import { notify } from "@/utils/notify";
import { ExecutiveWizardPreview } from "../ExecutiveWizardPreview";
import { FieldWrapper, StepHeader } from "./ExecutiveBasicInfoStep";

export function ExecutiveCredentialsStep() {
  const { control, setValue } = useFormContext<ExecutiveOnboardingSchema>();
  const patchDraft = useExecutiveDraftStore((s) => s.patchDraft);

  const fullName = useWatch({ control, name: "fullName" });
  const employeeId = useWatch({ control, name: "employeeId" });
  const email = useWatch({ control, name: "email" });
  const credentialsGenerated = useWatch({
    control,
    name: "credentialsGenerated",
  });

  const handleGenerate = () => {
    const nextUsername = generateExecutiveUsername(
      fullName || "executive",
      employeeId,
    );
    const nextPassword = generateExecutivePassword();
    const corporateEmail =
      email || `${nextUsername.toLowerCase()}@buildquick.in`;

    setValue("username", nextUsername);
    setValue("tempPassword", nextPassword);
    setValue("corporateEmail", corporateEmail);
    setValue("credentialsGenerated", true);
    patchDraft({
      username: nextUsername,
      tempPassword: nextPassword,
      corporateEmail,
      credentialsGenerated: true,
    });
    notify.success(
      "Credentials Generated",
      "Username and temporary password have been created.",
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Login Setup"
          subtitle="Step 5 of 7: Generate system credentials for the new customer executive."
          step={5}
        />

        <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
          <Mail className="text-primary mt-0.5 size-5 shrink-0" />
          <p className="text-sm text-[#9A3412]/90">
            A temporary password will be sent to the executive&apos;s corporate
            email upon account creation. User must change password on first
            login.
          </p>
        </div>

        {credentialsGenerated ? (
          <FormSectionCard icon={KeyRound} title="Account Credentials">
            <div className="space-y-5">
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <FieldWrapper label="Username / Corporate ID">
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                      <Input {...field} readOnly className="bg-gray-50 pl-10" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Auto-generated from name and employee ID
                    </p>
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="tempPassword"
                render={({ field }) => (
                  <FieldWrapper label="Temporary Password">
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        {...field}
                        readOnly
                        type="password"
                        className="bg-gray-50 pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      User must change this on first login
                    </p>
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="corporateEmail"
                render={({ field }) => (
                  <FieldWrapper label="Corporate Email">
                    <Input {...field} readOnly className="bg-gray-50" />
                  </FieldWrapper>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ToggleField
                  control={control}
                  name="sendWelcomeEmail"
                  label="Send Welcome Email"
                  patchDraft={patchDraft}
                />
                <ToggleField
                  control={control}
                  name="sendSms"
                  label="Send SMS"
                  patchDraft={patchDraft}
                />
                <ToggleField
                  control={control}
                  name="forcePasswordReset"
                  label="Force Password Reset"
                  patchDraft={patchDraft}
                />
                <ToggleField
                  control={control}
                  name="accountActive"
                  label="Account Active"
                  patchDraft={patchDraft}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleGenerate}
              >
                <RefreshCw className="size-4" />
                Generate Again
              </Button>
            </div>
          </FormSectionCard>
        ) : (
          <EmptyState
            title="Credentials Not Generated"
            description="Click the button below to auto-generate username and temporary password."
            icon={<KeyRound className="size-8" />}
            className="py-16"
          />
        )}

        {!credentialsGenerated && (
          <Button
            type="button"
            className="h-11 gap-2 bg-[#9A3412] px-6 hover:bg-[#7C2D12]"
            onClick={handleGenerate}
          >
            <KeyRound className="size-4" />
            Generate Credentials
          </Button>
        )}
      </div>

      <ExecutiveWizardPreview currentStep={5} variant="credentials" />
    </div>
  );
}

function ToggleField({
  control,
  name,
  label,
  patchDraft,
}: {
  control: ReturnType<
    typeof useFormContext<ExecutiveOnboardingSchema>
  >["control"];
  name: keyof Pick<
    ExecutiveOnboardingSchema,
    "sendWelcomeEmail" | "sendSms" | "forcePasswordReset" | "accountActive"
  >;
  label: string;
  patchDraft: (patch: Partial<ExecutiveOnboardingSchema>) => void;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
          <Label className="text-sm font-medium">{label}</Label>
          <Switch
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              patchDraft({ [name]: checked });
            }}
          />
        </div>
      )}
    />
  );
}
