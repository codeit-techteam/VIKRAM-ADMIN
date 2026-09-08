"use client";

import { MapPin, Package, Truck, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { EmptyState } from "@/components/shared/EmptyState";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import {
  hubManagerService,
  type ApiHubOption,
} from "@/services/hubManager.service";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { notify } from "@/utils/notify";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { FieldWrapper, StepHeader } from "./ManagerBasicInfoStep";

export function ManagerHubAssignmentStep() {
  const { control, setValue } = useFormContext<ManagerOnboardingSchema>();
  const patchDraft = useManagerDraftStore((s) => s.patchDraft);
  const [apiHubs, setApiHubs] = useState<ApiHubOption[]>([]);

  const region = useWatch({ control, name: "region" });
  const city = useWatch({ control, name: "city" });
  const hub = useWatch({ control, name: "hub" });

  const regions = [
    ...new Set(apiHubs.map((item) => item.state).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
  const cities = [
    ...new Set(
      apiHubs
        .filter((item) => !region || item.state === region)
        .map((item) => item.city)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const warehouses = [
    ...new Set(
      apiHubs
        .filter((item) => {
          if (region && item.state !== region) return false;
          if (city && item.city !== city) return false;
          return true;
        })
        .map((item) => item.name),
    ),
  ];
  const visibleHubs = apiHubs.filter((item) => {
    if (region && item.state !== region) return false;
    if (city && item.city !== city) return false;
    return true;
  });
  const selectedApiHub = apiHubs.find((item) => item.id === hub) ?? null;
  const prevHubRef = useRef<string>("");

  useEffect(() => {
    hubManagerService
      .listHubs()
      .then(setApiHubs)
      .catch(() => {
        notify.error("Unable to load hubs", "Hub list could not be fetched.");
      });
  }, []);

  useEffect(() => {
    if (!hub) return;

    const apiHub = apiHubs.find((item) => item.id === hub);
    if (!apiHub) return;
    setValue("hubName", apiHub.name);
    setValue("hubCode", apiHub.code);
    setValue("region", apiHub.state);
    setValue("city", apiHub.city);
    setValue("warehouse", apiHub.name);
    patchDraft({
      hubName: apiHub.name,
      hubCode: apiHub.code,
      region: apiHub.state,
      city: apiHub.city,
      warehouse: apiHub.name,
    });
    if (prevHubRef.current && prevHubRef.current !== hub) {
      notify.success("Hub Assigned", `${apiHub.name} has been selected.`);
    }
    prevHubRef.current = hub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hub, apiHubs]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Regional Assignment"
          subtitle="Step 3 of 7: Define operational boundaries and primary hub attachment."
          step={3}
        />

        <FormSectionCard icon={MapPin} title="Hub Assignment">
          <div className="mb-5 space-y-1.5">
            <FieldWrapper label="Assigned Hub" required>
              <Controller
                control={control}
                name="hub"
                render={({ field, fieldState }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      patchDraft({ hub: val });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select assigned hub" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleHubs.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} · {item.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    {fieldState.error?.message ? (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </Select>
                )}
              />
            </FieldWrapper>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Controller
              control={control}
              name="region"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Assign Region"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      setValue("city", "");
                      setValue("warehouse", "");
                      setValue("hub", "");
                      setValue("hubName", "");
                      setValue("hubCode", "");
                      patchDraft({
                        region: val,
                        city: "",
                        warehouse: "",
                        hub: "",
                        hubName: "",
                        hubCode: "",
                      });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((item) => (
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
                  label="Assign City"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      setValue("warehouse", "");
                      setValue("hub", "");
                      setValue("hubName", "");
                      setValue("hubCode", "");
                      patchDraft({
                        city: val,
                        warehouse: "",
                        hub: "",
                        hubName: "",
                        hubCode: "",
                      });
                    }}
                    disabled={!region}
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

            <Controller
              control={control}
              name="warehouse"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Assign Warehouse"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      const match = apiHubs.find((item) => item.name === val);
                      if (match) {
                        setValue("hub", match.id);
                        setValue("hubName", match.name);
                        setValue("hubCode", match.code);
                        patchDraft({
                          warehouse: val,
                          hub: match.id,
                          hubName: match.name,
                          hubCode: match.code,
                        });
                        return;
                      }
                      patchDraft({ warehouse: val });
                    }}
                    disabled={!city}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />
          </div>
        </FormSectionCard>

        {selectedApiHub ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <HubStat
                icon={MapPin}
                label="Hub Code"
                value={selectedApiHub.code || "Not available"}
              />
              <HubStat
                icon={Users}
                label="City"
                value={selectedApiHub.city || "Not available"}
              />
              <HubStat
                icon={Package}
                label="State"
                value={selectedApiHub.state || "Not available"}
              />
              <HubStat
                icon={MapPin}
                label="Pincode"
                value={selectedApiHub.pincode || "Not available"}
              />
              <HubStat
                icon={Package}
                label="Phone"
                value={selectedApiHub.phone || "Not available"}
              />
              <HubStat
                icon={Truck}
                label="Hub"
                value={selectedApiHub.name}
              />
            </div>

            <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-orange-50/50 to-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  Coverage Visualization
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700">
                    LIVE HUB
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-700">
                    OPERATIONAL
                  </Badge>
                </div>
              </div>
              <div className="relative flex h-48 items-center justify-center rounded-lg border border-dashed border-orange-200 bg-white/80">
                <div className="absolute size-32 rounded-full border-2 border-orange-300/60 bg-orange-100/30" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-primary flex size-10 items-center justify-center rounded-full shadow-md">
                    <MapPin className="size-5 text-white" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#1A1A1A]">
                    {selectedApiHub.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedApiHub.city}, {selectedApiHub.state}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No Hub Selected"
            description="Select an assigned hub to view location details."
            icon={<MapPin className="size-8" />}
          />
        )}
      </div>

      <ManagerWizardPreview currentStep={3} variant="hub" />
    </div>
  );
}

function HubStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="size-3.5 text-gray-400" />
        <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">{value}</p>
    </div>
  );
}
