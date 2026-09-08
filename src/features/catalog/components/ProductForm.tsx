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
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

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
import {
  BRICK_GRADE_OPTIONS,
  BRICK_PRODUCT_TYPE_OPTIONS,
  isBricksCategory,
  isRmcCategory,
} from "@/constants/catalog-attributes";
import { BulkPricingTierRow } from "@/features/catalog/components/BulkPricingTierRow";
import { MediaUploadGrid } from "@/features/catalog/components/MediaUploadGrid";
import { ProductVariantManager } from "@/features/catalog/components/ProductVariantManager";
import {
  DELIVERY_SLA_OPTIONS,
  LAST_SAVED_LABEL,
  PRODUCT_FORM_DEFAULT_VALUES,
} from "@/features/catalog/constants/product-form.mock";
import {
  CATALOG_UNITS,
  VARIANT_ATTRIBUTES,
  calculateVariantDiscount,
  newVariantClientKey,
  productFormSchema,
  resolveFormAttributeName,
  type ProductFormSchema,
  type ProductVariantFormValue,
} from "@/features/catalog/schema/product-form.schema";
import {
  catalogService,
  type CatalogCategory,
  type CatalogProduct,
  type CatalogProductVariant,
  type CatalogVariantInput,
} from "@/services/catalog.service";
import { getApiErrorMessage } from "@/services/api";
import {
  attachCatalogCommerceMeta,
  commerceVariantKey,
  parseCatalogCommerceMeta,
  stripCatalogCommerceMeta,
} from "@/features/catalog/utils/catalog-commerce-meta";
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

function mapApiVariant(variant: CatalogProductVariant, index: number): ProductVariantFormValue {
  const price = toNumber(variant.sellingPrice ?? variant.price);
  const mrp = toNumber(variant.mrp, price);
  return {
    id: variant.id,
    clientKey: variant.id || newVariantClientKey(),
    value: variant.value || variant.label || "",
    unit: variant.unit || variant.sizeUnit || variant.displayUnit || "",
    sku: variant.sku || "",
    mrp: mrp > 0 ? Math.max(mrp, price) : price,
    price,
    stock: Math.max(0, variant.stock ?? 0),
    isActive: variant.isActive !== false,
    imageUrl: variant.imageUrl || "",
    displayOrder: variant.displayOrder ?? index,
  };
}

function isSuggestedAttribute(
  value: string | null | undefined,
): value is ProductFormSchema["variantAttribute"] {
  return (
    Boolean(value) &&
    VARIANT_ATTRIBUTES.includes(value as (typeof VARIANT_ATTRIBUTES)[number]) &&
    value !== "Custom"
  );
}

function mapMetaVariant(
  variant: {
    value: string;
    unit: string;
    sku?: string;
    mrp: number;
    price: number;
    stock: number;
    isActive: boolean;
  },
  index: number,
): ProductVariantFormValue {
  return {
    clientKey: newVariantClientKey(),
    value: variant.value,
    unit: variant.unit,
    sku: variant.sku || "",
    mrp: variant.mrp,
    price: variant.price,
    stock: variant.stock,
    isActive: variant.isActive,
    imageUrl: "",
    displayOrder: index,
  };
}

function mergeFormVariants(
  apiVariants: ProductVariantFormValue[],
  metaVariants: ProductVariantFormValue[],
): ProductVariantFormValue[] {
  if (metaVariants.length === 0) return apiVariants;
  if (apiVariants.length === 0) return metaVariants;
  const used = new Set(
    apiVariants.map((variant) => commerceVariantKey(variant.value, variant.unit)),
  );
  const extras = metaVariants.filter(
    (variant) => !used.has(commerceVariantKey(variant.value, variant.unit)),
  );
  return extras.length ? [...apiVariants, ...extras] : apiVariants;
}

