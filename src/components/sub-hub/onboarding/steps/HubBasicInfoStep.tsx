"use client";

import { Building2, Clock, MapPin, Zap } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
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
import { Textarea } from "@/components/ui/textarea";
import {
  estimateHouseholdReach,
  HUB_CAPACITY_OPTIONS,
  HUB_TYPE_OPTIONS,
  HUB_WAREHOUSE_OPTIONS,
  INDIAN_STATES,
  WEEK_DAYS,
} from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import { cn } from "@/lib/utils";

const fieldLabel =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function HubBasicInfoStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateBasic = useHubDraftStore((s) => s.updateBasic);
  const updateWarehouse = useHubDraftStore((s) => s.updateWarehouse);
  const updateCoverage = useHubDraftStore((s) => s.updateCoverage);

  const state = useWatch({ control, name: "basic.state" });
  const warehouseId = useWatch({ control, name: "basic.linkedWarehouseId" });
  const coverageRadius = useWatch({ control, name: "basic.coverageRadiusKm" });
  const workingDays = useWatch({ control, name: "basic.workingDays" }) ?? [];
  const hubName = useWatch({ control, name: "basic.hubName" });

  useEffect(() => {
    const warehouse = HUB_WAREHOUSE_OPTIONS.find(
      (item) => item.id === warehouseId,
    );
    if (!warehouse) return;
    setValue("basic.linkedWarehouseName", warehouse.name);
    setValue("warehouse.warehouseId", warehouse.id);
    setValue("warehouse.warehouseName", warehouse.name);
    setValue("warehouse.distanceKm", warehouse.distanceKm);
    setValue("warehouse.transferTimeMins", warehouse.transferTimeMins);
    setValue("warehouse.priority", warehouse.priority);
    setValue("warehouse.contacts", [...warehouse.contacts]);
    updateBasic({
      linkedWarehouseId: warehouse.id,
      linkedWarehouseName: warehouse.name,
    });
    updateWarehouse({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      distanceKm: warehouse.distanceKm,
      transferTimeMins: warehouse.transferTimeMins,
      priority: warehouse.priority,
      contacts: [...warehouse.contacts],
    });
  }, [warehouseId, setValue, updateBasic, updateWarehouse]);

  useEffect(() => {
    setValue("coverage.radiusKm", coverageRadius);
    updateCoverage({ radiusKm: coverageRadius });
    updateBasic({ coverageRadiusKm: coverageRadius });
  }, [coverageRadius, setValue, updateBasic, updateCoverage]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Basic Information
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Initialize your logistics hub. This data will be used for route
            calculations and tax reporting.
          </p>
        </div>

        <FormSectionCard icon={Building2} title="Basic Hub Information">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller
              control={control}
              name="basic.hubName"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className={fieldLabel}>Hub Name *</Label>
                  <Input
                    {...field}
                    placeholder="e.g. North Delhi Central"
                    aria-invalid={!!fieldState.error}
                    onChange={(event) => {
                      field.onChange(event);
                      updateBasic({ hubName: event.target.value });
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
              name="basic.hubCode"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabel}>Auto-gen Code</Label>
                  <Input {...field} readOnly className="bg-gray-50" />
                </div>
              )}
            />

            <Controller
              control={control}
              name="basic.hubType"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabel}>Hub Type</Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (!value) return;
                      field.onChange(value);
                      updateBasic({ hubType: value as typeof field.value });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HUB_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <Controller
              control={control}
              name="basic.capacityTier"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabel}>Capacity</Label>
                  <PillRadioGroup
                    options={HUB_CAPACITY_OPTIONS}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      updateBasic({ capacityTier: value });
                    }}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="basic.openingDate"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className={fieldLabel}>Opening Date *</Label>
                  <Input
                    {...field}
                    type="date"
                    aria-invalid={!!fieldState.error}
                    onChange={(event) => {
                      field.onChange(event);
                      updateBasic({ openingDate: event.target.value });
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
              name="basic.isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-orange-50/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Hub Status
                    </p>
                    <p className="text-xs text-gray-500">Active & Receiving</p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      updateBasic({ isActive: checked });
                    }}
                  />
                </div>
              )}
            />
          </div>
        </FormSectionCard>

        <FormSectionCard icon={MapPin} title="Address & Location">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Controller
                control={control}
                name="basic.state"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>State *</Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.onChange(value);
                        updateBasic({ state: value });
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                control={control}
                name="basic.city"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>City *</Label>
                    <Input
                      {...field}
                      placeholder="Enter City"
                      aria-invalid={!!fieldState.error}
                      onChange={(event) => {
                        field.onChange(event);
                        updateBasic({ city: event.target.value });
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
                name="basic.pincode"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Pincode *</Label>
                    <Input
                      {...field}
                      placeholder="110001"
                      aria-invalid={!!fieldState.error}
                      onChange={(event) => {
                        field.onChange(event);
                        updateBasic({ pincode: event.target.value });
                        setValue("coverage.pincodes", [event.target.value]);
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

            <Controller
              control={control}
              name="basic.detailedAddress"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className={fieldLabel}>Detailed Address *</Label>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Building, Street name, Area"
                    aria-invalid={!!fieldState.error}
                    onChange={(event) => {
                      field.onChange(event);
                      updateBasic({ detailedAddress: event.target.value });
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

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
              <Controller
                control={control}
                name="basic.coverageRadiusKm"
                render={({ field }) => (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className={fieldLabel}>Coverage Radius (KM)</Label>
                      <span className="text-primary text-sm font-semibold">
                        {field.value} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={1}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                      className="accent-primary w-full"
                    />
                    <div className="flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-[#9A3412]">
                      <Zap className="mt-0.5 size-4 shrink-0" />
                      Estimated reach: {estimateHouseholdReach(field.value)}.
                    </div>
                  </div>
                )}
              />

              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-[linear-gradient(135deg,#f8fafc_0%,#fff7ed_50%,#f1f5f9_100%)] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Map Preview
                </p>
                <div className="relative mx-auto aspect-square max-w-[180px]">
                  <div className="border-primary/20 absolute inset-2 rounded-full border-2" />
                  <div className="border-primary/40 absolute inset-6 rounded-full border-2" />
                  <div className="border-primary/70 absolute inset-10 rounded-full border-2" />
                  <div className="bg-primary absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" />
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">
                  {state} · {coverageRadius} km radius
                </p>
              </div>
            </div>
          </div>
        </FormSectionCard>

        <FormSectionCard icon={Clock} title="Operational Hours">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="basic.linkedWarehouseId"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Linked Warehouse *</Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HUB_WAREHOUSE_OPTIONS.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="basic.fulfillmentPriority"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Fulfillment Priority</Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.onChange(value);
                        updateBasic({
                          fulfillmentPriority: value as typeof field.value,
                        });
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P1">P1 - High</SelectItem>
                        <SelectItem value="P2">P2 - Medium</SelectItem>
                        <SelectItem value="P3">P3 - Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabel}>Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const active = workingDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? workingDays.filter((item) => item !== day.value)
                          : [...workingDays, day.value];
                        setValue("basic.workingDays", next, {
                          shouldValidate: true,
                        });
                        updateBasic({ workingDays: next });
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "border-primary text-primary bg-orange-50"
                          : "border-gray-200 bg-white text-gray-500",
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="basic.shiftStart"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Shift Start</Label>
                    <Input
                      {...field}
                      type="time"
                      onChange={(event) => {
                        field.onChange(event);
                        updateBasic({ shiftStart: event.target.value });
                      }}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="basic.shiftEnd"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabel}>Shift End</Label>
                    <Input
                      {...field}
                      type="time"
                      onChange={(event) => {
                        field.onChange(event);
                        updateBasic({ shiftEnd: event.target.value });
                      }}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </FormSectionCard>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <Building2 className="text-primary size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                Hub Draft: {hubName || "Untitled"}
              </p>
              <p className="text-xs text-gray-500">
                Created:{" "}
                {new Date().toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Step <span className="font-semibold text-[#1A1A1A]">1 of 7</span>
            </p>
            <p>Last Saved: Auto-saving</p>
            <p>
              Assignee:{" "}
              <span className="font-medium text-[#1A1A1A]">Rohan Sharma</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
            Next Steps
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Upload GST & Trade License
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Define delivery fleet roles
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
