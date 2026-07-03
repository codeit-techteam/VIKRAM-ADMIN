"use client";

import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { SkuTable } from "@/components/inventory/material/SkuTable";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmptySku, EXAMPLE_SKUS } from "@/mock/materials";
import { MATERIAL_UNITS } from "@/mock/units";
import type { MaterialFormSchema } from "@/schema/material-form.schema";
import type { MaterialSku } from "@/types/material.types";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

const SKU_STATUS_OPTIONS = [
  { value: "active" as const, label: "Active" },
  { value: "inactive" as const, label: "Inactive" },
];

function SkuFormFields({
  sku,
  onChange,
  errors,
}: {
  sku: MaterialSku;
  onChange: (sku: MaterialSku) => void;
  errors?: Partial<Record<keyof MaterialSku, string>>;
}) {
  const update = <K extends keyof MaterialSku>(key: K, value: MaterialSku[K]) =>
    onChange({ ...sku, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label className={fieldLabelClassName}>SKU Code *</Label>
        <Input
          value={sku.skuCode}
          onChange={(event) => update("skuCode", event.target.value)}
          placeholder="e.g. ULT-CEM-50"
          aria-invalid={!!errors?.skuCode}
        />
        {errors?.skuCode && (
          <p className="text-destructive text-sm">{errors.skuCode}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>SKU Name *</Label>
        <Input
          value={sku.skuName}
          onChange={(event) => update("skuName", event.target.value)}
          placeholder="e.g. UltraTech Cement"
          aria-invalid={!!errors?.skuName}
        />
        {errors?.skuName && (
          <p className="text-destructive text-sm">{errors.skuName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Variant</Label>
        <Input
          value={sku.variant}
          onChange={(event) => update("variant", event.target.value)}
          placeholder="e.g. 50 Bags"
        />
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Size</Label>
        <Input
          value={sku.size}
          onChange={(event) => update("size", event.target.value)}
          placeholder="e.g. 50kg bag"
        />
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Unit *</Label>
        <Select
          value={sku.unit}
          onValueChange={(value) => {
            if (value) update("unit", value);
          }}
        >
          <SelectTrigger aria-invalid={!!errors?.unit}>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {MATERIAL_UNITS.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.unit && (
          <p className="text-destructive text-sm">{errors.unit}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Barcode</Label>
        <Input
          value={sku.barcode}
          onChange={(event) => update("barcode", event.target.value)}
          placeholder="EAN / UPC"
        />
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Minimum Stock</Label>
        <Input
          type="number"
          min={0}
          value={sku.minimumStock}
          onChange={(event) =>
            update("minimumStock", Number(event.target.value) || 0)
          }
        />
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Maximum Stock</Label>
        <Input
          type="number"
          min={0}
          value={sku.maximumStock}
          onChange={(event) =>
            update("maximumStock", Number(event.target.value) || 0)
          }
        />
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Weight</Label>
        <Input
          value={sku.weight}
          onChange={(event) => update("weight", event.target.value)}
          placeholder="e.g. 50 kg"
        />
      </div>

      <div className="space-y-2">
        <Label className={fieldLabelClassName}>Dimensions</Label>
        <Input
          value={sku.dimensions}
          onChange={(event) => update("dimensions", event.target.value)}
          placeholder="L × W × H"
        />
      </div>

      <div className="space-y-3 sm:col-span-2 lg:col-span-3">
        <Label className={fieldLabelClassName}>Status</Label>
        <PillRadioGroup
          options={SKU_STATUS_OPTIONS}
          value={sku.status}
          onChange={(value) => update("status", value)}
          name={`sku-status-${sku.id}`}
        />
      </div>
    </div>
  );
}

function validateSkuDraft(
  sku: MaterialSku,
): Partial<Record<keyof MaterialSku, string>> {
  const errors: Partial<Record<keyof MaterialSku, string>> = {};
  if (!sku.skuCode.trim()) errors.skuCode = "SKU code is required";
  if (!sku.skuName.trim()) errors.skuName = "SKU name is required";
  if (!sku.unit) errors.unit = "Unit is required";
  return errors;
}

export function MaterialSkuManager() {
  const { control, setValue, watch } = useFormContext<MaterialFormSchema>();
  const skus = watch("skus");
  const [draftSku, setDraftSku] = useState<MaterialSku>(createEmptySku());
  const [draftErrors, setDraftErrors] = useState<
    Partial<Record<keyof MaterialSku, string>>
  >({});
  const [editingSku, setEditingSku] = useState<MaterialSku | null>(null);
  const [editErrors, setEditErrors] = useState<
    Partial<Record<keyof MaterialSku, string>>
  >({});

  const addSku = () => {
    const errors = validateSkuDraft(draftSku);
    if (Object.keys(errors).length > 0) {
      setDraftErrors(errors);
      return;
    }

    setValue("skus", [...skus, draftSku], { shouldDirty: true });
    setDraftSku(createEmptySku());
    setDraftErrors({});
  };

  const loadExample = (index: number) => {
    const example = EXAMPLE_SKUS[index];
    if (!example) return;

    setDraftSku({
      ...createEmptySku(),
      skuCode: example.skuCode,
      skuName: example.skuName,
      variant: example.variant,
      unit: example.unit,
    });
    setDraftErrors({});
  };

  const handleDelete = (id: string) => {
    setValue(
      "skus",
      skus.filter((sku) => sku.id !== id),
      { shouldDirty: true },
    );
  };

  const handleDuplicate = (sku: MaterialSku) => {
    const duplicate: MaterialSku = {
      ...sku,
      id: crypto.randomUUID(),
      skuCode: `${sku.skuCode}-COPY`,
    };
    setValue("skus", [...skus, duplicate], { shouldDirty: true });
  };

  const saveEdit = () => {
    if (!editingSku) return;
    const errors = validateSkuDraft(editingSku);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setValue(
      "skus",
      skus.map((sku) => (sku.id === editingSku.id ? editingSku : sku)),
      { shouldDirty: true },
    );
    setEditingSku(null);
    setEditErrors({});
  };

  return (
    <>
      <FormSectionCard
        icon={Layers}
        title="SKU & Variant Management"
        headerAction={
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SKUS.map((example, index) => (
              <Button
                key={example.skuCode}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadExample(index)}
              >
                Load: {example.skuName}
              </Button>
            ))}
          </div>
        }
      >
        <div className="space-y-6">
          <SkuFormFields
            sku={draftSku}
            onChange={setDraftSku}
            errors={draftErrors}
          />

          <Button
            type="button"
            variant="outline"
            className="hover:border-primary/40 hover:text-primary w-full gap-2 border-dashed"
            onClick={addSku}
          >
            <Plus className="size-4" />
            Add Another SKU
          </Button>

          <Controller
            control={control}
            name="skus"
            render={({ fieldState }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Configured SKUs ({skus.length})
                  </p>
                </div>
                <SkuTable
                  skus={skus}
                  onEdit={setEditingSku}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
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
      </FormSectionCard>

      <Dialog
        open={!!editingSku}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSku(null);
            setEditErrors({});
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit SKU</DialogTitle>
          </DialogHeader>
          {editingSku && (
            <SkuFormFields
              sku={editingSku}
              onChange={setEditingSku}
              errors={editErrors}
            />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingSku(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
