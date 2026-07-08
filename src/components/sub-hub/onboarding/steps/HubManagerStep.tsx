"use client";

import {
  ClipboardList,
  IdCard,
  KeyRound,
  Package,
  ShoppingCart,
  Truck,
  UserPlus,
  Wallet,
  BarChart3,
} from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EXISTING_HUB_MANAGERS,
  MANAGER_PERMISSION_OPTIONS,
} from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import type { ManagerPermission } from "@/types/hub-onboarding.types";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

const fieldLabel =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

const PERMISSION_ICONS = {
  orders: ShoppingCart,
  inventory: Package,
  dispatch: Truck,
  drivers: IdCard,
  reports: BarChart3,
  payments: Wallet,
  requisitions: ClipboardList,
} as const;

export function HubManagerStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateManager = useHubDraftStore((s) => s.updateManager);
  const mode = useWatch({ control, name: "manager.mode" });
  const permissions = useWatch({ control, name: "manager.permissions" }) ?? [];
  const fullName = useWatch({ control, name: "manager.fullName" });
  const credentialsGenerated = useWatch({
    control,
    name: "manager.credentialsGenerated",
  });

  const togglePermission = (permission: ManagerPermission) => {
    const next = permissions.includes(permission)
      ? permissions.filter((item) => item !== permission)
      : [...permissions, permission];
    setValue("manager.permissions", next, { shouldValidate: true });
    updateManager({ permissions: next });
  };

  const applyExistingManager = (id: string) => {
    const manager = EXISTING_HUB_MANAGERS.find((item) => item.id === id);
    if (!manager) return;
    setValue("manager.existingManagerId", id);
    setValue("manager.fullName", manager.fullName);
    setValue("manager.employeeId", manager.employeeId);
    setValue("manager.phone", manager.phone);
    setValue("manager.email", manager.email);
    setValue("manager.credentialsGenerated", true);
    updateManager({
      existingManagerId: id,
      fullName: manager.fullName,
      employeeId: manager.employeeId,
      phone: manager.phone,
      email: manager.email,
      credentialsGenerated: true,
    });
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
              Step 4: Designate the lead responsible for day-to-day hub
              logistics and vendor coordination.
            </p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm">
            <p className="text-xs text-gray-500">Current Assignment</p>
            <p className="font-semibold text-[#9A3412]">
              Manager: {fullName || "Pending"}
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          {(["existing", "create"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setValue("manager.mode", value);
                updateManager({
                  mode: value,
                  credentialsGenerated:
                    value === "existing" ? credentialsGenerated : false,
                });
              }}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                mode === value
                  ? "bg-[#8B4513] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#1A1A1A]",
              )}
            >
              {value === "existing"
                ? "Assign Existing User"
                : "Create New Manager"}
            </button>
          ))}
        </div>

        <FormSectionCard icon={UserPlus} title="Manager Details">
          <div className="space-y-5">
            {mode === "existing" ? (
              <div className="space-y-2">
                <Label className={fieldLabel}>Select Existing Manager</Label>
                <Controller
                  control={control}
                  name="manager.existingManagerId"
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (!value) return;
                          field.onChange(value);
                          applyExistingManager(value);
                        }}
                      >
                        <SelectTrigger className="h-10 w-full max-w-lg">
                          <SelectValue placeholder="Choose manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXISTING_HUB_MANAGERS.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.fullName} · {manager.employeeId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-destructive text-sm">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            ) : null}

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
                      disabled={mode === "existing"}
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
                    <Label className={fieldLabel}>Employee ID *</Label>
                    <Input
                      {...field}
                      placeholder="BW-HUB-000"
                      disabled={mode === "existing"}
                      onChange={(event) => {
                        field.onChange(event);
                        updateManager({ employeeId: event.target.value });
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
                        disabled={mode === "existing"}
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
                      placeholder="rahul@bajriwala.in"
                      disabled={mode === "existing"}
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
                onClick={() => {
                  setValue("manager.credentialsGenerated", true, {
                    shouldValidate: true,
                  });
                  updateManager({ credentialsGenerated: true });
                  notify.success(
                    "Credentials generated",
                    "Temporary login created for the hub manager.",
                  );
                }}
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
              <p className="text-sm font-medium text-emerald-600">
                Login credentials ready
              </p>
            ) : null}
          </div>
        </FormSectionCard>

        <FormSectionCard
          icon={ClipboardList}
          title="Role Permissions"
          headerAction={
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#9A3412]">
              Module Access
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {MANAGER_PERMISSION_OPTIONS.map((option) => {
              const Icon = PERMISSION_ICONS[option.value];
              const active = permissions.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => togglePermission(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors",
                    active
                      ? "border-primary bg-orange-50"
                      : "border-gray-200 bg-white hover:border-gray-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      active ? "text-primary" : "text-gray-400",
                    )}
                  />
                  <span className="text-xs font-medium text-[#1A1A1A]">
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      "size-3 rounded-full border",
                      active
                        ? "border-primary bg-primary"
                        : "border-gray-300 bg-white",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </FormSectionCard>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-[#1A1A1A]">
            Manager Guidelines
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Credentials must be generated before moving to Step 5.</li>
            <li>WhatsApp invitations expire after 48 hours for security.</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-[linear-gradient(160deg,#1f2937,#9a3412)] p-5 text-white shadow-sm">
          <p className="text-xs tracking-wider uppercase opacity-80">
            Progress Tracking
          </p>
          <p className="mt-2 text-3xl font-bold">57%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[57%] rounded-full bg-white" />
          </div>
        </div>
      </aside>
    </div>
  );
}
