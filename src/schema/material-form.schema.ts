import { z } from "zod";

export const materialSkuSchema = z.object({
  id: z.string(),
  skuCode: z.string().min(1, "SKU code is required"),
  skuName: z.string().min(1, "SKU name is required"),
  variant: z.string(),
  size: z.string(),
  unit: z.string().min(1, "Unit is required"),
  minimumStock: z.number().min(0, "Minimum stock must be 0 or more"),
  maximumStock: z.number().min(0, "Maximum stock must be 0 or more"),
  barcode: z.string(),
  weight: z.string(),
  dimensions: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const materialFormSchema = z
  .object({
    materialName: z.string().min(1, "Material name is required"),
    productDisplayName: z.string(),
    shortDescription: z.string(),
    longDescription: z.string(),
    mainImage: z
      .object({
        id: z.string(),
        url: z.string(),
        name: z.string(),
        isMain: z.boolean().optional(),
      })
      .nullable(),
    galleryImages: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        name: z.string(),
        isMain: z.boolean().optional(),
      }),
    ),
    brand: z.string(),
    manufacturer: z.string(),
    hsnCode: z.string(),
    gstPercent: z.number().min(0).max(100),
    productStatus: z.enum(["active", "inactive", "draft"]),

    category: z.string().min(1, "Category is required"),
    subCategory: z.string(),
    tags: z.array(z.string()),
    searchKeywords: z.string(),

    skus: z.array(materialSkuSchema).min(1, "At least one SKU is required"),

    purchasePrice: z.number().min(0, "Purchase price is required"),
    sellingPrice: z.number().min(0),
    dealerPrice: z.number().min(0),
    bulkPrice: z.number().min(0),
    minimumOrderQuantity: z.number().min(0),
    maximumOrderQuantity: z.number().min(0),
    discountPercent: z.number().min(0).max(100),
    gstIncluded: z.boolean(),

    warehouse: z.string().min(1, "Warehouse is required"),
    defaultLocation: z.string(),
    rackNumber: z.string(),
    binNumber: z.string(),
    shelfNumber: z.string(),
    openingStock: z.number().min(0, "Opening stock is required"),
    warehouseMinimumStock: z.number().min(0),
    warehouseMaximumStock: z.number().min(0),
    reorderLevel: z.number().min(0),
    lowStockAlert: z.boolean(),
    allowInventoryTracking: z.enum(["yes", "no"]),
  })
  .refine((data) => data.purchasePrice > 0, {
    message: "Purchase price is required",
    path: ["purchasePrice"],
  });

export type MaterialFormSchema = z.infer<typeof materialFormSchema>;

export const step1Schema = materialFormSchema.pick({
  materialName: true,
  productDisplayName: true,
  shortDescription: true,
  longDescription: true,
  mainImage: true,
  galleryImages: true,
  brand: true,
  manufacturer: true,
  hsnCode: true,
  gstPercent: true,
  productStatus: true,
});

export const step2Schema = materialFormSchema.pick({
  category: true,
  subCategory: true,
  tags: true,
  searchKeywords: true,
});

export const step3Schema = materialFormSchema.pick({
  skus: true,
});

export const step4Schema = materialFormSchema
  .pick({
    purchasePrice: true,
    sellingPrice: true,
    dealerPrice: true,
    bulkPrice: true,
    minimumOrderQuantity: true,
    maximumOrderQuantity: true,
    discountPercent: true,
    gstIncluded: true,
  })
  .refine((data) => data.purchasePrice > 0, {
    message: "Purchase price is required",
    path: ["purchasePrice"],
  });

export const step5Schema = materialFormSchema.pick({
  warehouse: true,
  defaultLocation: true,
  rackNumber: true,
  binNumber: true,
  shelfNumber: true,
  openingStock: true,
  warehouseMinimumStock: true,
  warehouseMaximumStock: true,
  reorderLevel: true,
  lowStockAlert: true,
  allowInventoryTracking: true,
});

export const STEP_FIELD_NAMES = {
  1: [
    "materialName",
    "productDisplayName",
    "shortDescription",
    "longDescription",
    "mainImage",
    "galleryImages",
    "brand",
    "manufacturer",
    "hsnCode",
    "gstPercent",
    "productStatus",
  ],
  2: ["category", "subCategory", "tags", "searchKeywords"],
  3: ["skus"],
  4: [
    "purchasePrice",
    "sellingPrice",
    "dealerPrice",
    "bulkPrice",
    "minimumOrderQuantity",
    "maximumOrderQuantity",
    "discountPercent",
    "gstIncluded",
  ],
  5: [
    "warehouse",
    "defaultLocation",
    "rackNumber",
    "binNumber",
    "shelfNumber",
    "openingStock",
    "warehouseMinimumStock",
    "warehouseMaximumStock",
    "reorderLevel",
    "lowStockAlert",
    "allowInventoryTracking",
  ],
} as const;

export const STEP_SCHEMAS = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
} as const;
