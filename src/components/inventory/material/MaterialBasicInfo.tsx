"use client";

import { Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { ImageUploader } from "@/components/inventory/material/ImageUploader";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MaterialFormSchema } from "@/schema/material-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

const PRODUCT_STATUS_OPTIONS = [
  { value: "active" as const, label: "Active" },
  { value: "inactive" as const, label: "Inactive" },
  { value: "draft" as const, label: "Draft" },
];

export function MaterialBasicInfo() {
  const { control } = useFormContext<MaterialFormSchema>();

  return (
    <FormSectionCard icon={Info} title="Basic Information">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="materialName"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="material-name" className={fieldLabelClassName}>
                  Material Name *
                </Label>
                <Input
                  {...field}
                  id="material-name"
                  placeholder="e.g. UltraTech OPC 53 Grade Cement"
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
            name="productDisplayName"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>
                  Product Display Name *
                </Label>
                <Input
                  {...field}
                  placeholder="Customer-facing product title"
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
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="shortDescription"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Short Description</Label>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Brief summary for listings and search results"
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="longDescription"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Long Description</Label>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Detailed product specifications and usage notes"
                />
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Controller
            control={control}
            name="mainImage"
            render={({ field }) => (
              <ImageUploader
                label="Material Image"
                images={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] ?? null)}
              />
            )}
          />

          <Controller
            control={control}
            name="galleryImages"
            render={({ field }) => (
              <ImageUploader
                label="Gallery Images"
                multiple
                maxImages={6}
                images={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Brand</Label>
                <Input {...field} placeholder="e.g. UltraTech" />
              </div>
            )}
          />

          <Controller
            control={control}
            name="manufacturer"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Manufacturer</Label>
                <Input {...field} placeholder="e.g. UltraTech Cement Ltd." />
              </div>
            )}
          />

          <Controller
            control={control}
            name="hsnCode"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>HSN Code</Label>
                <Input {...field} placeholder="e.g. 2523" />
              </div>
            )}
          />

          <Controller
            control={control}
            name="gstPercent"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>GST %</Label>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 28"
                />
              </div>
            )}
          />
        </div>

        <Controller
          control={control}
          name="productStatus"
          render={({ field }) => (
            <div className="space-y-3">
              <Label className={fieldLabelClassName}>Product Status</Label>
              <PillRadioGroup
                options={PRODUCT_STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                name="product-status"
              />
            </div>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
