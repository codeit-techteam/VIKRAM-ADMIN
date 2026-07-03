"use client";

import { Warehouse } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

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
import { WAREHOUSE_OPTIONS } from "@/mock/materials";
import type { MaterialFormSchema } from "@/schema/material-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

const INVENTORY_TRACKING_OPTIONS = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

export function WarehouseSettings() {
  const { control } = useFormContext<MaterialFormSchema>();

  return (
    <FormSectionCard icon={Warehouse} title="Warehouse Settings">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="warehouse"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Warehouse *</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!fieldState.error}>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="defaultLocation"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Default Location</Label>
                <Input {...field} placeholder="e.g. Zone A - Bulk Storage" />
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Controller
            control={control}
            name="rackNumber"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Rack Number</Label>
                <Input {...field} placeholder="e.g. R-12" />
              </div>
            )}
          />

          <Controller
            control={control}
            name="binNumber"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Bin Number</Label>
                <Input {...field} placeholder="e.g. B-04" />
              </div>
            )}
          />

          <Controller
            control={control}
            name="shelfNumber"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Shelf Number</Label>
                <Input {...field} placeholder="e.g. S-02" />
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Controller
            control={control}
            name="openingStock"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Opening Stock *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                  aria-invalid={!!fieldState.error}
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
            name="warehouseMinimumStock"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Minimum Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="warehouseMaximumStock"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Maximum Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="reorderLevel"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Reorder Level</Label>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </div>
            )}
          />
        </div>

        <Controller
          control={control}
          name="lowStockAlert"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Low Stock Alert
                </p>
                <p className="text-xs text-gray-400">
                  Notify warehouse team when stock falls below reorder level.
                </p>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="allowInventoryTracking"
          render={({ field }) => (
            <div className="space-y-3">
              <Label className={fieldLabelClassName}>
                Allow Inventory Tracking
              </Label>
              <PillRadioGroup
                options={INVENTORY_TRACKING_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                name="inventory-tracking"
              />
            </div>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
