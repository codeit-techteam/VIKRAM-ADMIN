import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().url(),
  isMain: z.boolean(),
});

const bulkTierSchema = z.object({
  minQty: z.number().int().positive("Min quantity must be positive"),
  discountPrice: z.number().positive("Discount price must be positive"),
});

export const deliverySlaValues = ["same_day", "24_48h", "3_5d"] as const;

export const productFormSchema = z
  .object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    brand: z.string().min(1, "Select a brand"),
    category: z.string().min(1, "Select a category"),
    description: z
      .string()
      .refine((val) => val.replace(/<[^>]*>/g, "").trim().length >= 10, {
        message: "Description must be at least 10 characters",
      }),
    images: z
      .array(productImageSchema)
      .min(1, "Add at least one product image"),
    mrp: z.number().positive("MRP must be a positive number"),
    sellingPrice: z.number().positive("Selling price must be positive"),
    currentStock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    bulkTiers: z.array(bulkTierSchema),
    deliverySla: z.enum(deliverySlaValues),
  })
  .refine((data) => data.sellingPrice <= data.mrp, {
    message: "Selling price must be less than or equal to MRP",
    path: ["sellingPrice"],
  });

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type BulkTier = z.infer<typeof bulkTierSchema>;
export type DeliverySla = (typeof deliverySlaValues)[number];
