"use client";

import { IndianRupee } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { MaterialFormSchema } from "@/schema/material-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

function PriceInput({
  name,
  label,
  required,
}: {
  name:
    | "purchasePrice"
    | "sellingPrice"
    | "dealerPrice"
    | "bulkPrice"
    | "minimumOrderQuantity"
    | "maximumOrderQuantity"
    | "discountPercent";
  label: string;
  required?: boolean;
}) {
  const { control } = useFormContext<MaterialFormSchema>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label className={fieldLabelClassName}>
            {label}
            {required ? " *" : ""}
          </Label>
          <div className="relative">
            {(name === "purchasePrice" ||
              name === "sellingPrice" ||
              name === "dealerPrice" ||
              name === "bulkPrice") && (
              <IndianRupee className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            )}
            <Input
              type="number"
              min={0}
              className={
                name === "purchasePrice" ||
                name === "sellingPrice" ||
                name === "dealerPrice" ||
                name === "bulkPrice"
                  ? "pl-9"
                  : undefined
              }
              placeholder="0"
              value={field.value}
              onChange={(event) =>
                field.onChange(Number(event.target.value) || 0)
              }
              aria-invalid={!!fieldState.error}
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
  );
}

export function MaterialPricing() {
  const { control } = useFormContext<MaterialFormSchema>();

  return (
    <FormSectionCard icon={IndianRupee} title="Pricing">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <PriceInput name="purchasePrice" label="Purchase Price" required />
          <PriceInput name="sellingPrice" label="Selling Price" />
          <PriceInput name="dealerPrice" label="Dealer Price" />
          <PriceInput name="bulkPrice" label="Bulk Price" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <PriceInput
            name="minimumOrderQuantity"
            label="Minimum Order Quantity"
          />
          <PriceInput
            name="maximumOrderQuantity"
            label="Maximum Order Quantity"
          />
          <PriceInput name="discountPercent" label="Discount %" />
        </div>

        <Controller
          control={control}
          name="gstIncluded"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  GST Included in Price
                </p>
                <p className="text-xs text-gray-400">
                  Toggle if listed prices already include applicable GST.
                </p>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