function mapProductToFormValues(product: CatalogProduct): ProductFormSchema {
  const retail = toNumber(product.retailPrice);
  const mrp = toNumber(product.mrp, retail);
  const httpImages = (product.images ?? []).filter((img) =>
    img.url?.startsWith("http"),
  );
  const commerceMeta = parseCatalogCommerceMeta(product.description);
  const apiVariants = (product.variants ?? []).map(mapApiVariant);
  const metaVariants = (commerceMeta?.variants ?? []).map(mapMetaVariant);
  const variants = mergeFormVariants(apiVariants, metaVariants);
  const firstAttribute =
    product.variants?.[0]?.attribute?.trim() ||
    (product.variants?.[0]?.attributes
      ? Object.keys(product.variants[0].attributes)[0]
      : "") ||
    commerceMeta?.variantAttribute ||
    "";
  const variantAttribute = isSuggestedAttribute(firstAttribute)
    ? firstAttribute
    : firstAttribute
      ? "Custom"
      : isSuggestedAttribute(commerceMeta?.variantAttribute)
        ? commerceMeta.variantAttribute
        : "Size";
  const customAttributeName = isSuggestedAttribute(firstAttribute)
    ? ""
    : firstAttribute || commerceMeta?.customAttributeName || "";
  const cheapestUnit = [...variants].sort((a, b) => a.price - b.price)[0]?.unit;

  return {
    name: product.name ?? "",
    brand: product.brand?.trim() || PRODUCT_FORM_DEFAULT_VALUES.brand,
    category:
      product.category?.id ||
      product.categoryId ||
      PRODUCT_FORM_DEFAULT_VALUES.category,
    productType: product.productType ?? "",
    grade: product.grade ?? "",
    description:
      stripCatalogCommerceMeta(product.description)?.trim() ||
      "<p>Update this product description for the Customer App.</p>",
    images: httpImages.map((img, index) => ({
      url: img.url,
      isMain: img.isPrimary ?? index === 0,
    })),
    unit: (cheapestUnit || commerceMeta?.unit || product.unit || "Bag").trim(),
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
    hasVariants:
      Boolean(product.hasVariants) ||
      Boolean(commerceMeta?.hasVariants) ||
      variants.length > 0,
    variantAttribute,
    customAttributeName,
    variants,
  };
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomerAppPricePreview({
  mrp,
  sellingPrice,
  unit,
  variantLabel,
}: {
  mrp: number;
  sellingPrice: number;
  unit: string;
  variantLabel?: string;
}) {
  const discount = calculateVariantDiscount(mrp, sellingPrice);
  const unitLabel = unit.trim() || "unit";
  if (!(sellingPrice > 0)) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-[#F8FAFC] px-4 py-3">
      <p className="mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        Customer App preview
      </p>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-bold text-[#1A1A1A]">
          {formatInr(sellingPrice)}/{unitLabel}
        </span>
        {discount.percent > 0 ? (
          <>
            <span className="text-sm text-gray-400 line-through">
              {formatInr(mrp)}
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
              {discount.percent}% OFF
            </span>
          </>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {variantLabel
          ? `Add-to-cart shows this for ${variantLabel}. Quantity uses “${unitLabel}”.`
          : `Add-to-cart shows this price and “Add 1 ${unitLabel}”.`}
      </p>
    </div>
  );
}

function toVariantPayload(
  variant: ProductVariantFormValue,
  attribute: ProductFormSchema["variantAttribute"],
  customAttributeName: string,
  index: number,
): CatalogVariantInput {
  const resolved = resolveFormAttributeName(attribute, customAttributeName);
  const value = variant.value.trim();
  return {
    attribute: resolved || attribute,
    customAttribute: attribute === "Custom" ? customAttributeName.trim() : undefined,
    attributes: resolved ? { [resolved]: value } : undefined,
    value,
    unit: variant.unit.trim() || undefined,
    sku: variant.sku.trim() || undefined,
    price: variant.price,
    mrp: variant.mrp,
    stock: variant.stock,
    isActive: variant.isActive,
    imageUrl: variant.imageUrl.trim() || undefined,
    displayOrder: index,
  };
}

function commerceSnapshot(data: ProductFormSchema) {
  const cheapest = data.hasVariants
    ? [...data.variants].sort((a, b) => a.price - b.price)[0]
    : null;
  const unit = (cheapest?.unit || data.unit || "Bag").trim() || "Bag";
  return {
    unit,
    cheapest,
    description: attachCatalogCommerceMeta(data.description, {
      unit,
      hasVariants: data.hasVariants,
      variantAttribute: data.hasVariants
        ? resolveFormAttributeName(
            data.variantAttribute,
            data.customAttributeName,
          )
        : undefined,
      customAttributeName:
        data.hasVariants && data.variantAttribute === "Custom"
          ? data.customAttributeName.trim()
          : undefined,
      variants: data.hasVariants
        ? data.variants.map((variant) => ({
            value: variant.value.trim(),
            unit: variant.unit.trim(),
            sku: variant.sku.trim() || undefined,
            mrp: variant.mrp,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
          }))
        : undefined,
    }),
  };
}

async function syncProductVariants(
  productId: string,
  attribute: ProductFormSchema["variantAttribute"],
  customAttributeName: string,
  variants: ProductVariantFormValue[],
): Promise<ProductVariantFormValue[]> {
  const existing = await catalogService.listVariants(productId);
  const keptIds = new Set(variants.map((item) => item.id).filter(Boolean));

  for (const row of existing) {
    if (!keptIds.has(row.id)) {
      await catalogService.deleteVariant(productId, row.id);
    }
  }

  const saved: ProductVariantFormValue[] = [];
  for (const [index, variant] of variants.entries()) {
    const payload = toVariantPayload(
      variant,
      attribute,
      customAttributeName,
      index,
    );
    if (variant.id && existing.some((row) => row.id === variant.id)) {
      const updated = await catalogService.updateVariant(
        productId,
        variant.id,
        payload,
      );
      saved.push(mapApiVariant(updated, index));
    } else {
      const created = await catalogService.createVariant(productId, payload);
      saved.push(mapApiVariant(created, index));
    }
  }

  if (saved.length) {
    await catalogService.reorderVariants(
      productId,
      saved.map((item) => item.id).filter((id): id is string => Boolean(id)),
    );
  }
  return saved;
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
  const { control, handleSubmit, getValues, reset, setValue, setError } =
    useForm<ProductFormSchema>({
      resolver: zodResolver(productFormSchema),
      defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
    });
  const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bulkTiers",
  });

  const selectedCategoryId = useWatch({ control, name: "category" });
  const hasVariants = useWatch({ control, name: "hasVariants" });
  const formUnit = useWatch({ control, name: "unit" });
  const formMrp = useWatch({ control, name: "mrp" });
  const formSellingPrice = useWatch({ control, name: "sellingPrice" });
  const formVariants = useWatch({ control, name: "variants" }) ?? [];
  const previewVariant = hasVariants
    ? [...formVariants].sort((a, b) => a.price - b.price)[0]
    : undefined;
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );
  const showBrickFields = isBricksCategory(selectedCategory);
  const showRmcGrade = isRmcCategory(selectedCategory) && !showBrickFields;

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
      .then(async (product) => {
        let variants = product.variants ?? [];
        try {
          const listed = await catalogService.listVariants(productId);
          if (listed.length) variants = listed;
        } catch {
          // Product detail already includes variants; mapped list is preferred.
        }
        if (cancelled) return;
        reset(mapProductToFormValues({ ...product, variants }));
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

  useEffect(() => {
    return () => {
      if (publishTimer.current) clearTimeout(publishTimer.current);
    };
  }, []);

  const persist = async (data: ProductFormSchema, publish: boolean) => {
    const category = categories.find((item) => item.id === data.category);
    const bricks = isBricksCategory(category);
    const rmc = isRmcCategory(category) && !bricks;

    if (bricks) {
      if (!data.productType) {
        setError("productType", { message: "Select a brick type" });
        return;
      }
      if (!data.grade) {
        setError("grade", { message: "Select a grade" });
        return;
      }
    }

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
      const productType = bricks ? data.productType || null : null;
      const grade = bricks
        ? data.grade || null
        : rmc
          ? data.grade?.trim() || null
          : null;

      const snapshot = commerceSnapshot(data);
      const unit = snapshot.unit;
      const initialStock = data.hasVariants
        ? data.variants.reduce((sum, variant) => sum + variant.stock, 0)
        : data.currentStock;

      const coreFields = {
        name: data.name.trim(),
        categoryId: data.category,
        brand: data.brand,
        description: snapshot.description,
        retailPrice: snapshot.cheapest?.price ?? data.sellingPrice,
        mrp: snapshot.cheapest?.mrp ?? data.mrp,
        ...(firstTier?.discountPrice != null
          ? { bulkPrice: firstTier.discountPrice }
          : {}),
        bulkThreshold: firstTier?.minQty ?? 50,
        ...(productType ? { productType } : {}),
        ...(grade ? { grade } : {}),
        unit,
        isVisible: publish,
        entityStatus: publish ? "ACTIVE" : "DRAFT",
        hasVariants: data.hasVariants,
      };

      if (isEdit && productId) {
        await catalogService.updateProduct(productId, coreFields);
        await catalogService.setImages(productId, imagePayload);
        const savedVariants = await syncProductVariants(
          productId,
          data.variantAttribute,
          data.customAttributeName,
          data.hasVariants ? data.variants : [],
        );
        if (savedVariants.length) {
          setValue("variants", savedVariants);
        }
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
          productType: coreFields.productType,
          grade: coreFields.grade,
          unit: coreFields.unit,
          imageUrls: data.images.map((img) => img.url),
          isVisible: publish,
          isFeatured: false,
          hasVariants: data.hasVariants,
          initialStock,
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

        if (data.hasVariants) {
          await syncProductVariants(
            created.id,
            data.variantAttribute,
            data.customAttributeName,
            data.variants,
          );
        }

        notify.success(
          publish ? "Product published to Customer App" : "Draft saved",
        );
      }

      router.push("/customer-app-cms/catalog");
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Failed to save product"));
    } finally {
      setSaving(false);
    }
  };

  const publishVariantsToCustomerApp = async () => {
    if (!isEdit || !productId) return;
    const data = getValues();
    if (!data.hasVariants) return;
    const snapshot = commerceSnapshot(data);
    try {
      await catalogService.updateProduct(productId, {
        description: snapshot.description,
        retailPrice: snapshot.cheapest?.price ?? data.sellingPrice,
        mrp: snapshot.cheapest?.mrp ?? data.mrp,
        unit: snapshot.unit,
        hasVariants: true,
      });
      const savedVariants = await syncProductVariants(
        productId,
        data.variantAttribute,
        data.customAttributeName,
        data.variants,
      );
      if (savedVariants.length) {
        setValue("variants", savedVariants);
      }
      notify.success(
        "Variant is live — customers can choose this pack and add it to cart",
      );
    } catch (error) {
      notify.error(
        getApiErrorMessage(
          error,
          "Variant saved in the form. Click Update Product to publish it.",
        ),
      );
    }
  };

  const schedulePublishVariants = () => {
    if (publishTimer.current) clearTimeout(publishTimer.current);
    publishTimer.current = setTimeout(() => {
      void publishVariantsToCustomerApp();
    }, 400);
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
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const next = categories.find(
                          (category) => category.id === value,
                        );
                        if (isBricksCategory(next)) {
                          setValue("productType", "");
                          setValue("grade", "");
                          return;
                        }
                        if (isRmcCategory(next)) {
                          setValue("productType", "");
                          return;
                        }
                        setValue("productType", "");
                        setValue("grade", "");
                      }}
                    >
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

            {showBrickFields && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="productType"
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label className={fieldLabelClassName}>Brick Type</Label>
                      <Select
                        value={field.value || null}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select brick type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRICK_PRODUCT_TYPE_OPTIONS.map((option) => (
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
                  name="grade"
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label className={fieldLabelClassName}>Grade</Label>
                      <Select
                        value={field.value || null}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRICK_GRADE_OPTIONS.map((option) => (
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
            )}

            {showRmcGrade && (
              <Controller
                control={control}
                name="grade"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldLabelClassName}>
                      Grade (optional)
                    </Label>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g. M25"
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
            )}

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

        <ProductVariantManager
          control={control}
          onVariantsCommitted={() => {
            schedulePublishVariants();
          }}
        />

        <FormSectionCard icon={IndianRupee} title="Pricing & Inventory">
          <div className="space-y-6">
            {hasVariants ? (
              <>
                <p className="text-sm text-gray-500">
                  Product-level price, unit, and stock are taken from variants.
                  The Customer App add-to-cart sheet uses each variant&apos;s
                  selling price and unit (for example ₹10/Pack). Bulk pricing
                  still applies across all variants of this product.
                </p>
                {previewVariant ? (
                  <CustomerAppPricePreview
                    mrp={previewVariant.mrp}
                    sellingPrice={previewVariant.price}
                    unit={previewVariant.unit}
                    variantLabel={
                      [previewVariant.value, previewVariant.unit]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                  />
                ) : null}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <Controller
                    control={control}
                    name="unit"
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label htmlFor="product-unit" className={fieldLabelClassName}>
                          Unit
                        </Label>
                        <Input
                          {...field}
                          id="product-unit"
                          list="product-unit-options"
                          placeholder="e.g. Bag"
                          aria-invalid={!!fieldState.error}
                        />
                        <datalist id="product-unit-options">
                          {CATALOG_UNITS.map((option) => (
                            <option key={option} value={option} />
                          ))}
                        </datalist>
                        <p className="text-xs text-gray-400">
                          Shown in the app as ₹price/unit
                        </p>
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
                <CustomerAppPricePreview
                  mrp={formMrp}
                  sellingPrice={formSellingPrice}
                  unit={formUnit}
                />
              </>
            )}

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
