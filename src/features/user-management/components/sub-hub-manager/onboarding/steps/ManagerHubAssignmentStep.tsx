"use client";

import { MapPin, Package, Truck, Users } from "lucide-react";
import { useEffect, useRef } from "react";
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
  getCitiesByRegion,
  getHubById,
  getHubsByWarehouse,
  getWarehousesByCity,
  HUB_ASSIGNMENT_DATA,
} from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { notify } from "@/utils/notify";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { FieldWrapper, StepHeader } from "./ManagerBasicInfoStep";

export function ManagerHubAssignmentStep() {
  const { control, setValue } = useFormContext<ManagerOnboardingSchema>();
  const patchDraft = useManagerDraftStore((s) => s.patchDraft);

  const region = useWatch({ control, name: "region" });
  const city = useWatch({ control, name: "city" });
  const warehouse = useWatch({ control, name: "warehouse" });
  const hub = useWatch({ control, name: "hub" });

  const cities = region ? getCitiesByRegion(region) : [];
  const warehouses = city ? getWarehousesByCity(city) : [];
  const hubs = warehouse ? getHubsByWarehouse(warehouse) : [];
  const selectedHub = hub ? getHubById(hub) : null;
  const prevHubRef = useRef<string>("");

  useEffect(() => {
    if (!hub) return;
    const hubData = getHubById(hub);
    if (!hubData) return;
    setValue("hubName", hubData.name);
    setValue("hubCode", hubData.code ?? "");
    patchDraft({
      hubName: hubData.name,
      hubCode: hubData.code ?? "",
    });
    if (prevHubRef.current && prevHubRef.current !== hub) {
      notify.success("Hub Assigned", `${hubData.name} has been selected.`);
    }
    prevHubRef.current = hub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hub]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="Regional Assignment"
          subtitle="Step 3 of 7: Define operational boundaries and primary hub attachment."
          step={3}
        />

        <FormSectionCard icon={MapPin} title="Hub Assignment">
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
                      {HUB_ASSIGNMENT_DATA.regions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
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
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
                      setValue("hub", "");
                      setValue("hubName", "");
                      setValue("hubCode", "");
                      patchDraft({
                        warehouse: val,
                        hub: "",
                        hubName: "",
                        hubCode: "",
                      });
                    }}
                    disabled={!city}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="hub"
              render={({ field, fieldState }) => (
                <FieldWrapper
                  label="Assign Sub Hub"
                  required
                  error={fieldState.error?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (!val) return;
                      field.onChange(val);
                      patchDraft({ hub: val });
                    }}
                    disabled={!warehouse}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select hub" />
                    </SelectTrigger>
                    <SelectContent>
                      {hubs.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              )}
            />
          </div>
        </FormSectionCard>

        {selectedHub ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <HubStat
                icon={MapPin}
                label="Hub Code"
                value={selectedHub.code ?? "—"}
              />
              <HubStat
                icon={Users}
                label="Current Manager"
                value={selectedHub.currentManager ?? "Vacant"}
              />
              <HubStat
                icon={Package}
                label="Capacity"
                value={selectedHub.capacity ?? "—"}
              />
              <HubStat
                icon={MapPin}
                label="Coverage"
                value={selectedHub.coverageRadius ?? "—"}
              />
              <HubStat
                icon={Package}
                label="Inventory"
                value={selectedHub.currentInventory ?? "—"}
              />
              <HubStat
                icon={Truck}
                label="Pending Dispatches"
                value={String(selectedHub.pendingDispatches ?? 0)}
              />
              <HubStat
                icon={Package}
                label="Pending Requisitions"
                value={String(selectedHub.pendingRequisitions ?? 0)}
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
                    {selectedHub.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedHub.coverageRadius} radius
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No Hub Selected"
            description="Select a region, city, warehouse, and hub to view hub information."
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
