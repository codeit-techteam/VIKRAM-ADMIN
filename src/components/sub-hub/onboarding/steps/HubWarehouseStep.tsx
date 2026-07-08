"use client";

import { MapPinned, Settings2, Tags } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
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
  HUB_WAREHOUSE_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
} from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import { cn } from "@/lib/utils";

const fieldLabel =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function HubWarehouseStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateWarehouse = useHubDraftStore((s) => s.updateWarehouse);
  const updateBasic = useHubDraftStore((s) => s.updateBasic);
  const warehouseId = useWatch({ control, name: "warehouse.warehouseId" });
  const categories =
    useWatch({ control, name: "warehouse.allowedCategories" }) ?? [];
  const contacts = useWatch({ control, name: "warehouse.contacts" }) ?? [];
  const distanceKm = useWatch({ control, name: "warehouse.distanceKm" });
  const transferTime = useWatch({
    control,
    name: "warehouse.transferTimeMins",
  });
  const priority = useWatch({ control, name: "warehouse.priority" });

  const selectWarehouse = (id: string) => {
    const warehouse = HUB_WAREHOUSE_OPTIONS.find((item) => item.id === id);
    if (!warehouse) return;
    setValue("warehouse.warehouseId", warehouse.id);
    setValue("warehouse.warehouseName", warehouse.name);
    setValue("warehouse.distanceKm", warehouse.distanceKm);
    setValue("warehouse.transferTimeMins", warehouse.transferTimeMins);
    setValue("warehouse.priority", warehouse.priority);
    setValue("warehouse.contacts", [...warehouse.contacts]);
    setValue("basic.linkedWarehouseId", warehouse.id);
    setValue("basic.linkedWarehouseName", warehouse.name);
    updateWarehouse({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      distanceKm: warehouse.distanceKm,
      transferTimeMins: warehouse.transferTimeMins,
      priority: warehouse.priority,
      contacts: [...warehouse.contacts],
    });
    updateBasic({
      linkedWarehouseId: warehouse.id,
      linkedWarehouseName: warehouse.name,
    });
  };

  const toggleCategory = (category: string) => {
    const next = categories.includes(category)
      ? categories.filter((item) => item !== category)
      : [...categories, category];
    setValue("warehouse.allowedCategories", next, { shouldValidate: true });
    updateWarehouse({ allowedCategories: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Warehouse Allocation & Sync
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Connect your central distribution nodes to local hubs to automate
          stock replenishment and fleet assignments.
        </p>
      </div>

      <FormSectionCard icon={MapPinned} title="Select Central Warehouse">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={fieldLabel}>Select Central Warehouse</Label>
              <Select
                value={warehouseId}
                onValueChange={(value) => {
                  if (!value) return;
                  selectWarehouse(value);
                }}
              >
                <SelectTrigger className="h-10 w-full max-w-md">
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
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Distance from Hub</p>
                <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">
                  {distanceKm} km
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Est. Transfer Time</p>
                <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">
                  {transferTime} mins
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Priority</p>
                <p className="text-primary mt-1 text-lg font-semibold">
                  {priority} (High)
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-[linear-gradient(160deg,#eef2ff,#fff7ed)] p-4">
            <button
              type="button"
              className="bg-primary absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
            >
              Live Map
            </button>
            <div className="flex h-full min-h-[140px] items-center justify-center">
              <div className="relative size-28">
                <div className="border-primary/30 absolute inset-0 rounded-full border-2 border-dashed" />
                <div className="bg-primary absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div className="absolute top-4 right-6 size-2 rounded-full bg-emerald-500" />
                <div className="absolute bottom-6 left-5 size-2 rounded-full bg-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </FormSectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FormSectionCard icon={Settings2} title="Allocation Rules">
          <div className="space-y-4">
            <Controller
              control={control}
              name="warehouse.autoRestocking"
              render={({ field }) => (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Auto-restocking
                    </p>
                    <p className="text-xs text-gray-500">
                      Replenish at 20% inventory level.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      updateWarehouse({ autoRestocking: checked });
                    }}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="warehouse.emergencyReplenishment"
              render={({ field }) => (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Emergency Replenishment
                    </p>
                    <p className="text-xs text-gray-500">
                      Override rules for stock-outs.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      updateWarehouse({ emergencyReplenishment: checked });
                    }}
                  />
                </div>
              )}
            />
          </div>
        </FormSectionCard>

        <FormSectionCard icon={Tags} title="Allowed Product Categories">
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORY_OPTIONS.map((category) => {
              const active = categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/30 bg-orange-50 text-[#9A3412]"
                      : "hover:border-primary/40 border-dashed border-gray-300 bg-white text-gray-500",
                  )}
                >
                  {active ? `${category} ×` : `+ ${category}`}
                </button>
              );
            })}
          </div>
        </FormSectionCard>
      </div>

      <FormSectionCard icon={MapPinned} title="Warehouse Contacts">
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                    {contact.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.role}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          contact.availability === "on-duty"
                            ? "bg-emerald-500"
                            : "bg-gray-300",
                        )}
                      />
                      {contact.availability === "on-duty"
                        ? "On-Duty"
                        : "Off-Duty"}
                    </span>
                  </td>
                  <td className="text-primary px-4 py-3 font-medium">
                    Call / Chat
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSectionCard>
    </div>
  );
}
