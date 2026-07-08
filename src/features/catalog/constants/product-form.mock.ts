import type { ProductFormSchema } from "@/features/catalog/schema/product-form.schema";

export const BRAND_OPTIONS = [
  { value: "ultratech-cement", label: "UltraTech Cement" },
  { value: "tata-tiscon", label: "TATA Tiscon" },
  { value: "ambuja", label: "Ambuja" },
  { value: "bajriwala-local", label: "Bajriwala Local" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "construction-materials", label: "Construction Materials" },
  { value: "cement", label: "Cement" },
  { value: "steel", label: "Steel" },
  { value: "aggregates", label: "Aggregates" },
] as const;

export const PLACEHOLDER_GALLERY_IMAGES = [
  "https://picsum.photos/seed/ultratech-cement-bag/400/400",
  "https://picsum.photos/seed/wet-concrete/400/400",
  "https://picsum.photos/seed/cement-stack/400/400",
  "https://picsum.photos/seed/construction-site/400/400",
] as const;

export const DELIVERY_SLA_OPTIONS = [
  { value: "same_day" as const, label: "Same Day" },
  { value: "24_48h" as const, label: "24-48 Hours" },
  { value: "3_5d" as const, label: "3-5 Days" },
];

export const PRODUCT_FORM_DEFAULT_VALUES: ProductFormSchema = {
  name: "UltraTech Concrete - Premium Grade",
  brand: "ultratech-cement",
  category: "construction-materials",
  description:
    "<p>High-performance ready-mix concrete designed for structural applications. Engineered for superior durability, faster setting times, and excellent workability in demanding construction environments.</p>",
  images: [
    {
      url: PLACEHOLDER_GALLERY_IMAGES[0],
      isMain: true,
    },
    {
      url: PLACEHOLDER_GALLERY_IMAGES[1],
      isMain: false,
    },
  ],
  mrp: 450,
  sellingPrice: 415,
  currentStock: 1250,
  bulkTiers: [{ minQty: 100, discountPrice: 390 }],
  deliverySla: "same_day",
};

export const LAST_SAVED_LABEL = "02:45 PM";
