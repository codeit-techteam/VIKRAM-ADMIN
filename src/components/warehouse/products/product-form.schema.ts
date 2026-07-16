import { z } from "zod";

export const PRODUCT_CATEGORY_OPTIONS = [
  { value: "Cement", label: "Cement" },
  { value: "Steel", label: "Steel" },
  { value: "Aggregates", label: "Aggregates" },
  { value: "Bricks & Blocks", label: "Bricks & Blocks" },
] as const;

export const PRODUCT_UNIT_OPTIONS = [
  { value: "Bags", label: "Bags" },
  { value: "Tons", label: "Tons" },
  { value: "Units", label: "Units" },
] as const;

export const PRODUCT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

export const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z
    .string()
    .min(2, "SKU is required")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "SKU can only contain letters, numbers, and hyphens",
    ),
  category: z.enum(["Cement", "Steel", "Aggregates", "Bricks & Blocks"]),
  brand: z.string().min(1, "Brand is required"),
  unit: z.enum(["Bags", "Tons", "Units"]),
  stockUnits: z.coerce
    .number({ error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  status: z.enum(["ACTIVE", "LOW_STOCK", "INACTIVE"]),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;

export const PRODUCT_FORM_DEFAULT_VALUES: ProductFormSchema = {
  name: "",
  sku: "",
  category: "Cement",
  brand: "",
  unit: "Bags",
  stockUnits: 0,
  status: "ACTIVE",
};
