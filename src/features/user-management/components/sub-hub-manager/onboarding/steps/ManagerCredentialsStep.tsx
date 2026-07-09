"use client";

import { KeyRound, Lock, Mail, RefreshCw, User } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { EmptyState } from "@/components/shared/EmptyState";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import {
  generateTemporaryPassword,
  generateUsername,
} from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { notify } from "@/utils/notify";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { FieldWrapper, StepHeader } from "./ManagerBasicInfoStep";

export function ManagerCredentialsStep() {
  const { control, setValue } = useFormContext<ManagerOnboardingSchema>();
  const patchDraft = useManagerDraftStore((s) => s.patchDraft);

  const fullName = useWatch({ control, name: "fullName" });
  const employeeId = useWatch({ control, name: "employeeId" });
  const credentialsGenerated = useWatch({
    control,
    name: "credentialsGenerated",
  });

  const handleGenerate = () => {
    const nextUsername = generateUsername(fullName || "manager", employeeId);
    const nextPassword = generateTemporaryPassword();
    setValue("username", nextUsername);
    setValue("temporaryPassword", nextPassword);
    setValue("credentialsGenerated", true);
    patchDraft({
      username: nextUsername,
      temporaryPassword: nextPassword,
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
          title="Security & Access Configuration"
          subtitle="Step 5 of 7: Generate login credentials for the new manager."
          step={5}
        />

        <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
          <Mail className="text-primary mt-0.5 size-5 shrink-0" />
          <p className="text-sm text-[#9A3412]/90">
            A temporary password will be sent to the manager&apos;s corporate
            email upon account creation.
          </p>
        </div>

        {credentialsGenerated ? (
          <FormSectionCard icon={KeyRound} title="Login Credentials">
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
                      Must be unique across the system
                    </p>
                  </FieldWrapper>
                )}
              />

              <Controller
                control={control}
                name="temporaryPassword"
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
                      Encrypted delivery via email & SMS
                    </p>
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

      <ManagerWizardPreview currentStep={5} variant="credentials" />
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
    typeof useFormContext<ManagerOnboardingSchema>
  >["control"];
  name: keyof Pick<
    ManagerOnboardingSchema,
    "sendWelcomeEmail" | "sendSms" | "forcePasswordReset" | "accountActive"
  >;
  label: string;
  patchDraft: (patch: Partial<ManagerOnboardingSchema>) => void;
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
