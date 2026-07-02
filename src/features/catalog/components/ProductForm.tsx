"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Image as ImageIcon,
  IndianRupee,
  Package,
  Plus,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
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
import { BulkPricingTierRow } from "@/features/catalog/components/BulkPricingTierRow";
import { MediaUploadGrid } from "@/features/catalog/components/MediaUploadGrid";
import {
  BRAND_OPTIONS,
  CATEGORY_OPTIONS,
  DELIVERY_SLA_OPTIONS,
  LAST_SAVED_LABEL,
  PLACEHOLDER_GALLERY_IMAGES,
  PRODUCT_FORM_DEFAULT_VALUES,
} from "@/features/catalog/constants/product-form.mock";
import {
  productFormSchema,
  type ProductFormSchema,
} from "@/features/catalog/schema/product-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function ProductForm() {
  const { control, handleSubmit } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bulkTiers",
  });

  const onSaveDraft = () => {
    console.log("Save draft");
  };

  const onPublish = (data: ProductFormSchema) => {
    console.log("Publish product:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onPublish)}
      className="relative -mx-6 -mb-6 flex min-h-[calc(100vh-4rem)] flex-col"
    >
      <div className="flex-1 space-y-6 px-6 pt-0 pb-24">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/customer-app-cms/catalog" },
            { label: "Add New Product" },
          ]}
        />

        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Create Industrial Product
        </h1>

        <FormSectionCard icon={Package} title="Product Information">
          <div className="space-y-5">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="product-name" className={fieldLabelClassName}>
                    Product Name
                  </Label>
                  <Input
                    {...field}
                    id="product-name"
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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="brand"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabelClassName}>Brand</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAND_OPTIONS.map((option) => (
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
                name="category"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabelClassName}>Category</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
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
            </div>

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>Description</Label>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
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
        </FormSectionCard>

        <FormSectionCard icon={ImageIcon} title="Media Management">
          <Controller
            control={control}
            name="images"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <MediaUploadGrid
                  images={field.value}
                  onChange={field.onChange}
                  placeholderUrls={PLACEHOLDER_GALLERY_IMAGES}
                />
                {fieldState.error && (
                  <p className="text-destructive text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </FormSectionCard>

        <FormSectionCard icon={IndianRupee} title="Pricing & Inventory">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Controller
                control={control}
                name="mrp"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="mrp" className={fieldLabelClassName}>
                      MRP (₹)
                    </Label>
                    <Input
                      id="mrp"
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
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
                name="sellingPrice"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="selling-price"
                      className={fieldLabelClassName}
                    >
                      Selling Price (₹)
                    </Label>
                    <Input
                      id="selling-price"
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
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
                name="currentStock"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-stock"
                      className={fieldLabelClassName}
                    >
                      Current Stock
                    </Label>
                    <Input
                      id="current-stock"
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
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
            </div>

            <div className="space-y-3">
              <Label className={fieldLabelClassName}>Bulk Pricing Tiers</Label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <BulkPricingTierRow
                    key={field.id}
                    tier={field}
                    onDelete={() => remove(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => append({ minQty: 50, discountPrice: 400 })}
                className="hover:border-primary/40 hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-colors"
              >
                <Plus className="size-4" />
                Add Tier
              </button>
            </div>

            <div className="space-y-3">
              <Label className={fieldLabelClassName}>Delivery SLA</Label>
              <Controller
                control={control}
                name="deliverySla"
                render={({ field }) => (
                  <PillRadioGroup
                    options={DELIVERY_SLA_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </FormSectionCard>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="size-4" />
          <span>Last saved at {LAST_SAVED_LABEL}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            onClick={onSaveDraft}
          >
            Save Draft
          </Button>
          <Button type="submit" className="h-10 px-5">
            Publish Product
          </Button>
        </div>
      </div>
    </form>
  );
}
