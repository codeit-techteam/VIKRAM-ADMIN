"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Image as ImageIcon,
  IndianRupee,
  Package,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  DELIVERY_SLA_OPTIONS,
  LAST_SAVED_LABEL,
  PRODUCT_FORM_DEFAULT_VALUES,
} from "@/features/catalog/constants/product-form.mock";
import {
  productFormSchema,
  type ProductFormSchema,
} from "@/features/catalog/schema/product-form.schema";
import {
  catalogService,
  type CatalogCategory,
  type CatalogProduct,
} from "@/services/catalog.service";
import { notify } from "@/utils/notify";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapProductToFormValues(product: CatalogProduct): ProductFormSchema {
  const retail = toNumber(product.retailPrice);
  const mrp = toNumber(product.mrp, retail);
  const httpImages = (product.images ?? []).filter((img) =>
    img.url?.startsWith("http"),
  );

  return {
    name: product.name ?? "",
    brand: product.brand?.trim() || PRODUCT_FORM_DEFAULT_VALUES.brand,
    category:
      product.category?.id ||
      product.categoryId ||
      PRODUCT_FORM_DEFAULT_VALUES.category,
    description:
      product.description?.trim() ||
      "<p>Update this product description for the Customer App.</p>",
    images: httpImages.map((img, index) => ({
      url: img.url,
      isMain: img.isPrimary ?? index === 0,
    })),
    mrp: mrp > 0 ? Math.max(mrp, retail) : Math.max(retail, 1),
    sellingPrice: retail > 0 ? retail : 1,
    currentStock: Math.max(0, product.stockLeft ?? 0),
    bulkTiers:
      product.bulkPrice != null && toNumber(product.bulkPrice) > 0
        ? [
            {
              minQty: Math.max(1, toNumber(product.bulkThreshold, 50)),
              discountPrice: toNumber(product.bulkPrice),
            },
          ]
        : [],
    deliverySla: "same_day",
  };
}

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const { control, handleSubmit, getValues, reset } =
    useForm<ProductFormSchema>({
      resolver: zodResolver(productFormSchema),
      defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bulkTiers",
  });

  useEffect(() => {
    void catalogService
      .listCategories()
      .then(setCategories)
      .catch((error) =>
        notify.error(
          error instanceof Error ? error.message : "Failed to load categories",
        ),
      );
  }, []);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    setLoadingProduct(true);

    void catalogService
      .getProduct(productId)
      .then((product) => {
        if (cancelled) return;
        reset(mapProductToFormValues(product));
      })
      .catch((error) => {
        if (cancelled) return;
        notify.error(
          error instanceof Error ? error.message : "Failed to load product",
        );
        router.push("/customer-app-cms/catalog");
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, reset, router]);

  const persist = async (data: ProductFormSchema, publish: boolean) => {
    setSaving(true);
    try {
      const imagePayload = data.images.map((img) => ({
        url: img.url,
        isPrimary: img.isMain,
      }));

      if (!imagePayload.some((img) => img.isPrimary) && imagePayload[0]) {
        imagePayload[0].isPrimary = true;
      }

      const firstTier = data.bulkTiers[0];
      const coreFields = {
        name: data.name.trim(),
        categoryId: data.category,
        brand: data.brand,
        description: data.description,
        retailPrice: data.sellingPrice,
        mrp: data.mrp,
        bulkPrice: firstTier?.discountPrice ?? null,
        bulkThreshold: firstTier?.minQty ?? 50,
        isVisible: publish,
        entityStatus: publish ? "ACTIVE" : "DRAFT",
      };

      if (isEdit && productId) {
        await catalogService.updateProduct(productId, coreFields);
        await catalogService.setImages(productId, imagePayload);
        notify.success(
          publish
            ? "Product updated — changes will show in the Customer App"
            : "Draft saved",
        );
      } else {
        const created = await catalogService.createProduct({
          name: coreFields.name,
          slug: slugify(data.name) || `product-${Date.now()}`,
          categoryId: coreFields.categoryId,
          brand: coreFields.brand,
          description: coreFields.description,
          retailPrice: coreFields.retailPrice,
          mrp: coreFields.mrp,
          bulkPrice: coreFields.bulkPrice ?? undefined,
          bulkThreshold: coreFields.bulkThreshold,
          unit: "Bag",
          imageUrls: data.images.map((img) => img.url),
          isVisible: publish,
          isFeatured: false,
        });

        if (!publish) {
          await catalogService.updateProduct(created.id, {
            entityStatus: "DRAFT",
            isVisible: false,
          });
        }

        if (imagePayload.length) {
          await catalogService.setImages(created.id, imagePayload);
        }

        notify.success(
          publish ? "Product published to Customer App" : "Draft saved",
        );
      }

      router.push("/customer-app-cms/catalog");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  const onSaveDraft = () => {
    const data = getValues();
    void persist(data, false);
  };

  const onPublish = (data: ProductFormSchema) => {
    void persist(data, true);
  };

  if (loadingProduct) {
    return (
      <p className="text-muted-foreground px-6 py-10 text-sm">
        Loading product…
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onPublish)}
      className="relative -mx-6 -mb-6 flex min-h-[calc(100vh-4rem)] flex-col"
    >
      <div className="flex-1 space-y-6 px-6 pt-0 pb-24">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/customer-app-cms/catalog" },
            { label: isEdit ? "Edit Product" : "Add New Product" },
          ]}
        />

        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {isEdit ? "Edit Industrial Product" : "Create Industrial Product"}
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
                    <Input
                      {...field}
                      placeholder="e.g. UltraTech"
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
                name="category"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabelClassName}>Category</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!fieldState.error}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
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
                      disabled={isEdit}
                      title={
                        isEdit
                          ? "Stock is managed via hub inventory"
                          : undefined
                      }
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
            disabled={saving}
            onClick={onSaveDraft}
          >
            Save Draft
          </Button>
          <Button type="submit" className="h-10 px-5" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
