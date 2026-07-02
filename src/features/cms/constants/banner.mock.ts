import type {
  Banner,
  BannerModification,
} from "@/features/cms/types/banner.types";

export const BANNERS: Banner[] = [
  {
    id: "1",
    thumbnailUrl: "https://picsum.photos/seed/monsoon-cement/120/72",
    title: "Monsoon Cement Sale",
    location: "Regional - Maharashtra",
    ctaLabel: "Shop Now",
    ctaPath: "/category/cement",
    status: "LIVE",
  },
  {
    id: "2",
    thumbnailUrl: "https://picsum.photos/seed/ultratech-bulk/120/72",
    title: "UltraTech Bulk Discount",
    location: "All India",
    ctaLabel: "Get Quote",
    ctaPath: "/bulk-ultratech",
    status: "DRAFT",
  },
  {
    id: "3",
    thumbnailUrl: "https://picsum.photos/seed/machinery-arrival/120/72",
    title: "New Machinery Arrival",
    location: "Pan-Gujarat",
    ctaLabel: "Inquire",
    ctaPath: "/machinery-new",
    status: "LIVE",
  },
  {
    id: "4",
    thumbnailUrl: "https://picsum.photos/seed/machinery-arrival-2/120/72",
    title: "New Machinery Arrival",
    location: "Pan-Gujarat",
    ctaLabel: "Inquire",
    ctaPath: "/machinery-new",
    status: "LIVE",
  },
];

export const BANNER_MODIFICATIONS: BannerModification[] = [
  {
    id: "1",
    thumbnailUrl: "https://picsum.photos/seed/new-user-offer/80/80",
    name: "New User Offer",
    hubTargeting: "All India (Default)",
    status: "ACTIVE",
    clicks: 12482,
    updatedBy: "Rohan S.",
    updatedByAvatar: "https://picsum.photos/seed/rohan/32/32",
  },
  {
    id: "2",
    thumbnailUrl: "https://picsum.photos/seed/vendor-spotlight/80/80",
    name: "Premium Vendor Spotlight",
    hubTargeting: "NCR, Bengaluru, Mumbai",
    status: "SCHEDULED",
    clicks: 0,
    updatedBy: "Neha K.",
    updatedByAvatar: "https://picsum.photos/seed/neha/32/32",
  },
];
