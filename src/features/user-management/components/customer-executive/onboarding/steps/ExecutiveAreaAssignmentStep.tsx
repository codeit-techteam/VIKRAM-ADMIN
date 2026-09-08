"use client";

import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { EmptyState } from "@/components/shared/EmptyState";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import { estimateCoverage } from "@/mock/executive-onboarding";
import {
  hubManagerService,
  type ApiHubOption,
} from "@/services/hubManager.service";
import { useExecutiveDraftStore } from "@/store/executive-draft-store";
import { notify } from "@/utils/notify";
import { ExecutiveWizardPreview } from "../ExecutiveWizardPreview";
import { FieldWrapper, StepHeader } from "./ExecutiveBasicInfoStep";
import { cn } from "@/lib/utils";

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function ExecutiveAreaAssignmentStep() {
  const { control, setValue } = useFormContext<ExecutiveOnboardingSchema>();
  const patchDraft = useExecutiveDraftStore((s) => s.patchDraft);
  const [apiHubs, setApiHubs] = useState<ApiHubOption[]>([]);

  const state = useWatch({ control, name: "state" });
  const city = useWatch({ control, name: "city" });
  const assignedHubs = useWatch({ control, name: "assignedHubs" }) ?? [];

  const states = useMemo(
    () => uniqueSorted(apiHubs.map((hub) => hub.state)),
    [apiHubs],
  );
  const cities = useMemo(
    () =>
      uniqueSorted(
        apiHubs
          .filter((hub) => !state || hub.state === state)
          .map((hub) => hub.city),
      ),
    [apiHubs, state],
  );
  const hubs = useMemo(
    () =>
      apiHubs.filter((hub) => {
        if (state && hub.state !== state) return false;
        if (city && hub.city !== city) return false;
        return true;
      }),
    [apiHubs, state, city],
  );

  useEffect(() => {
    hubManagerService
      .listHubs()
      .then(setApiHubs)
      .catch(() => {
        notify.error("Unable to load hubs", "Hub list could not be fetched.");
      });
  }, []);

  useEffect(() => {
    if (assignedHubs.length > 0) {
      const estimates = estimateCoverage(assignedHubs.length);
      setValue("estimatedCustomers", estimates.estimatedCustomers);
      setValue("estimatedDailyOrders", estimates.estimatedDailyOrders);
      patchDraft(estimates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedHubs.length]);

  const toggleHub = (hub: ApiHubOption) => {
    const current = assignedHubs ?? [];
    const isSelected = current.includes(hub.id);
    const next = isSelected
      ? current.filter((id) => id !== hub.id)
      : [...current, hub.id];

    const names = apiHubs
      .filter((item) => next.includes(item.id))
      .map((item) => item.name);
    const estimates = estimateCoverage(next.length);

    setValue("assignedHubs", next);
    setValue("assignedHubNames", names);
    setValue("estimatedCustomers", estimates.estimatedCustomers);
    setValue("estimatedDailyOrders", estimates.estimatedDailyOrders);
    if (hub.state) setValue("state", hub.state);
    if (hub.city) {
      setValue("city", hub.city);
      setValue("zone", hub.city);
    }
    patchDraft({
      assignedHubs: next,
      assignedHubNames: names,
      state: hub.state,
      city: hub.city,
      zone: hub.city,
      ...estimates,
    });

    if (!isSelected) {
      notify.success("Area Assigned", `${hub.name} added to coverage.`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Assign Operational Area"
          subtitle="Step 3 of 7: Define the geographical jurisdiction and warehouse nodes for the customer executive."
          step={3}
        />

        <FormSectionCard icon={MapPin} title="Territory Scope">
          <div className="space-y-5">
            <Controller
              control={control}
              name="state"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="State"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      setValue("city", "");
                      setValue("zone", "");
                      setValue("assignedHubs", []);
                      setValue("assignedHubNames", []);
                      patchDraft({
                        state: val,
                        city: "",
                        zone: "",
                        assignedHubs: [],
                        assignedHubNames: [],
                      });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="City"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    disabled={!state}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      setValue("zone", val);
                      setValue("assignedHubs", []);
                      setValue("assignedHubNames", []);
                      patchDraft({
                        city: val,
                        zone: val,
                        assignedHubs: [],
                        assignedHubNames: [],
                      });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />

            {city ? (
              <div className="space-y-3">
                <Label className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Warehouse / Hub Assignment
                </Label>
                {hubs.length > 0 ? (
                  <div className="space-y-2 rounded-xl border border-gray-100 p-2">
                    {hubs.map((hub) => {
                      const isChecked = assignedHubs.includes(hub.id);
                      return (
                        <label
                          key={hub.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                            isChecked
                              ? "border-orange-200 bg-orange-50/50"
                              : "border-transparent hover:bg-gray-50",
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleHub(hub)}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              {hub.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {hub.city}, {hub.state}
                              {hub.code ? ` · ${hub.code}` : ""}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No Hub Selected"
                    description="No hubs available for this city."
                    icon={<MapPin className="size-8" />}
                    className="py-8"
                  />
                )}
              </div>
            ) : (
              <EmptyState
                title="No Hub Selected"
                description="Select state and city to view available hubs."
                icon={<MapPin className="size-8" />}
                className="py-8"
              />
            )}
          </div>
        </FormSectionCard>

        {assignedHubs.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-blue-800">
            Zone Load Balance: Assigning {assignedHubs.length} hub
            {assignedHubs.length > 1 ? "s" : ""} in {city || "this city"} is
            within the recommended capacity.
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 xl:w-72">
        <div className="space-y-4 xl:sticky xl:top-4">
          <ExecutiveWizardPreview currentStep={3} variant="area" />

          {assignedHubs.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Coverage Card
              </p>
              <div className="space-y-2 text-sm">
                <CoverageRow label="State" value={state || "—"} />
                <CoverageRow label="City" value={city || "—"} />
                <CoverageRow
                  label="Assigned Hubs"
                  value={String(assignedHubs.length)}
                />
                <CoverageRow
                  label="Est. Customers"
                  value={String(
                    estimateCoverage(assignedHubs.length).estimatedCustomers,
                  )}
                />
                <CoverageRow
                  label="Est. Daily Orders"
                  value={String(
                    estimateCoverage(assignedHubs.length).estimatedDailyOrders,
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function CoverageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-[#1A1A1A]">{value}</span>
    </div>
  );
}
