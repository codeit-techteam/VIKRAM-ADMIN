import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().url(),
  isMain: z.boolean(),
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  id: z.string().uuid().optional(),
});

const productVideoSchema = z.object({
  url: z.string().url(),
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  id: z.string().uuid().optional(),
});

const bulkTierSchema = z.object({
  minQty: z.number().int().positive("Min quantity must be positive"),
  discountPrice: z.number().positive("Discount price must be positive"),
});

export const deliverySlaValues = ["same_day", "24_48h", "3_5d"] as const;

export const CATALOG_UNITS = [
  "Bag",
  "Pack",
  "kg",
  "g",
  "L",
  "ml",
  "pcs",
  "Piece",
  "cft",
  "Cubic Meter",
  "Ton",
  "Box",
  "Packet",
  "Bundle",
  "Nos",
] as const;

export const VARIANT_ATTRIBUTES = [
  "Size",
  "Weight",
  "Volume",
  "Pack",
  "Dimensions",
  "Length",
  "Color",
  "Grade",
  "Model",
  "Capacity",
  "Material",
  "Finish",
  "Custom",
] as const;

export type VariantAttribute = (typeof VARIANT_ATTRIBUTES)[number];

const UNIT_REQUIRED_ATTRIBUTES = new Set([
  "Size",
  "Weight",
  "Volume",
  "Length",
  "Dimensions",
  "Capacity",
  "Pack",
]);

export function isUnitRequiredForAttribute(
  attribute: string,
  customName?: string,
): boolean {
  const resolved =
    attribute.trim().toLowerCase() === "custom"
      ? (customName?.trim() ?? "")
      : attribute.trim();
  return UNIT_REQUIRED_ATTRIBUTES.has(resolved);
}

export function resolveFormAttributeName(
  attribute: string,
  customName?: string,
): string {
  if (attribute.trim().toLowerCase() === "custom") {
    return customName?.trim() || "";
  }
  return attribute.trim();
}

const skuPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/;

export const productVariantFormSchema = z.object({
  id: z.string().uuid().optional(),
  clientKey: z.string().min(1),
  value: z.string().min(1, "Variant value is required").max(80),
  unit: z.string().max(20),
  sku: z.string().max(80),
  mrp: z.number().min(0, "MRP cannot be negative"),
  price: z.number().min(0, "Selling price cannot be negative"),
  stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  isActive: z.boolean(),
  imageUrl: z.string(),
  displayOrder: z.number().int().min(0),
});

export const productFormSchema = z
  .object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    brand: z.string().min(1, "Select a brand"),
    category: z.string().min(1, "Select a category"),
    productType: z.string().optional(),
    grade: z.string().optional(),
    description: z
      .string()
      .refine((val) => val.replace(/<[^>]*>/g, "").trim().length >= 10, {
        message: "Description must be at least 10 characters",
      }),
    images: z
      .array(productImageSchema)
      .min(1, "Add at least one product image")
      .max(6, "Maximum 6 product images are allowed"),
    video: productVideoSchema.nullable(),
    unit: z.string().max(30),
    mrp: z.number().min(0, "MRP cannot be negative"),
    sellingPrice: z.number().min(0, "Selling price cannot be negative"),
    currentStock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    bulkTiers: z.array(bulkTierSchema),
    deliverySla: z.enum(deliverySlaValues),
    hasVariants: z.boolean(),
    variantAttribute: z.enum(VARIANT_ATTRIBUTES),
    customAttributeName: z.string().max(80),
    variants: z.array(productVariantFormSchema),
  })
  .superRefine((data, ctx) => {
    if (data.hasVariants) {
      if (data.variantAttribute === "Custom" && !data.customAttributeName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customAttributeName"],
          message: "Enter a custom attribute name",
        });
      }

      if (data.variants.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Add at least one variant",
        });
      }

      const seen = new Set<string>();
      data.variants.forEach((variant, index) => {
        if (variant.mrp <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "mrp"],
            message: "MRP must be a positive number",
          });
        }
        if (variant.price <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "price"],
            message: "Selling price must be positive",
          });
        }
        if (variant.mrp < variant.price) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "price"],
            message: "Selling price must be less than or equal to MRP",
          });
        }
        if (
          isUnitRequiredForAttribute(
            data.variantAttribute,
            data.customAttributeName,
          ) &&
          !variant.unit.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "unit"],
            message: "Unit is required",
          });
        }
        const sku = variant.sku.trim();
        if (sku && !skuPattern.test(sku)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "sku"],
            message: "SKU must be 2–80 characters: letters, numbers, . _ -",
          });
        }
        const key = `${variant.value.trim().toLowerCase()}|${variant.unit.trim().toLowerCase()}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "value"],
            message: "Duplicate variant combination",
          });
        }
        seen.add(key);
      });
      return;
    }

    if (!data.unit.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unit"],
        message: "Unit is required (e.g. Bag, kg, L)",
      });
    }
    if (data.mrp <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mrp"],
        message: "MRP must be a positive number",
      });
    }
    if (data.sellingPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellingPrice"],
        message: "Selling price must be positive",
      });
    }
    if (data.sellingPrice > data.mrp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellingPrice"],
        message: "Selling price must be less than or equal to MRP",
      });
    }
  });

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVideo = z.infer<typeof productVideoSchema>;
export type BulkTier = z.infer<typeof bulkTierSchema>;
export type DeliverySla = (typeof deliverySlaValues)[number];
export type ProductVariantFormValue = z.infer<typeof productVariantFormSchema>;

export function calculateVariantDiscount(mrp: number, price: number) {
  if (!(mrp > 0) || mrp <= price) {
    return { amount: 0, percent: 0 };
  }
  const amount = Math.round((mrp - price) * 100) / 100;
  return { amount, percent: Math.round((amount / mrp) * 100) };
}

export function newVariantClientKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyVariant(
  displayOrder = 0,
  defaults?: { unit?: string; mrp?: number; price?: number },
): ProductVariantFormValue {
  return {
    clientKey: newVariantClientKey(),
    value: "",
    unit: defaults?.unit?.trim() ?? "",
    sku: "",
    mrp: Math.max(0, defaults?.mrp ?? 0),
    price: Math.max(0, defaults?.price ?? 0),
    stock: 0,
    isActive: true,
    imageUrl: "",
    displayOrder,
  };
}
