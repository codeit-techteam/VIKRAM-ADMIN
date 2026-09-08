"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { Control } from "react-hook-form";
import { Controller, useFieldArray, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
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
import { Switch } from "@/components/ui/switch";
import { VariantFormDialog } from "@/features/catalog/components/VariantFormDialog";
import {
  VARIANT_ATTRIBUTES,
  calculateVariantDiscount,
  newVariantClientKey,
  resolveFormAttributeName,
  type ProductFormSchema,
  type ProductVariantFormValue,
} from "@/features/catalog/schema/product-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ProductVariantManagerProps {
  control: Control<ProductFormSchema>;
  onVariantsCommitted?: () => void;
}

export function ProductVariantManager({
  control,
  onVariantsCommitted,
}: ProductVariantManagerProps) {
  const hasVariants = useWatch({ control, name: "hasVariants" });
  const attribute = useWatch({ control, name: "variantAttribute" });
  const customAttributeName = useWatch({
    control,
    name: "customAttributeName",
  });
  const productUnit = useWatch({ control, name: "unit" });
  const productMrp = useWatch({ control, name: "mrp" });
  const productPrice = useWatch({ control, name: "sellingPrice" });
  const { fields, append, update, remove, move } = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldId",
  });
  const variants = useWatch({ control, name: "variants" }) ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const editingVariant =
    editingIndex != null ? (variants[editingIndex] ?? null) : null;
  const resolvedAttribute =
    resolveFormAttributeName(attribute, customAttributeName) || attribute;

  const openCreate = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSave = (variant: ProductVariantFormValue) => {
    if (editingIndex == null) {
      append({ ...variant, displayOrder: variants.length });
    } else {
      update(editingIndex, { ...variant, displayOrder: editingIndex });
    }
    queueMicrotask(() => onVariantsCommitted?.());
  };

  const duplicate = (index: number) => {
    const source = variants[index];
    if (!source) return;
    append({
      ...source,
      id: undefined,
      clientKey: newVariantClientKey(),
      sku: "",
      value: `${source.value} copy`,
      displayOrder: variants.length,
    });
    queueMicrotask(() => onVariantsCommitted?.());
  };

  return (
    <FormSectionCard
      icon={Layers}
      title="Product Variants"
      headerAction={
        <Controller
          control={control}
          name="hasVariants"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Has Variants</span>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="Has Variants"
              />
            </div>
          )}
        />
      }
    >
      {hasVariants ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <Controller
              control={control}
              name="variantAttribute"
              render={({ field }) => (
                <div className="min-w-[200px] max-w-xs space-y-2">
                  <Label className={fieldLabelClassName}>
                    Variant Attribute
                  </Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIANT_ATTRIBUTES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {attribute === "Custom" ? (
              <Controller
                control={control}
                name="customAttributeName"
                render={({ field, fieldState }) => (
                  <div className="min-w-[200px] max-w-xs space-y-2">
                    <Label className={fieldLabelClassName}>
                      Custom attribute name
                    </Label>
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. Finish, Grade, Shade"
                    />
                    {fieldState.error?.message ? (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                <tr>
                  <th className="px-3 py-2.5">Attribute</th>
                  <th className="px-3 py-2.5">Value</th>
                  <th className="px-3 py-2.5">Unit</th>
                  <th className="px-3 py-2.5">SKU</th>
                  <th className="px-3 py-2.5">MRP</th>
                  <th className="px-3 py-2.5">Selling Price</th>
                  <th className="px-3 py-2.5">Discount</th>
                  <th className="px-3 py-2.5">Stock</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-8 text-center text-sm text-gray-400"
                    >
                      No variants yet. Add any options this product sells — size,
                      weight, color, pack, dimensions, or a custom attribute.
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => {
                    const variant = variants[index] ?? field;
                    const discount = calculateVariantDiscount(
                      variant.mrp,
                      variant.price,
                    );
                    return (
                      <tr key={field.fieldId} className="border-t border-gray-50">
                        <td className="px-3 py-3 text-gray-600">
                          {resolvedAttribute || "—"}
                        </td>
                        <td className="px-3 py-3 font-medium text-[#1A1A1A]">
                          {variant.value || "—"}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {variant.unit || "—"}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {variant.sku || "—"}
                        </td>
                        <td className="px-3 py-3">{formatPrice(variant.mrp)}</td>
                        <td className="px-3 py-3 font-medium">
                          {formatPrice(variant.price)}
                        </td>
                        <td className="px-3 py-3 text-emerald-600">
                          {discount.percent > 0 ? `${discount.percent}%` : "—"}
                        </td>
                        <td className="px-3 py-3">{variant.stock}</td>
                        <td className="px-3 py-3">
                          <span
                            className={
                              variant.isActive
                                ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500"
                            }
                          >
                            {variant.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-1">
                            <IconButton
                              label="Move up"
                              disabled={index === 0}
                              onClick={() => move(index, index - 1)}
                            >
                              <ArrowUp className="size-3.5" />
                            </IconButton>
                            <IconButton
                              label="Move down"
                              disabled={index === fields.length - 1}
                              onClick={() => move(index, index + 1)}
                            >
                              <ArrowDown className="size-3.5" />
                            </IconButton>
                            <IconButton
                              label="Edit"
                              onClick={() => openEdit(index)}
                            >
                              <Pencil className="size-3.5" />
                            </IconButton>
                            <IconButton
                              label="Duplicate"
                              onClick={() => duplicate(index)}
                            >
                              <Copy className="size-3.5" />
                            </IconButton>
                            <IconButton
                              label="Delete"
                              onClick={() => {
                                remove(index);
                                queueMicrotask(() => onVariantsCommitted?.());
                              }}
                            >
                              <Trash2 className="size-3.5 text-red-500" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Controller
            control={control}
            name="variants"
            render={({ fieldState }) => (
              <p className="text-destructive text-sm">
                {fieldState.error?.message}
              </p>
            )}
          />

          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            Add Variant
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Turn this on to sell multiple options under one product — size, weight,
          volume, color, pack, dimensions, or a custom attribute. Each variant
          has its own unit, MRP, and selling price in the Customer App. Pricing
          stays on the product when variants are off.
        </p>
      )}

      <VariantFormDialog
        open={dialogOpen}
        attribute={attribute}
        customAttributeName={customAttributeName}
        defaultUnit={productUnit}
        defaultMrp={productMrp}
        defaultPrice={productPrice}
        initial={editingIndex != null ? editingVariant : null}
        existing={variants}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </FormSectionCard>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="hover:bg-gray-50 inline-flex size-8 items-center justify-center rounded-md text-gray-500 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
