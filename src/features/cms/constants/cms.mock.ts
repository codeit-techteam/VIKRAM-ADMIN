import type {
  CmsStatCardData,
  ContentUpdate,
  QuickActionData,
} from "@/features/cms/types/cms.types";

export const CMS_STAT_CARDS: CmsStatCardData[] = [
  { label: "ACTIVE PRODUCTS", value: "1,240" },
  { label: "CATALOGS", value: "18" },
  { label: "ACTIVE OFFERS", value: "12" },
  { label: "CUSTOMERS", value: "12.4k" },
  { label: "NOTIFICATIONS", value: "86" },
];

export const CMS_QUICK_ACTIONS: QuickActionData[] = [
  {
    id: "add-product",
    label: "Add Product",
    iconName: "shopping-cart",
    circleColor: "orange",
  },
  {
    id: "upload-banner",
    label: "Upload Banner",
    iconName: "upload",
    circleColor: "blue",
  },
  {
    id: "send-notification",
    label: "Send Notification",
    iconName: "send",
    circleColor: "indigo",
  },
  {
    id: "create-offer",
    label: "Create Offer",
    iconName: "tag",
    circleColor: "green",
  },
];

export const CONTENT_UPDATES: ContentUpdate[] = [
  {
    id: "1",
    assetName: "Winter Monsoon Sale Banner",
    subtitle: "Home Screen Carousel",
    thumbnailUrl: "https://picsum.photos/seed/winter-banner/80/80",
    type: "Banner",
    status: "Live",
    updatedBy: "Arjun Sharma",
    lastModified: "2h ago",
  },
  {
    id: "2",
    assetName: "Structural Steel Grade A",
    subtitle: "Premium Category Update",
    thumbnailUrl: "https://picsum.photos/seed/steel-category/80/80",
    type: "Category",
    status: "Draft",
    updatedBy: "Priya V.",
    lastModified: "5h ago",
  },
  {
    id: "3",
    assetName: "Bulk Cement Discount",
    subtitle: "Flash Offer",
    thumbnailUrl: "https://picsum.photos/seed/cement-offer/80/80",
    type: "Offer",
    status: "Expired",
    updatedBy: "System",
    lastModified: "Yesterday",
  },
];
