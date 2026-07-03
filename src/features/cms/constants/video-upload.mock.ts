import type { SelectOption } from "@/types/common";

export interface ThumbnailFrame {
  id: string;
  imageUrl: string;
  duration: string;
}

export const VIDEO_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "brand-story", label: "Brand Story" },
  { value: "product-demo", label: "Product Demo" },
  { value: "tutorial", label: "Tutorial" },
  { value: "market-insights", label: "Market Insights" },
  { value: "safety-training", label: "Safety Training" },
];

export const VIDEO_AUDIENCE_OPTIONS: SelectOption[] = [
  { value: "all-users", label: "All Users" },
  { value: "contractors", label: "Contractors" },
  { value: "retailers", label: "Retailers" },
  { value: "enterprise", label: "Enterprise" },
];

export const PLACEMENT_OPTIONS = [
  { id: "home-screen-hero", label: "Home Screen Hero" },
  { id: "featured-videos", label: "Featured Videos Section" },
  { id: "product-detail-pages", label: "Product Detail Pages" },
  { id: "category-landing-pages", label: "Category Landing Pages" },
] as const;

export const CTA_DESTINATION_OPTIONS = [
  { value: "category", label: "Category Page" },
  { value: "product", label: "Product Page" },
  { value: "offer", label: "Offer / Promotion" },
  { value: "external", label: "External Link" },
] as const;

export const CTA_REDIRECT_OPTIONS: SelectOption[] = [
  { value: "/category/tmt-bars", label: "TMT Bars Category" },
  { value: "/category/cement", label: "Cement Category" },
  { value: "/offers/bulk-2024", label: "Bulk Offers 2024" },
  { value: "/products/ultratech-cement", label: "UltraTech Cement" },
  { value: "/training/safety", label: "Safety Training Hub" },
  { value: "custom", label: "Custom Path..." },
];

export const THUMBNAIL_FRAMES: ThumbnailFrame[] = [
  {
    id: "frame-1",
    imageUrl: "https://picsum.photos/seed/warehouse-interior/320/180",
    duration: "00:04",
  },
  {
    id: "frame-2",
    imageUrl: "https://picsum.photos/seed/welding-sparks/320/180",
    duration: "00:12",
  },
  {
    id: "frame-3",
    imageUrl: "https://picsum.photos/seed/worker-tablet/320/180",
    duration: "00:20",
  },
];

export const MOCK_UPLOAD_FILE = {
  name: "corporate_brand_story_final.mp4",
  progress: 74,
} as const;
