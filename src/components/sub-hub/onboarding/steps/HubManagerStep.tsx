"use client";

import { KeyRound, UserPlus } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_HUB_MANAGER,
  passwordFromFullName,
  usernameFromFullName,
} from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import { notify } from "@/utils/notify";

const fieldLabel =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function HubManagerStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateManager = useHubDraftStore((s) => s.updateManager);
  const fullName = useWatch({ control, name: "manager.fullName" });
  const credentialsGenerated = useWatch({
    control,
    name: "manager.credentialsGenerated",
  });
  const generatedUsername = useWatch({
    control,
    name: "manager.generatedUsername",
  });
  const generatedPassword = useWatch({
    control,
    name: "manager.generatedPassword",
  });

  const generateCredentials = () => {
    const name = fullName?.trim() || DEFAULT_HUB_MANAGER.fullName;
    const username = usernameFromFullName(name);
    const password = passwordFromFullName(name);
    setValue("manager.mode", "create");
    setValue("manager.employeeId", username);
    setValue("manager.generatedUsername", username);
    setValue("manager.generatedPassword", password);
    setValue("manager.credentialsGenerated", true, { shouldValidate: true });
    setValue("manager.permissions", [
      "orders",
      "inventory",
      "dispatch",
      "drivers",
      "reports",
      "payments",
      "requisitions",
    ]);
    updateManager({
      mode: "create",
      employeeId: username,
      generatedUsername: username,
      generatedPassword: password,
      credentialsGenerated: true,
      permissions: [
        "orders",
        "inventory",
        "dispatch",
        "drivers",
        "reports",
        "payments",
        "requisitions",
      ],
    });
    notify.success(
      "Credentials generated",
      `Username: ${username} · Password: ${password}`,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Assign Operations Manager
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Step 3: Create the Hub Manager who will log into the Hub Panel for
              this hub only.
            </p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm">
            <p className="text-xs text-gray-500">Current Assignment</p>
            <p className="font-semibold text-[#9A3412]">
              Manager: {fullName || "Pending"}
            </p>
          </div>
        </div>

        <FormSectionCard icon={UserPlus} title="Manager Details">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="manager.fullName"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Full Name *</Label>
                    <Input
                      {...field}
                      placeholder="e.g. Rahul Sharma"
                      onChange={(event) => {
                        field.onChange(event);
                        updateManager({ fullName: event.target.value });
                      }}
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="manager.employeeId"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>
                      Employee ID / Username *
                    </Label>
                    <Input
                      {...field}
                      placeholder="rahul.sharma"
                      onChange={(event) => {
                        field.onChange(event);
                        updateManager({
                          employeeId: event.target.value,
                          generatedUsername: event.target.value,
                        });
                        setValue(
                          "manager.generatedUsername",
                          event.target.value,
                        );
                      }}
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="manager.phone"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Mobile Number *</Label>
                    <div className="flex gap-2">
                      <span className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                        +91
                      </span>
                      <Input
                        {...field}
                        placeholder="9876543210"
                        onChange={(event) => {
                          field.onChange(event);
                          updateManager({ phone: event.target.value });
                        }}
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="manager.email"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Corporate Email *</Label>
                    <Input
                      {...field}
                      placeholder="rahul@company.com"
                      onChange={(event) => {
                        field.onChange(event);
                        updateManager({ email: event.target.value });
                      }}
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                className="h-10 gap-2 bg-[#8B4513] hover:bg-[#7A3B10]"
                onClick={generateCredentials}
              >
                <KeyRound className="size-4" />
                Generate Login Credentials
              </Button>
              <Controller
                control={control}
                name="manager.sendWhatsAppWelcome"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        updateManager({ sendWhatsAppWelcome: checked });
                      }}
                    />
                    Send WhatsApp Welcome
                  </label>
                )}
              />
            </div>
            {credentialsGenerated ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm">
                <p className="font-medium text-emerald-700">
                  Login credentials ready for Hub Panel
                </p>
                <p className="mt-1 text-emerald-800">
                  Username:{" "}
                  <span className="font-semibold">
                    {generatedUsername || "—"}
                  </span>
                </p>
                <p className="text-emerald-800">
                  Password:{" "}
                  <span className="font-semibold">
                    {generatedPassword || "—"}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </FormSectionCard>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            Hub Manager Access
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Hub Managers automatically receive full access to their assigned hub
            only. They cannot access Admin Panel or manage another hub.
          </p>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-[#1A1A1A]">
            Manager Guidelines
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              Default manager is prefilled as Rahul Sharma for this phase.
            </li>
            <li>Credentials must be generated before moving to Logistics.</li>
            <li>Hub Panel login uses Employee ID / Username + password.</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-[linear-gradient(160deg,#1f2937,#9a3412)] p-5 text-white shadow-sm">
          <p className="text-xs tracking-wider uppercase opacity-80">
            Progress Tracking
          </p>
          <p className="mt-2 text-3xl font-bold">50%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-1/2 rounded-full bg-white" />
          </div>
        </div>
      </aside>
    </div>
  );
}
